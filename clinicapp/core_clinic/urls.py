from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'users', views.UserViewSet)
router.register(r'patients', views.PatientViewSet)
router.register(r'specialties', views.SpecialtyViewSet)
router.register(r'doctors', views.DoctorViewSet)
router.register(r'appointments', views.AppointmentViewSet, basename='appointments')
router.register(r'medical-records', views.MedicalRecordViewSet, basename='medical-records')
router.register(r'services', views.ServiceViewSet, basename='services')
router.register(r'record-services', views.RecordServiceViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'medicine-batches', views.MedicineBatchViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'prescription-details', views.PrescriptionDetailViewSet)
router.register(r'invoices', views.InvoiceViewSet, basename='invoices')

urlpatterns = [
    path('statistics/', views.ClinicStatisticsView.as_view(), name='clinic-statistics'),
    path('notifications/staff/', views.StaffNotificationView.as_view(), name='staff-notifications'),
    path('notifications/patient/', views.PatientNotificationView.as_view(), name='patient-notifications'),
] + router.urls