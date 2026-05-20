import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinicapp.settings')
django.setup()
#python manage.py flush để xóa db cũ !!!
from core_clinic.models import (
    User, Specialty, Doctor, Patient, Medicine, MedicineBatch, MedicalService
)
from django.utils import timezone

PASSWORD = 'Th@nhman08032005'

def run():
    # 1. Tạo Admin
    admin, _ = User.objects.get_or_create(username='admin3', role='ADMIN', defaults={'first_name': 'Admin', 'last_name': 'Hệ thống'})
    admin.set_password(PASSWORD)
    admin.is_superuser = True
    admin.is_staff = True
    admin.save()
    print('✅ Đã tạo Admin: admin3')

    # 2. Tạo Chuyên khoa
    specs = ['Nội tổng quát', 'Tai Mũi Họng', 'Nhi khoa', 'Da liễu']
    spec_objs = {name: Specialty.objects.get_or_create(name=name, defaults={'description': f'Chuyên khoa {name}'})[0] for name in specs}
    print('✅ Đã tạo Chuyên khoa')

    # 3. Tạo Bác sĩ (Thêm họ tên đầy đủ)
    doctors_data = [
        {'username': 'bacsi1', 'first': 'Nguyễn', 'last': 'Lan', 'spec': spec_objs['Nội tổng quát'], 'phone': '0901234567'},
        {'username': 'bacsi2', 'first': 'Trần', 'last': 'Nam', 'spec': spec_objs['Tai Mũi Họng'], 'phone': '0901112223'}
    ]
    for d in doctors_data:
        u, _ = User.objects.get_or_create(username=d['username'], role='DOCTOR', defaults={'first_name': d['first'], 'last_name': d['last']})
        u.set_password(PASSWORD)
        u.save()
        Doctor.objects.get_or_create(user=u, specialty=d['spec'], full_name=f"{d['first']} {d['last']}", phone=d['phone'])
    print('✅ Đã tạo Bác sĩ')

    # 4. Tạo Bệnh nhân (Thêm thông tin đầy đủ)
    patients_data = [
        {'username': 'benhnhan1', 'first': 'Lê', 'last': 'Ngọc', 'phone': '0912345678', 'gender': 'FEMALE'},
        {'username': 'benhnhan2', 'first': 'Phạm', 'last': 'Hùng', 'phone': '0987654321', 'gender': 'MALE'}
    ]
    for p in patients_data:
        u, _ = User.objects.get_or_create(username=p['username'], role='PATIENT', defaults={'first_name': p['first'], 'last_name': p['last']})
        u.set_password(PASSWORD)
        u.save()
        Patient.objects.get_or_create(user=u, full_name=f"{p['first']} {p['last']}", phone=p['phone'], gender=p['gender'])
    print('✅ Đã tạo Bệnh nhân')

    # 5. Tạo Dịch vụ y tế (Để test hóa đơn sau này)
    services = [
        {'name': 'Siêu âm tổng quát', 'price': 200000},
        {'name': 'Xét nghiệm máu', 'price': 150000},
        {'name': 'Chụp X-Quang', 'price': 300000}
    ]
    for s in services:
        MedicalService.objects.get_or_create(name=s['name'], defaults={'price': s['price']})
    print('✅ Đã tạo Dịch vụ y tế')

    # 6. Tạo Thuốc & Lô thuốc (Đầy đủ)
    medicines = [
        {'name': 'Paracetamol', 'unit': 'Viên', 'price': 5000},
        {'name': 'Amoxicillin', 'unit': 'Viên', 'price': 12000},
        {'name': 'Vitamin C', 'unit': 'Viên', 'price': 3000}
    ]
    for m in medicines:
        med, _ = Medicine.objects.get_or_create(name=m['name'], defaults={'unit': m['unit'], 'description': 'Thuốc chất lượng cao'})
        MedicineBatch.objects.get_or_create(
            medicine=med,
            batch_number=f"BATCH-{m['name'][:3].upper()}",
            defaults={
                'quantity': 1000,
                'import_date': timezone.now().date(),
                'expiration_date': '2027-12-31',
                'selling_price': m['price']
            }
        )
    print('✅ Đã tạo Thuốc & Lô thuốc')

if __name__ == '__main__':
    run()