from rest_framework import serializers
from .models import (
    User, Specialty, Doctor, Patient, Appointment,
    MedicalRecord, RecordService, Medicine, MedicineBatch,
    Prescription, PrescriptionDetail, Invoice, MedicalService
)

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalService
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'image') and instance.image:
            data['image'] = instance.image.url
        if hasattr(instance, 'avatar') and instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

class SpecialtySerializer(ItemSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description', 'image']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    dob = serializers.DateField(write_only=True, required=False, allow_null=True)
    gender = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'role', 'avatar', 'patient', 'dob', 'gender', 'phone', 'address']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        avatar = validated_data.pop('avatar', None)
        role = validated_data.get('role', 'PATIENT')
        dob = validated_data.pop('dob', None)
        gender = validated_data.pop('gender', 'MALE')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
            role=role
        )

        if avatar:
            user.avatar = avatar
            user.save()

        if role == 'PATIENT':
            full_name = f"{user.last_name} {user.first_name}".strip()
            if not full_name:
                full_name = user.username

            Patient.objects.create(
                user=user,
                full_name=full_name,
                dob=dob,
                gender=gender,
                phone=phone,
                address=address
            )

        return user

class DoctorSerializer(serializers.ModelSerializer):
    specialty_name = serializers.ReadOnlyField(source='specialty.name')
    consultation_fee = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['id', 'full_name', 'specialty', 'specialty_name', 'consultation_fee', 'phone']

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