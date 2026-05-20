from django.db import transaction
from django.db.models import Sum, F, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    User, Patient, Specialty, Doctor, Appointment,
    MedicalRecord, RecordService,
    Medicine, MedicineBatch, Prescription, PrescriptionDetail, Invoice
)
from .serializers import (
    UserSerializer, PatientSerializer, SpecialtySerializer, DoctorSerializer,
    AppointmentSerializer, MedicalRecordSerializer, RecordServiceSerializer,
    MedicineSerializer, MedicineBatchSerializer,
    PrescriptionSerializer, PrescriptionDetailSerializer, InvoiceSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    @action(methods=['get'], detail=False, url_path='current-user', permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]


class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filter_fields = ['specialty']
    search_fields = ['full_name']


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['status', 'appointment_date', 'patient', 'doctor']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_appointment(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != 'PENDING':
            return Response({"detail": "Chỉ có thể xác nhận lịch đang chờ!"}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = 'CONFIRMED'
        appointment.save()
        return Response({"detail": "Đã xác nhận lịch hẹn thành công!"}, status=status.HTTP_200_OK)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecordServiceViewSet(viewsets.ModelViewSet):
    queryset = RecordService.objects.all()
    serializer_class = RecordServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class MedicineBatchViewSet(viewsets.ModelViewSet):
    queryset = MedicineBatch.objects.all()
    serializer_class = MedicineBatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionDetailViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionDetail.objects.all()
    serializer_class = PrescriptionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        batch = serializer.validated_data['batch']
        qty = serializer.validated_data['quantity']

        if batch.quantity < qty:
            raise ValidationError(f"Không đủ thuốc! Lô {batch.batch_number} chỉ còn {batch.quantity} đơn vị.")

        batch.quantity -= qty
        batch.save()
        serializer.save()


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='payment')
    @transaction.atomic
    def payment(self, request, pk=None):
        invoice = self.get_object()
        appointment = invoice.appointment

        if invoice.status == 'PAID':
            return Response({"detail": "Hóa đơn này đã được thanh toán rồi!"}, status=status.HTTP_400_BAD_REQUEST)

        doc_fee = 300000

        services_total = RecordService.objects.filter(record__appointment=appointment).aggregate(
            total=Sum(F('service__price'))
        )['total'] or 0

        medicine_total = PrescriptionDetail.objects.filter(prescription__record__appointment=appointment).aggregate(
            total=Sum(F('quantity') * F('batch__selling_price'))
        )['total'] or 0

        invoice.total_amount = doc_fee + services_total + medicine_total
        invoice.status = 'PAID'
        invoice.save()

        return Response({
            "detail": "Thanh toán thành công!",
            "total_amount": invoice.total_amount
        }, status=status.HTTP_200_OK)


class ClinicStatisticsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_revenue = Invoice.objects.filter(status='PAID').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        patients_by_specialty = Appointment.objects.values(
            'doctor__specialty__name'
        ).annotate(
            total_patients=Count('patient', distinct=True)
        )

        return Response({
            "doanh_thu_tong": total_revenue,
            "benh_nhan_theo_khoa": patients_by_specialty
        })