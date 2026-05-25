import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/API';
import MyStyles from '../../styles/MyStyles';

const ImportMedicine = ({ route, navigation }) => {
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    
    const [rawDate, setRawDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [expirationDate, setExpirationDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (route.params?.newMedicineId) {
            setSelectedMedicine(route.params.newMedicineId.toString());
        }
    }, [route.params?.newMedicineId]);

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setRawDate(selectedDate);
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            setExpirationDate(`${yyyy}-${mm}-${dd}`);
        }
    };

    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        if (!selectedMedicine || !batchNumber || !quantity || !sellingPrice) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin lô thuốc!");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            
            const data = {
                medicine: parseInt(selectedMedicine),   
                batch_number: batchNumber,              
                quantity: parseInt(quantity),           
                selling_price: parseFloat(sellingPrice), 
                import_date: new Date().toISOString().split('T')[0], 
                expiration_date: expirationDate         
            };

            await authApi(token).post(endpoints['medicine-batches'], data);
            Alert.alert("Thành công", "Đã nhập lô thuốc mới vào kho!");
            
            setBatchNumber('');
            setQuantity('');
            setSellingPrice('');
            
            navigation.navigate('MedicineInventory');
        } catch (ex) {
            if (ex.response) {
                console.info("BACKEND DJANGO:", ex.response.data);
            }
            Alert.alert("Lỗi nhập thuốc", "Không thể lưu dữ liệu, hãy chắc chắn rằng Số lô thuốc này chưa từng tồn tại trên hệ thống!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.margin}>
            <Text style={[MyStyles.subject, { marginTop: 15 }]}>LẬP PHIẾU NHẬP KHO</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextInput
                    label="ID Thuốc gốc"
                    value={selectedMedicine}
                    onChangeText={setSelectedMedicine}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[MyStyles.margin, { flex: 0.6 }]}
                />
                <Button 
                    mode="outlined" 
                    onPress={() => navigation.navigate('CreateNewMedicine')}
                    style={[MyStyles.margin, { flex: 0.36, marginTop: 12, height: 50, justifyContent: 'center' }]}
                    labelStyle={{ fontSize: 11 }}
                >
                    + Thuốc mới
                </Button>
            </View>

            <TextInput
                label="Số lô thuốc (Ví dụ: LÔ-PARA-2026)"
                value={batchNumber}
                onChangeText={setBatchNumber}
                mode="outlined"
                style={MyStyles.margin}
            />
            <TextInput
                label="Số lượng vỉ/hộp nhập kho"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={MyStyles.margin}
            />
            <TextInput
                label="Giá bán lẻ trên mỗi vỉ/hộpp (VND)"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                mode="outlined"
                keyboardType="numeric"
                style={MyStyles.margin}
            />

            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <View pointerEvents="none">
                    <TextInput
                        label="Hạn sử dụng (Bấm vào để chọn ngày)"
                        value={expirationDate}
                        mode="outlined"
                        style={MyStyles.margin}
                        right={<TextInput.Icon icon="calendar" />}
                    />
                </View>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={rawDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()} 
                    onChange={onDateChange}
                />
            )}

            {loading ? <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} /> : (
                <Button mode="contained" onPress={handleImport} style={[MyStyles.margin, { marginTop: 25, padding: 5 }]} buttonColor="#2e7d32">
                    XÁC NHẬN NHẬP KHO THUỐC
                </Button>
            )}
        </ScrollView>
    );
};

export default ImportMedicine;