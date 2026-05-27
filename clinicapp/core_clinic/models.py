from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db.models import CheckConstraint, Q


class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Bác sĩ'),
        ('PATIENT', 'Bệnh nhân'),
        ('STAFF', 'Nhân viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PATIENT')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Tên chuyên khoa")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    image = models.ImageField(upload_to='specialties/', null=True, blank=True, verbose_name="Ảnh đại diện")

    class Meta:
        verbose_name = "Chuyên khoa"
        verbose_name_plural = "Chuyên khoa"

    def __str__(self):
        return self.name


class Patient(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Nam'),
        ('FEMALE', 'Nữ'),
        ('OTHER', 'Khác'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient', verbose_name="Tài khoản")
    full_name = models.CharField(max_length=150, verbose_name="Họ và tên")
    dob = models.DateField(null=True, blank=True, verbose_name="Ngày sinh")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name="Giới tính")
    phone = models.CharField(max_length=15, blank=True, verbose_name="Số điện thoại")
    address = models.TextField(blank=True, null=True, verbose_name="Địa chỉ")
    medical_history = models.TextField(blank=True, null=True, verbose_name="Tiền sử bệnh")

    class Meta:
        verbose_name = "Bệnh nhân"
        verbose_name_plural = "Bệnh nhân"

    def __str__(self):
        return self.full_name


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor', verbose_name="Tài khoản")
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name='doctors', verbose_name="Chuyên khoa")
    full_name = models.CharField(max_length=150, verbose_name="Họ và tên")
    phone = models.CharField(max_length=15, blank=True, verbose_name="Số điện thoại")

    class Meta:
        verbose_name = "Bác sĩ"
        verbose_name_plural = "Bác sĩ"

    def __str__(self):
        return f"BS. {self.full_name} - {self.specialty.name}"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Chờ xác nhận'),
        ('CONFIRMED', 'Đã xác nhận'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('CANCELLED', 'Đã hủy'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments', verbose_name="Bệnh nhân")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments', verbose_name="Bác sĩ")
    appointment_date = models.DateField(verbose_name="Ngày khám")
    time_slot = models.CharField(max_length=20, help_text="VD: 08:00-08:30", verbose_name="Khung giờ")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING', verbose_name="Trạng thái")
    reason = models.TextField(blank=True, null=True, verbose_name="Lý do khám")
    cancel_reason = models.TextField(blank=True, null=True, verbose_name="Lý do hủy lịch")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        unique_together = ('doctor', 'appointment_date', 'time_slot')
        verbose_name = "Lịch hẹn"
        verbose_name_plural = "Lịch hẹn"

    def __str__(self):
        return f"{self.patient.full_name} - {self.doctor.full_name} - {self.appointment_date} {self.time_slot}"


class MedicalRecord(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_record', verbose_name="Lịch hẹn")
    symptoms = models.TextField(blank=True, null=True, verbose_name="Triệu chứng")
    diagnosis = models.TextField(blank=True, null=True, verbose_name="Chẩn đoán")
    notes = models.TextField(blank=True, null=True, verbose_name="Lời dặn dặn")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Hồ sơ bệnh án"
        verbose_name_plural = "Hồ sơ bệnh án"

    def __str__(self):
        return f"Bệnh án ngày {self.appointment.appointment_date} - {self.appointment.patient.full_name}"


class MedicalService(models.Model):
    name = models.CharField(max_length=200, verbose_name="Tên dịch vụ")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Giá")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")

    class Meta:
        verbose_name = "Dịch vụ y tế"
        verbose_name_plural = "Dịch vụ y tế"

    def __str__(self):
        return self.name


class RecordService(models.Model):
    STATUS_CHOICES = (
        ('WAITING', 'Chờ kết quả'),
        ('DONE', 'Đã có kết quả'),
    )
    record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='services', verbose_name="Bệnh án")
    service = models.ForeignKey(MedicalService, on_delete=models.CASCADE, verbose_name="Dịch vụ")
    result_file = models.FileField(upload_to='test_results/', null=True, blank=True, verbose_name="File kết quả")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='WAITING', verbose_name="Trạng thái")

    class Meta:
        verbose_name = "Chỉ định dịch vụ"
        verbose_name_plural = "Chỉ định dịch vụ"

    def __str__(self):
        return f"{self.record} - {self.service.name}"


class Medicine(models.Model):
    name = models.CharField(max_length=200, unique=True, verbose_name="Tên thuốc")
    unit = models.CharField(max_length=50, help_text="Viên, Hộp, Chai...", verbose_name="Đơn vị")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    usage_instruction = models.TextField(blank=True, null=True, verbose_name="Hướng dẫn sử dụng")

    class Meta:
        verbose_name = "Thuốc"
        verbose_name_plural = "Thuốc"

    def __str__(self):
        return self.name


class MedicineBatch(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='batches', verbose_name="Thuốc")
    batch_number = models.CharField(max_length=100, unique=True, verbose_name="Số lô")
    quantity = models.PositiveIntegerField(default=0, verbose_name="Số lượng tồn")
    import_date = models.DateField(verbose_name="Ngày nhập")
    expiration_date = models.DateField(verbose_name="Hạn sử dụng")
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Giá bán")

    class Meta:
        verbose_name = "Lô thuốc"
        verbose_name_plural = "Lô thuốc"

    def __str__(self):
        return f"{self.medicine.name} - Lô {self.batch_number} (HSD: {self.expiration_date})"


class Prescription(models.Model):
    record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name='prescription', verbose_name="Bệnh án")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Đơn thuốc"
        verbose_name_plural = "Đơn thuốc"

    def __str__(self):
        return f"Đơn thuốc - {self.record}"


class PrescriptionDetail(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='details', verbose_name="Đơn thuốc")
    batch = models.ForeignKey(MedicineBatch, on_delete=models.CASCADE, verbose_name="Lô thuốc")
    quantity = models.PositiveIntegerField(verbose_name="Số lượng")
    dosage_instruction = models.TextField(verbose_name="Hướng dẫn sử dụng")

    class Meta:
        verbose_name = "Chi tiết đơn thuốc"
        verbose_name_plural = "Chi tiết đơn thuốc"

    def __str__(self):
        return f"{self.prescription} - {self.batch.medicine.name} x {self.quantity}"


class Invoice(models.Model):
    PAYMENT_CHOICES = (
        ('CASH', 'Tiền mặt'),
        ('VNPAY', 'VNPay'),
        ('MOMO', 'MoMo'),
    )
    STATUS_CHOICES = (
        ('UNPAID', 'Chưa thanh toán'),
        ('PAID', 'Đã thanh toán'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='invoices', verbose_name="Bệnh nhân")
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='invoice', verbose_name="Lịch hẹn")
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Tổng tiền")
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, null=True, blank=True, verbose_name="Phương thức")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='UNPAID', verbose_name="Trạng thái")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày thanh toán")

    class Meta:
        verbose_name = "Hóa đơn"
        verbose_name_plural = "Hóa đơn"

    def __str__(self):
        return f"Hóa đơn {self.id} - {self.patient.full_name} - {self.total_amount} VND"