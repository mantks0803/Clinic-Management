from .auth_views import UserViewSet, PatientViewSet
from .clinical_views import SpecialtyViewSet, DoctorViewSet, AppointmentViewSet, MedicalRecordViewSet
from .inventory_views import ServiceViewSet, RecordServiceViewSet, MedicineViewSet, MedicineBatchViewSet, PrescriptionViewSet, PrescriptionDetailViewSet
from .financial_views import InvoiceViewSet
from .analytics_views import ClinicStatisticsView, StaffNotificationView, PatientNotificationView