from django.db import transaction
from django.db.models import Sum, F, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, permissions, status, filters, parsers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    User, Patient, Specialty, Doctor, Appointment,
    MedicalRecord, RecordService, Medicine, MedicineBatch,
    Prescription, PrescriptionDetail, Invoice
)
from .serializers import (
    UserSerializer, PatientSerializer, SpecialtySerializer, DoctorSerializer,
    AppointmentSerializer, MedicalRecordSerializer, RecordServiceSerializer,
    MedicineSerializer, MedicineBatchSerializer,
    PrescriptionSerializer, PrescriptionDetailSerializer, InvoiceSerializer
)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = UserSerializer(u, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(UserSerializer(u).data, status=status.HTTP_200_OK)


class PatientViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]


class SpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]


class DoctorViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name']

    def get_queryset(self):
        queryset = Doctor.objects.all()
        specialty_id = self.request.query_params.get('specialty_id')
        if specialty_id:
            queryset = queryset.filter(specialty_id=specialty_id)
        return queryset


class AppointmentViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView):
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

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_appointment(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != 'PENDING':
            return Response({"detail": "Chỉ có thể từ chối lịch đang chờ!"}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = 'CANCELLED'
        appointment.save()
        return Response({"detail": "Đã từ chối lịch hẹn thành công!"}, status=status.HTTP_200_OK)

class MedicalRecordViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecordServiceViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = RecordService.objects.all()
    serializer_class = RecordServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class MedicineViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class MedicineBatchViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = MedicineBatch.objects.all()
    serializer_class = MedicineBatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionDetailViewSet(viewsets.ViewSet, generics.CreateAPIView):
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


class InvoiceViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
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