import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/API';
import MyStyles from '../../styles/MyStyles';

const CreateNewMedicine = ({ navigation }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('Viên'); //default là viên
    const [description, setDescription] = useState('');
    const [usageInstruction, setUsageInstruction] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateMedicine = async () => {
        if (!name || !unit) {
            Alert.alert("Thông báo", "Vui lòng nhập Tên thuốc và Đơn vị tính!");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            const data = {
                name: name,
                unit: unit,
                description: description,
                usage_instruction: usageInstruction
            };

            const res = await authApi(token).post(endpoints['medicines'], data);
            
            Alert.alert("Thành công", `Đã thêm thuốc ${name} vào danh mục hệ thống!`);
            
            navigation.navigate('ImportMedicineMain', { newMedicineId: res.data.id });
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể thêm thuốc mới, tên thuốc có thể đã tồn tại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.margin}>
            <Text style={[MyStyles.subject, { marginTop: 15 }]}>THÊM THUỐC MỚI VÀO DANH MỤC</Text>

            <TextInput
                label="Tên loại thuốc mới (*)"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={MyStyles.margin}
            />
            <TextInput
                label="Đơn vị tính (* Ví dụ: Viên, Vỉ, Hộp, Chai)"
                value={unit}
                onChangeText={setUnit}
                mode="outlined"
                style={MyStyles.margin}
            />
            <TextInput
                label="Mô tả công dụng ngắn gọn"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={MyStyles.margin}
            />
            <TextInput
                label="Hướng dẫn liều lượng sử dụng chung"
                value={usageInstruction}
                onChangeText={setUsageInstruction}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={MyStyles.margin}
            />

            {loading ? <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} /> : (
                <Button mode="contained" onPress={handleCreateMedicine} style={[MyStyles.margin, { marginTop: 25, padding: 5 }]} buttonColor="#005b9f">
                    TẠO THUỐC GỐC MỚI
                </Button>
            )}
        </ScrollView>
    );
};

export default CreateNewMedicine;