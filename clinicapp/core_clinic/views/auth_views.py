from django.db import transaction
from rest_framework import viewsets, generics, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import User, Patient, Doctor
from ..serializers import UserSerializer, PatientSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = UserSerializer(u, data=request.data, partial=True)
            s.is_valid(raise_exception=True)
            u = s.save()
        return Response(UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='create-doctor', permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def create_doctor(self, request):
        if request.user.role != 'ADMIN':
            return Response({"detail": "Quyền truy cập bị từ chối!"}, status=status.HTTP_403_FORBIDDEN)

        username = request.data.get('username')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        email = request.data.get('email', '')
        specialty_id = request.data.get('specialty_id')
        phone = request.data.get('phone', '')

        if not username or not password or not specialty_id:
            return Response({"detail": "Thiếu các thông tin bắt buộc!"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Tên đăng nhập này đã có người sử dụng!"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
            role='DOCTOR'
        )

        Doctor.objects.create(
            user=user,
            full_name=f"{last_name} {first_name}".strip(),
            specialty_id=specialty_id,
            phone=phone
        )

        return Response({"detail": "Đã tạo tài khoản và phân bổ phòng khoa cho bác sĩ mới thành công!"},
                        status=status.HTTP_201_CREATED)


class PatientViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]