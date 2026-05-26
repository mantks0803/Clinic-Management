import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';
import MyStyles from '../../styles/MyStyles';

const CreateMedicalService = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateService = async () => {
        if (!name || !price) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Tên dịch vụ và Giá tiền!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            const data = {
                name: name,
                price: parseFloat(price),
                description: description
            };
            await authApi(token).post('/api/v1/services/', data);
            Alert.alert("Thành công", `Đã thêm dịch vụ y tế: ${name} vào hệ thống phòng khám!`);
            setName('');
            setPrice('');
            setDescription('');
            navigation.goBack();
        } catch (ex) {
            console.error(ex);
            Alert.alert("Thất bại", "Lỗi tạo mới dịch vụ cận lâm sàng!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.container}>
            <Text style={[MyStyles.subject, { marginTop: 25 }]}>THÊM CẬN LÂM SÀNG</Text>

            <TextInput
                label="Tên dịch vụ cận lâm sàng mới (*)"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={MyStyles.margin}
            />

            <TextInput
                label="Giá dịch vụ thực hiện (VND *)"
                value={price}
                onChangeText={setPrice}
                mode="outlined"
                keyboardType="numeric"
                style={MyStyles.margin}
            />

            <TextInput
                label="Mô tả chi tiết phòng ban / cách thức"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={MyStyles.margin}
            />

            {loading ? <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} /> : (
                <Button 
                    mode="contained" 
                    onPress={handleCreateService} 
                    style={[MyStyles.margin, { marginTop: 30, padding: 5 }]} 
                    buttonColor="#00796b"
                >
                    XÁC NHẬN TẠO DỊCH VỤ Y TẾ
                </Button>
            )}
        </ScrollView>
    );
};

export default CreateMedicalService;