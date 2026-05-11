from rest_framework import serializers
from .models import (
    User, Specialty, Doctor, Patient, Appointment,
    MedicalRecord, MedicalService, RecordService,
    Medicine, MedicineBatch, Prescription, PrescriptionDetail, Invoice
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']

class DoctorSerializer(serializers.ModelSerializer):
    specialty_name = serializers.ReadOnlyField(source='specialty.name')
    consultation_fee = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['id', 'full_name', 'specialty', 'specialty_name', 'consultation_fee']

    def get_consultation_fee(self, obj):
        return 300000

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.full_name')

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class MedicineBatchSerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='medicine.name')

    class Meta:
        model = MedicineBatch
        fields = '__all__'

class RecordServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = RecordService
        fields = '__all__'

class MedicalRecordSerializer(serializers.ModelSerializer):
    services = RecordServiceSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'

class PrescriptionDetailSerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='batch.medicine.name')

    class Meta:
        model = PrescriptionDetail
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    details = PrescriptionDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['total_amount', 'status']