from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from ..models import Specialty, Doctor, Appointment, MedicalRecord, RecordService, Prescription, PrescriptionDetail, Invoice, MedicineBatch
from ..serializers import SpecialtySerializer, DoctorSerializer, AppointmentSerializer, MedicalRecordSerializer


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

    @action(detail=True, methods=['get'], url_path='medical-record')
    def medical_record(self, request, pk=None):
        appointment = self.get_object()
        try:
            record = MedicalRecord.objects.get(appointment=appointment)
            serializer = MedicalRecordSerializer(record, context={'request': request})
            data = serializer.data

            services_data = []
            record_services = RecordService.objects.filter(record=record).select_related('service')
            for rs in record_services:
                services_data.append({
                    "id": rs.id,
                    "service_name": rs.service.name,
                    "price": rs.service.price
                })
            data["services"] = services_data

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

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_appointment(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status not in ['PENDING', 'CONFIRMED']:
            return Response({"detail": "Không thể hủy lịch hẹn ở trạng thái này!"}, status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('reason')
        if not reason:
            return Response({"detail": "Vui lòng cung cấp lý do hủy lịch!"}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = 'CANCELLED'
        appointment.cancel_reason = reason
        appointment.save()
        return Response({"detail": "Đã hủy lịch hẹn thành công!"}, status=status.HTTP_200_OK)


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