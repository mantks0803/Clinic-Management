import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Card, List, Portal, Dialog, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';
import styles from '../../styles/AdminStyles';

const CreateDoctor = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [specialtyName, setSpecialtyName] = useState('Bấm chọn khoa lâm sàng (*)');
    
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    useEffect(() => {
        const loadSpecialties = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get('/api/v1/specialties/');
                setSpecialties(res.data.results || res.data || []);
            } catch (ex) {
                console.error(ex);
            }
        };
        loadSpecialties();
    }, []);

    const chooseSpecialty = (item) => {
        setSelectedSpecialty(item.id);
        setSpecialtyName(item.name);
        setDialogVisible(false);
    };

    const handleCreateDoctor = async () => {
        if (!username.trim() || !password.trim() || !selectedSpecialty) {
            Alert.alert("Thông báo", "Vui lòng điền đủ Tên đăng nhập, Mật khẩu và Chuyên khoa trực thuộc!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const payload = {
                username: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
                email: email,
                specialty_id: selectedSpecialty,
                phone: phone
            };
            await authApi(token).post('/api/v1/users/create-doctor/', payload);
            Alert.alert("Thành công", `Đã kích hoạt hồ sơ điều phối bác sĩ chuyên khoa thành công!`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (ex) {
            Alert.alert("Thất bại", "Tên đăng nhập đã trùng hoặc lỗi kết nối máy chủ hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
            <Text style={styles.titleHead}>HỒ SƠ ĐIỀU PHỐI NHÂN SỰ CHUYÊN KHOA</Text>
            
            <TextInput label="Tên đăng nhập tài khoản (*)" value={username} onChangeText={setUsername} autoCapitalize="none" mode="outlined" style={{marginBottom: 10, backgroundColor: '#fff'}} />
            <TextInput label="Mật khẩu khởi tạo (*)" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={{marginBottom: 10, backgroundColor: '#fff'}} />
            <TextInput label="Họ và chữ lót" value={lastName} onChangeText={setLastName} mode="outlined" style={{marginBottom: 10, backgroundColor: '#fff'}} />
            <TextInput label="Tên bác sĩ" value={firstName} onChangeText={setFirstName} mode="outlined" style={{marginBottom: 10, backgroundColor: '#fff'}} />
            <TextInput label="Số điện thoại liên lạc" value={phone} onChangeText={setPhone} keyboardType="numeric" mode="outlined" style={{marginBottom: 10, backgroundColor: '#fff'}} />
            <TextInput label="Địa chỉ email" value={email} onChangeText={setEmail} keyboardType="email-address" mode="outlined" style={{marginBottom: 15, backgroundColor: '#fff'}} />

            <Card style={{marginBottom: 20, backgroundColor: '#ffffixed'}} onPress={() => setDialogVisible(true)}>
                <List.Item
                    title={specialtyName}
                    description="Khoa chuyên môn phụ trách chính lâm sàng"
                    left={props => <List.Icon {...props} icon="hospital-building" color="#005b9f" />}
                    right={props => <List.Icon {...props} icon="menu-down" />}
                />
            </Card>

            {loading ? <ActivityIndicator size="large" color="#2e7d32" style={{marginTop: 10}} /> : (
                <Button 
                    mode="contained" 
                    icon="shield-account" 
                    onPress={handleCreateDoctor} 
                    buttonColor="#2e7d32"
                    style={{paddingVertical: 4, borderRadius: 8}}
                >
                    XÁC NHẬN CẤP PHÉP & PHÂN KHOA
                </Button>
            )}

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Chọn khoa điều phối trực thuộc</Dialog.Title>
                    <Dialog.Content>
                        <ScrollView style={{maxHeight: 300}}>
                            {specialties.map(item => (
                                <View key={item.id}>
                                    <TouchableOpacity style={{paddingVertical: 12}} onPress={() => chooseSpecialty(item)}>
                                        <Text style={{fontSize: 15, color: '#333'}}>{item.name}</Text>
                                    </TouchableOpacity>
                                    <Divider />
                                </View>
                            ))}
                        </ScrollView>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </ScrollView>
    );
};

export default CreateDoctor;