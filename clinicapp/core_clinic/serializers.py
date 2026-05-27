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
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        dob = validated_data.pop('dob', None)
        gender = validated_data.pop('gender', None)
        phone = validated_data.pop('phone', None)
        address = validated_data.pop('address', None)

        user = User.objects.create_user(**validated_data)

        if user.role == 'PATIENT':
            Patient.objects.create(
                user=user,
                full_name=f"{user.last_name} {user.first_name}",
                phone=phone or "",
                dob=dob,
                gender=gender or "MALE",
                address=address or ""
            )
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            avatar_url = instance.avatar.url if hasattr(instance.avatar, 'url') else str(instance.avatar)
            if not avatar_url.startswith('http'):
                clean_path = avatar_url.lstrip('/')
                if not clean_path.endswith('.jpg') and not clean_path.endswith('.png'):
                    data['avatar'] = f"https://res.cloudinary.com/dmhnfoc9i/image/upload/{clean_path}.jpg"
                else:
                    data['avatar'] = f"https://res.cloudinary.com/dmhnfoc9i/image/upload/{clean_path}"
            else:
                data['avatar'] = avatar_url
        else:
            data['avatar'] = None
        return data
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