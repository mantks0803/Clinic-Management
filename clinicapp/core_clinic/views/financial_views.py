from django.db import transaction
from django.db.models import Sum, F
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Invoice, Appointment, RecordService, PrescriptionDetail
from ..serializers import InvoiceSerializer
from ..payos_provider import PayOSProvider


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

        base_url = request.build_absolute_uri('/').rstrip('/')
        return_url = f"{base_url}/api/v1/invoices/payos-callback/"
        cancel_url = f"{base_url}/api/v1/invoices/payos-callback/?status=cancel"

        url = provider.create_payment_link(
            order_code=unique_order_code,
            amount=invoice.total_amount,
            description=f"Vien phi hdon {invoice.id}",
            return_url=return_url,
            cancel_url=cancel_url
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