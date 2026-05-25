import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinicapp.settings')
django.setup()

from core_clinic.models import (
    User, Specialty, Doctor, Patient, Appointment,
    MedicalRecord, MedicalService, RecordService,
    Medicine, MedicineBatch, Prescription, PrescriptionDetail, Invoice
)
from django.utils import timezone

PASSWORD = 'Th@nhman08032005'

def clean_old_data():
    Invoice.objects.all().delete()
    PrescriptionDetail.objects.all().delete()
    Prescription.objects.all().delete()
    RecordService.objects.all().delete()
    MedicalRecord.objects.all().delete()
    Appointment.objects.all().delete()
    Doctor.objects.all().delete()
    Patient.objects.all().delete()
    MedicineBatch.objects.all().delete()
    Medicine.objects.all().delete()
    MedicalService.objects.all().delete()
    Specialty.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

def run_seed():
    clean_old_data()

    specs_data = ['Nội tổng quát', 'Tai Mũi Họng', 'Nhi khoa', 'Da liễu']
    spec_objs = {}
    for name in specs_data:
        spec, _ = Specialty.objects.get_or_create(name=name, defaults={'description': f'Khoa {name}'})
        spec_objs[name] = spec

    docs_data = [
        {'username': 'dr_lan', 'first': 'Nguyễn', 'last': 'Lan', 'spec': spec_objs['Nội tổng quát'], 'phone': '0901234567'},
        {'username': 'dr_nam', 'first': 'Trần', 'last': 'Nam', 'spec': spec_objs['Tai Mũi Họng'], 'phone': '0901112223'},
        {'username': 'dr_huong', 'first': 'Lê', 'last': 'Hương', 'spec': spec_objs['Nhi khoa'], 'phone': '0903334445'},
        {'username': 'dr_minh', 'first': 'Phạm', 'last': 'Minh', 'spec': spec_objs['Da liễu'], 'phone': '0905556667'},
    ]
    doctor_list = []
    for d in docs_data:
        u = User.objects.create(username=d['username'], role='DOCTOR', first_name=d['first'], last_name=d['last'])
        u.set_password(PASSWORD)
        u.save()
        doc = Doctor.objects.create(user=u, specialty=d['spec'], full_name=f"{d['first']} {d['last']}", phone=d['phone'])
        doctor_list.append(doc)

    patients_data = [
        {'username': 'pat_an', 'first': 'Nguyễn', 'last': 'An', 'gender': 'MALE', 'address': 'Quận 7, TPHCM'},
        {'username': 'pat_binh', 'first': 'Lê', 'last': 'Bình', 'gender': 'MALE', 'address': 'Quận 1, TPHCM'},
        {'username': 'pat_chi', 'first': 'Trần', 'last': 'Chi', 'gender': 'FEMALE', 'address': 'Huyện Nhà Bè, TPHCM'},
        {'username': 'pat_dung', 'first': 'Phạm', 'last': 'Dũng', 'gender': 'MALE', 'address': 'Quận 5, TPHCM'},
        {'username': 'pat_giang', 'first': 'Hoàng', 'last': 'Giang', 'gender': 'FEMALE', 'address': 'Tỉnh Đồng Nai'},
        {'username': 'pat_hai', 'first': 'Vũ', 'last': 'Hải', 'gender': 'MALE', 'address': 'Tỉnh Long An'},
        {'username': 'pat_khanh', 'first': 'Phan', 'last': 'Khánh', 'gender': 'FEMALE', 'address': 'Tỉnh Bình Dương'},
        {'username': 'pat_linh', 'first': 'Đỗ', 'last': 'Linh', 'gender': 'FEMALE', 'address': 'Thành phố Cần Thơ'},
        {'username': 'pat_minh', 'first': 'Ngô', 'last': 'Minh', 'gender': 'MALE', 'address': 'Quận 3, TPHCM'},
        {'username': 'pat_ngoc', 'first': 'Đặng', 'last': 'Ngọc', 'gender': 'FEMALE', 'address': 'Tỉnh Đồng Nai'},
        {'username': 'pat_oanh', 'first': 'Bùi', 'last': 'Oanh', 'gender': 'FEMALE', 'address': 'Tỉnh Bình Dương'},
        {'username': 'pat_phuc', 'first': 'Võ', 'last': 'Phúc', 'gender': 'MALE', 'address': 'Tỉnh Long An'},
    ]
    patient_list = []
    for p in patients_data:
        u = User.objects.create(username=p['username'], role='PATIENT', first_name=p['first'], last_name=p['last'])
        u.set_password(PASSWORD)
        u.save()
        pat = Patient.objects.create(user=u, full_name=f"{p['first']} {p['last']}", phone='0912345678', gender=p['gender'], address=p['address'])
        patient_list.append(pat)

    svcs_data = [
        {'name': 'Siêu âm tổng quát', 'price': 200000},
        {'name': 'Xét nghiệm máu', 'price': 150000},
        {'name': 'Chụp X-Quang', 'price': 300000}
    ]
    service_list = []
    for s in svcs_data:
        svc = MedicalService.objects.create(name=s['name'], price=s['price'])
        service_list.append(svc)

    meds_data = [
        {'name': 'Paracetamol', 'unit': 'Viên', 'price': 5000},
        {'name': 'Amoxicillin', 'unit': 'Viên', 'price': 12000},
        {'name': 'Vitamin C', 'unit': 'Viên', 'price': 3000}
    ]
    batch_list = []
    for m in meds_data:
        med = Medicine.objects.create(name=m['name'], unit=m['unit'])
        batch = MedicineBatch.objects.create(
            medicine=med, batch_number=f"BATCH-{m['name'][:3].upper()}",
            quantity=5000, import_date=date.today(),
            expiration_date=date(2028, 12, 31), selling_price=m['price']
        )
        batch_list.append(batch)

    cases = [
        {'diag': 'Sốt siêu vi', 'symp': 'Sốt cao, đau đầu', 'slots': '08:00-08:30'},
        {'diag': 'Sốt xuất huyết', 'symp': 'Sốt cao, phát ban', 'slots': '08:30-09:00'},
        {'diag': 'Viêm họng cấp (ho nhiều)', 'symp': 'Đau họng, ho kéo dài', 'slots': '09:00-09:30'},
        {'diag': 'Cảm cúm (ho, sốt)', 'symp': 'Sổ mũi, sốt nhẹ, ho nhẹ', 'slots': '14:00-14:30'},
        {'diag': 'Viêm phế quản (ho cấp tính)', 'symp': 'Ho có đờm, mệt mỏi', 'slots': '14:30-15:00'},
        {'diag': 'Sốt nhiễm khuẩn', 'symp': 'Sốt lạnh run', 'slots': '15:00-15:30'},
        {'diag': 'Viêm da cơ địa', 'symp': 'Ngứa da, mẩn đỏ', 'slots': '08:00-08:30'},
        {'diag': 'Nhiễm trùng đường hô hấp (ho, sốt)', 'symp': 'Ho khan, sốt cao', 'slots': '08:30-09:00'},
        {'diag': 'Viêm amidan (ho, đau họng)', 'symp': 'Nuốt đau, ho khàn tiếng', 'slots': '09:00-09:30'},
        {'diag': 'Dị ứng thời tiết', 'symp': 'Hắt hơi, ngứa mũi', 'slots': '14:00-14:30'},
    ]

    base_date = date.today() - timedelta(days=5)
    case_idx = 0

    for i in range(14):
        current_date = base_date + timedelta(days=(i // 3))
        patient = patient_list[i % len(patient_list)]
        doctor = doctor_list[i % len(doctor_list)]
        c = cases[case_idx % len(cases)]
        case_idx += 1

        app = Appointment.objects.create(
            patient=patient, doctor=doctor,
            appointment_date=current_date, time_slot=c['slots'],
            status='COMPLETED', reason='Khám bệnh định kỳ'
        )

        record = MedicalRecord.objects.create(
            appointment=app, symptoms=c['symp'], diagnosis=c['diag'], notes='Uống thuốc đều đặn'
        )

        if i % 2 == 0:
            RecordService.objects.create(record=record, service=random.choice(service_list), status='DONE')

        prescription = Prescription.objects.create(record=record)
        for b in batch_list:
            PrescriptionDetail.objects.create(
                prescription=prescription, batch=b,
                quantity=random.randint(5, 10), dosage_instruction='Ngày uống 2 lần'
            )

        fee = 300000
        for s in record.services.all():
            fee += int(s.service.price)
        for d in prescription.details.all():
            fee += int(d.quantity * d.batch.selling_price)

        Invoice.objects.create(
            patient=patient, appointment=app, total_amount=fee,
            payment_method='PAYOS' if i % 4 != 0 else 'CASH',
            status='PAID' if i % 5 != 0 else 'UNPAID',
            paid_at=timezone.now() if i % 5 != 0 else None
        )

if __name__ == '__main__':
    run_seed()
    print("OK!")