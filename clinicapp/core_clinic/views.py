from django.db import transaction
from django.db.models import Sum, F, Count, Case, When, Value, CharField
from django.db.models.functions import ExtractYear
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, permissions, status, filters, parsers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from django.utils import timezone
from django.http import HttpResponse

from .models import (
    User, Patient, Specialty, Doctor, Appointment,
    MedicalRecord, RecordService, Medicine, MedicineBatch,
    Prescription, PrescriptionDetail, Invoice, MedicalService
)
from .serializers import (
    UserSerializer, PatientSerializer, SpecialtySerializer, DoctorSerializer,
    AppointmentSerializer, MedicalRecordSerializer, RecordServiceSerializer,
    MedicineSerializer, MedicineBatchSerializer,
    PrescriptionDetailSerializer, InvoiceSerializer,
    ServiceSerializer, PrescriptionSerializer
)
from .payos_provider import PayOSProvider


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
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['status', 'appointment_date', 'patient', 'doctor']

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False):
            return Appointment.objects.all().order_by('-id')
        if not user or not user.is_authenticated:
            return Appointment.objects.none()

        queryset = Appointment.objects.all().order_by('-id')
        if user.role == 'PATIENT':
            queryset = queryset.filter(patient__user=user)
        elif user.role == 'DOCTOR':
            queryset = queryset.filter(doctor__user=user)

        spec_name = self.request.query_params.get('specialty_name')
        if spec_name:
            queryset = queryset.filter(doctor__specialty__name=spec_name)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            for index, item in enumerate(data):
                obj = page[index]
                item['patient_name'] = obj.patient.full_name
                item['doctor_name'] = obj.doctor.full_name
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        for index, item in enumerate(data):
            obj = queryset[index]
            item['patient_name'] = obj.patient.full_name
            item['doctor_name'] = obj.doctor.full_name
        return Response(data)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_appointment(self, request, pk=None):
        if request.user.role != 'DOCTOR':
            return Response({"detail": "Quyền truy cập bị từ chối!"}, status=status.HTTP_403_FORBIDDEN)
        appointment = self.get_object()
        if appointment.status != 'PENDING':
            return Response({"detail": "Chỉ có thể xác nhận lịch đang chờ!"}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = 'CONFIRMED'
        appointment.save()
        return Response({"detail": "Đã xác nhận lịch hẹn thành công!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_appointment(self, request, pk=None):
        if request.user.role != 'DOCTOR':
            return Response({"detail": "Quyền truy cập bị từ chối!"}, status=status.HTTP_403_FORBIDDEN)
        appointment = self.get_object()
        if appointment.status != 'PENDING':
            return Response({"detail": "Chỉ có thể từ chối lịch đang chờ!"}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = 'CANCELLED'
        appointment.save()
        return Response({"detail": "Đã từ chối lịch hẹn thành công!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='examine')
    @transaction.atomic
    def examine_appointment(self, request, pk=None):
        if request.user.role != 'DOCTOR':
            return Response({"detail": "Quyền truy cập bị từ chối!"}, status=status.HTTP_403_FORBIDDEN)
        appointment = self.get_object()
        if appointment.status != 'CONFIRMED':
            return Response({"detail": "Lịch hẹn phải ở trạng thái Đã duyệt mới có thể khám!"},
                            status=status.HTTP_400_BAD_REQUEST)

        diagnosis = request.data.get('diagnosis')
        advice = request.data.get('advice', '')
        services = request.data.get('services', [])
        medicines = request.data.get('medicines', [])

        if not diagnosis:
            return Response({"detail": "Chẩn đoán bệnh không được để trống!"}, status=status.HTTP_400_BAD_REQUEST)

        record = MedicalRecord.objects.create(
            appointment=appointment,
            diagnosis=diagnosis,
            notes=advice
        )

        for svc_id in services:
            RecordService.objects.create(record=record, service_id=svc_id)

        if medicines:
            prescription = Prescription.objects.create(record=record)
            for med in medicines:
                batch = MedicineBatch.objects.get(pk=med['batch_id'])
                qty = int(med['quantity'])
                if batch.quantity < qty:
                    raise ValidationError(
                        f"Lô thuốc {batch.batch_number} chỉ còn {batch.quantity} đơn vị, không đủ kê đơn!")

                batch.quantity -= qty
                batch.save()

                PrescriptionDetail.objects.create(
                    prescription=prescription,
                    batch=batch,
                    quantity=qty,
                    dosage_instruction=med.get('instruction', '')
                )

        Invoice.objects.create(
            appointment=appointment,
            patient=appointment.patient,
            total_amount=300000,
            status='UNPAID'
        )

        appointment.status = 'COMPLETED'
        appointment.save()

        return Response({"detail": "Lập hồ sơ khám bệnh và kê đơn thành công!"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='medical-record')
    def medical_record(self, request, pk=None):
        appointment = self.get_object()
        try:
            record = MedicalRecord.objects.get(appointment=appointment)
            serializer = MedicalRecordSerializer(record, context={'request': request})
            data = serializer.data

            prescriptions_data = []
            prescriptions = Prescription.objects.filter(record=record)
            for p in prescriptions:
                details = PrescriptionDetail.objects.filter(prescription=p)
                for d in details:
                    med_name = "Thuốc"
                    if hasattr(d.batch, 'medicine') and d.batch.medicine:
                        med_name = d.batch.medicine.name
                    elif hasattr(d.batch, 'medicine_name'):
                        med_name = d.batch.medicine_name

                    prescriptions_data.append({
                        "id": d.id,
                        "medicine_name": med_name,
                        "quantity": d.quantity,
                        "dosage_instruction": d.dosage_instruction
                    })

            data["prescriptions"] = prescriptions_data
            return Response(data, status=status.HTTP_200_OK)
        except MedicalRecord.DoesNotExist:
            return Response({"detail": "Chưa có bệnh án cho lịch hẹn này"}, status=status.HTTP_404_NOT_FOUND)


class ServiceViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = MedicalService.objects.all().order_by('-id')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class MedicalRecordViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False):
            return MedicalRecord.objects.all().order_by('-id')
        if not user or not user.is_authenticated:
            return MedicalRecord.objects.none()

        queryset = MedicalRecord.objects.all().order_by('-id')
        if user.role == 'PATIENT':
            queryset = queryset.filter(appointment__patient__user=user)
        elif user.role == 'DOCTOR':
            queryset = queryset.filter(appointment__doctor__user=user)

        diag = self.request.query_params.get('diagnosis')
        if diag:
            queryset = queryset.filter(diagnosis=diag)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            for index, item in enumerate(data):
                obj = page[index]
                item['patient_name'] = obj.appointment.patient.full_name
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        for index, item in enumerate(data):
            obj = queryset[index]
            item['patient_name'] = obj.appointment.patient.full_name
        return Response(data)


class RecordServiceViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = RecordService.objects.all().order_by('-id')
    serializer_class = RecordServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class MedicineViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = Medicine.objects.all().order_by('-id')
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class MedicineBatchViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = MedicineBatch.objects.all().order_by('-id')
    serializer_class = MedicineBatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Prescription.objects.all().order_by('-id')
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionDetailViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = PrescriptionDetail.objects.all().order_by('-id')
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


class InvoiceViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer

    def get_permissions(self):
        if self.action in ['by_appointment', 'payos_payment', 'payos_callback']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_authentication(self, request):
        if self.action in ['by_appointment', 'payos_payment', 'payos_callback']:
            return
        super().perform_authentication(request)

    def get_queryset(self):
        user = self.request.user
        if getattr(self, 'swagger_fake_view', False):
            return Invoice.objects.all().order_by('-id')

        queryset = Invoice.objects.all().order_by('-id')
        if user.is_authenticated and user.role == 'PATIENT':
            queryset = queryset.filter(patient__user=user)

        region = self.request.query_params.get('region')
        if region == 'TPHCM':
            queryset = queryset.filter(appointment__patient__address__icontains='TPHCM')
        elif region == 'OTHER':
            queryset = queryset.exclude(appointment__patient__address__icontains='TPHCM')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            for index, item in enumerate(data):
                obj = page[index]
                item['patient_name'] = obj.patient.full_name
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        for index, item in enumerate(data):
            obj = queryset[index]
            item['patient_name'] = obj.patient.full_name
        return Response(data)

    @action(detail=False, methods=['get'], url_path='by-appointment')
    def by_appointment(self, request):
        app_id = request.query_params.get('appointment_id')
        try:
            invoice = Invoice.objects.get(appointment_id=app_id)
            appointment = invoice.appointment

            doc_fee = 300000
            services_total = RecordService.objects.filter(record__appointment=appointment).aggregate(
                total=Sum(F('service__price'))
            )['total'] or 0
            medicine_total = PrescriptionDetail.objects.filter(prescription__record__appointment=appointment).aggregate(
                total=Sum(F('quantity') * F('batch__selling_price'))
            )['total'] or 0

            invoice.total_amount = doc_fee + services_total + medicine_total
            invoice.save()

            return Response({
                "id": invoice.id,
                "status": invoice.status,
                "doc_fee": doc_fee,
                "services_total": services_total,
                "medicine_total": medicine_total,
                "total_amount": invoice.total_amount
            }, status=status.HTTP_200_OK)
        except Invoice.DoesNotExist:
            return Response({"detail": "Không tìm thấy hóa đơn cho lịch hẹn này"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='payos-payment')
    def payos_payment(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'PAID':
            return Response({"detail": "Hóa đơn này đã được thanh toán!"}, status=status.HTTP_400_BAD_REQUEST)

        provider = PayOSProvider(
            client_id="6034e4ba-0f39-486f-a024-e09f8768fc16",
            api_key="c2feb503-3f0d-4be7-afbe-25e852fb3741",
            checksum_key="17baf3da7ae973ddc2fab1864374c800869108488e1e835fd818a55c5d0f96d2"
        )

        timestamp_suffix = int(timezone.now().timestamp()) % 100000
        unique_order_code = invoice.id * 100000 + timestamp_suffix

        url = provider.create_payment_link(
            order_code=unique_order_code,
            amount=invoice.total_amount,
            description=f"Vien phi hdon {invoice.id}",
            return_url="http://192.168.100.155:8000/api/v1/invoices/payos-callback/",
            cancel_url="http://192.168.100.155:8000/api/v1/invoices/payos-callback/?status=cancel"
        )

        if not url:
            return Response({"detail": "Không thể tạo liên kết thanh toán từ PayOS"},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({"payment_url": url}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='payos-callback')
    def payos_callback(self, request):
        status_param = request.GET.dict().get('status')
        order_code = request.GET.dict().get('orderCode')

        if status_param != 'cancel' and order_code:
            try:
                real_invoice_id = int(order_code) // 100000
                invoice = Invoice.objects.get(pk=real_invoice_id)
                invoice.status = 'PAID'
                invoice.payment_method = 'PAYOS'
                invoice.paid_at = timezone.now()
                invoice.save()
            except Invoice.DoesNotExist:
                pass
        return HttpResponse("<script>window.location.href='https://payos.vn';</script>")


class ClinicStatisticsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_revenue = Invoice.objects.filter(status='PAID').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        revenue_tphcm = Invoice.objects.filter(
            status='PAID', appointment__patient__address__icontains='TPHCM'
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        revenue_tinh_khac = Invoice.objects.filter(status='PAID').exclude(
            appointment__patient__address__icontains='TPHCM'
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        gender_report = Patient.objects.values('gender').annotate(total=Count('id'))

        specialty_report = Appointment.objects.values(
            'doctor__specialty__name'
        ).annotate(
            total_patients=Count('patient', distinct=True)
        )

        age_report = Patient.objects.annotate(
            age=2026 - ExtractYear('dob')
        ).annotate(
            age_group=Case(
                When(age__lt=15, then=Value('Trẻ em')),
                When(age__gte=15, age__lte=30, then=Value('Thanh thiếu niên')),
                When(age__gte=31, age__lte=60, then=Value('Trung niên')),
                When(age__gt=60, then=Value('Người cao tuổi')),
                default=Value('Chưa cập nhật'),
                output_field=CharField()
            )
        ).values('age_group').annotate(total=Count('id'))

        service_report = RecordService.objects.values(
            'service__name'
        ).annotate(
            usage_count=Count('id')
        ).order_by('-usage_count')

        disease_report = MedicalRecord.objects.values(
            'diagnosis'
        ).annotate(
            disease_count=Count('id')
        ).order_by('-disease_count')

        return Response({
            "doanh_thu_tong": total_revenue,
            "doanh_thu_tphcm": revenue_tphcm,
            "doanh_thu_tinh_khac": revenue_tinh_khac,
            "benh_nhan_theo_gioi_tinh": list(gender_report),
            "benh_nhan_theo_khoa": list(specialty_report),
            "benh_nhan_theo_tuoi": list(age_report),
            "dich_vu_su_dung": list(service_report),
            "benh_pho_bien": list(disease_report)
        }, status=status.HTTP_200_OK)