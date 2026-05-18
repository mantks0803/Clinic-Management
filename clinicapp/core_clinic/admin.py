from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Doctor, Patient, Appointment, MedicalRecord, MedicalService, RecordService, Medicine, \
    MedicineBatch, Prescription, PrescriptionDetail, Invoice, Specialty

class MyUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'avatar')}),
    )

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialty')
    list_filter = ('specialty',)

admin.site.register(User, MyUserAdmin)
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