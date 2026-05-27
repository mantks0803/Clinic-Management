from django.db import transaction
from rest_framework import viewsets, generics, permissions, filters
from rest_framework.exceptions import ValidationError
from ..models import MedicalService, RecordService, Medicine, MedicineBatch, Prescription, PrescriptionDetail
from ..serializers import ServiceSerializer, RecordServiceSerializer, MedicineSerializer, MedicineBatchSerializer, PrescriptionSerializer, PrescriptionDetailSerializer


class ServiceViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = MedicalService.objects.all().order_by('-id')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]


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