import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import MyStyles from '../styles/MyStyles';

const Register = ({ navigation }) => {
    const [user, setUser] = useState({
        "first_name": "",
        "last_name": "",
        "username": "",
        "password": "",
        "confirm_password": "",
        "email": ""
    });

    const change = (value, field) => {
        setUser({ ...user, [field]: value });
    };

    const handleRegister = () => {
        if (user.password !== user.confirm_password) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }
        Alert.alert("Thành công", `Đã lưu thông tin: ${user.username}`);
    };

    return (
        <ScrollView style={[MyStyles.container, MyStyles.margin]}>
            <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 10 }}>💉</Text>
            
            <Text style={MyStyles.subject}>ĐĂNG KÝ TÀI KHOẢN</Text>

            <TextInput label="Họ và tên đệm" value={user.first_name} onChangeText={t => change(t, 'first_name')} style={MyStyles.margin} mode="outlined" />
            <TextInput label="Tên" value={user.last_name} onChangeText={t => change(t, 'last_name')} style={MyStyles.margin} mode="outlined" />
            <TextInput label="Email" value={user.email} onChangeText={t => change(t, 'email')} style={MyStyles.margin} mode="outlined" />
            <TextInput label="Tên đăng nhập" value={user.username} onChangeText={t => change(t, 'username')} style={MyStyles.margin} mode="outlined" />
            
            <TextInput label="Mật khẩu" value={user.password} onChangeText={t => change(t, 'password')} secureTextEntry style={MyStyles.margin} mode="outlined" />
            <TextInput label="Xác nhận mật khẩu" value={user.confirm_password} onChangeText={t => change(t, 'confirm_password')} secureTextEntry style={MyStyles.margin} mode="outlined" />

            <Button mode="contained" onPress={handleRegister} style={[MyStyles.margin, { marginTop: 20 }]} buttonColor="green">
                ĐĂNG KÝ
            </Button>

            <Button mode="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }}>
                Quay lại Đăng nhập
            </Button>
        </ScrollView>
    );
};

export default Register;