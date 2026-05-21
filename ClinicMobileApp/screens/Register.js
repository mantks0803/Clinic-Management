import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { TextInput, Button, Avatar, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import API, { endpoints } from '../configs/API';
import MyStyles from '../styles/MyStyles';

const Register = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [rawDate, setRawDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [gender, setGender] = useState('MALE');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập thư viện ảnh để chọn avatar!");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) {
            setAvatar(result.assets[0]);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setRawDate(selectedDate);
            let y = selectedDate.getFullYear();
            let m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            let d = String(selectedDate.getDate()).padStart(2, '0');
            setDob(`${y}-${m}-${d}`);
        }
    };

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !phone) {
            Alert.alert("Thông báo", "Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }
        setLoading(true);
        try {
            let form = new FormData();
            form.append("username", username);
            form.append("password", password);
            form.append("first_name", firstName);
            form.append("last_name", lastName);
            form.append("email", email);
            form.append("phone", phone);
            form.append("gender", gender);
            form.append("address", address);
            form.append("role", "PATIENT");
            if (dob) form.append("dob", dob);
            if (avatar) {
                let localUri = avatar.uri;
                let filename = localUri.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                form.append("avatar", { uri: localUri, name: filename, type: type });
            }
            await API.post(endpoints['register'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Alert.alert("Thành công", "Đăng ký thành công!", [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
        } catch (ex) {
            Alert.alert("Lỗi", "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[MyStyles.container, { paddingHorizontal: 16 }]}>
            <Text style={[MyStyles.subject, { marginTop: 20, marginBottom: 20 }]}>ĐĂNG KÝ TÀI KHOẢN</Text>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={pickImage}>
                    {avatar ? <Image source={{ uri: avatar.uri }} style={{ width: 90, height: 90, borderRadius: 45 }} /> : <Avatar.Icon size={90} icon="camera" backgroundColor="#e3f2fd" color="#005b9f" />}
                </TouchableOpacity>
                <Text style={{ marginTop: 6, color: '#005b9f', fontWeight: '500' }}>Chọn ảnh đại diện</Text>
            </View>
            <TextInput label="Họ và tên đệm *" value={firstName} onChangeText={setFirstName} style={styles.input} mode="outlined" />
            <TextInput label="Tên *" value={lastName} onChangeText={setLastName} style={styles.input} mode="outlined" />
            <TextInput label="Số điện thoại *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} mode="outlined" />
            
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <View pointerEvents="none">
                    <TextInput label="Ngày sinh *" value={dob} placeholder="Bấm để chọn ngày sinh" mode="outlined" style={styles.input} editable={false} right={<TextInput.Icon icon="calendar" />} />
                </View>
            </TouchableOpacity>
            {showPicker && <DateTimePicker value={rawDate} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />}

            <Text style={styles.genderLabel}>Giới tính:</Text>
            <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                <View style={styles.genderRow}>
                    <View style={styles.radioItem}><RadioButton value="MALE" color="#005b9f" /><Text>Nam</Text></View>
                    <View style={styles.radioItem}><RadioButton value="FEMALE" color="#005b9f" /><Text>Nữ</Text></View>
                    <View style={styles.radioItem}><RadioButton value="OTHER" color="#005b9f" /><Text>Khác</Text></View>
                </View>
            </RadioButton.Group>
            <TextInput label="Địa chỉ" value={address} onChangeText={setAddress} multiline style={styles.input} mode="outlined" />
            <TextInput label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} mode="outlined" />
            <TextInput label="Tên đăng nhập *" value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} mode="outlined" />
            <TextInput label="Mật khẩu *" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
            <TextInput label="Xác nhận mật khẩu *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} mode="outlined" />
            {loading ? <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} /> : <Button mode="contained" onPress={handleRegister} style={{ marginTop: 20, padding: 4 }} buttonColor="green">ĐĂNG KÝ</Button>}
            <Button mode="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: 10, marginBottom: 40 }}>Quay lại Đăng nhập</Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    input: { marginBottom: 10, backgroundColor: '#fff' },
    genderLabel: { fontSize: 15, fontWeight: '500', color: '#495057', marginTop: 6 },
    genderRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 }
});

export default Register;r