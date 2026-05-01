from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'specialties', views.SpecialtyViewSet)
router.register(r'doctors', views.DoctorViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'medicines', views.MedicineViewSet)
router.register(r'medicine-batches', views.MedicineBatchViewSet)
urlpatterns = router.urls