from datetime import timedelta
from django.db.models import Sum, Count, Case, When, Value, CharField, Q
from django.db.models.functions import ExtractYear
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Invoice, Patient, Appointment, RecordService, MedicalRecord, MedicineBatch


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


class StaffNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        expire_threshold = today + timedelta(days=14)

        batches = MedicineBatch.objects.filter(
            Q(quantity__lt=50) | Q(expiration_date__lte=expire_threshold)
        ).select_related('medicine')

        notifications = []
        for b in batches:
            if b.quantity < 50:
                notifications.append({
                    "id": f"qty-{b.id}",
                    "type": "DANGER",
                    "title": "Cảnh báo hết hàng",
                    "message": f"Thuốc {b.medicine.name} (Lô: {b.batch_number}) chỉ còn {b.quantity} viên trong kho."
                })
            if b.expiration_date <= expire_threshold:
                notifications.append({
                    "id": f"exp-{b.id}",
                    "type": "WARNING",
                    "title": "Cảnh báo hết hạn",
                    "message": f"Lô {b.batch_number} của thuốc {b.medicine.name} sắp hết hạn vào ngày {b.expiration_date}."
                })
        return Response(notifications, status=status.HTTP_200_OK)


class PatientNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        future_threshold = today + timedelta(days=7)

        appointments = Appointment.objects.filter(
            patient__user=request.user,
            appointment_date__gte=today,
            appointment_date__lte=future_threshold
        ).select_related('doctor')

        notifications = []
        for app in appointments:
            notifications.append({
                "id": f"app-{app.id}",
                "type": "INFO",
                "title": "Lịch khám sắp tới",
                "message": f"Bạn có lịch khám {app.doctor.full_name} vào ngày {app.appointment_date} khung giờ {app.time_slot}. Vui lòng đến đúng giờ."
            })
        return Response(notifications, status=status.HTTP_200_OK)