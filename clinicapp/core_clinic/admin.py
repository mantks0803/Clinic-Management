from django.contrib import admin
from .models import Specialty, Doctor, Patient, Appointment, MedicalRecord, MedicalService, RecordService, Medicine, MedicineBatch, Prescription, PrescriptionDetail, Invoice

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialty')
    list_filter = ('specialty',)

admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(MedicalRecord)
admin.site.register(MedicalService)
admin.site.register(RecordService)
admin.site.register(Medicine)
admin.site.register(MedicineBatch)
admin.site.register(Prescription)
admin.site.register(PrescriptionDetail)
admin.site.register(Invoice)