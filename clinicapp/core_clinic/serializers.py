from rest_framework import serializers

from .models import Specialty, Doctor, Appointment, Medicine, MedicineBatch


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']


class DoctorSerializer(serializers.ModelSerializer):
    specialty_name = serializers.ReadOnlyField(source='specialty.name')

    class Meta:
        model = Doctor
        fields = ['id', 'full_name', 'specialty', 'specialty_name']


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
