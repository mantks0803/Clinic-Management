import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
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
    const [loading, setLoading] = useState(false);
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
                quantity: int(quantity),
                selling_price: parseFloat(sellingPrice),
                import_date: new Date().toISOString().split('T')[0],
                expiration_date: expirationDate
            };
            await authApi(token).post(endpoints['medicine-batches'], data);
            Alert.alert("Thành công", "Đã nhập kho lô thuốc thành công!");
            setBatchNumber('');
            setQuantity('');
            setSellingPrice('');
        } catch (ex) {
            console.error(ex);
            Alert.alert("Thất bại", "Lỗi nhập kho thuốc!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={MyStyles.container} contentContainerStyle={{ paddingBottom: 30 }}>
            <Button 
                mode="contained" 
                icon="plus-circle" 
                onPress={() => navigation.navigate('CreateMedicalService')} 
                style={styles.serviceBtn}
                buttonColor="#00796b"
            >
                QUẢN LÝ: THÊM DỊCH VỤ CẬN LÂM SÀNG
            </Button>

            <Text style={styles.sectionTitle}>THỦ TỤC NHẬP KHO THUỐC</Text>
            
            <Button mode="outlined" onPress={() => navigation.navigate('CreateNewMedicine')} style={MyStyles.margin}>
                Chưa có thuốc gốc? Tạo mới ngay
            </Button>

            <TextInput
                label="Mã thuốc gốc (ID số)"
                value={selectedMedicine}
                onChangeText={setSelectedMedicine}
                mode="outlined"
                keyboardType="numeric"
                style={MyStyles.margin}
            />

            <TextInput
                label="Mã số lô thuốc mới"
                value={batchNumber}
                onChangeText={setBatchNumber}
                mode="outlined"
                style={MyStyles.margin}
            />

            <TextInput
                label="Số lượng viên nhập kho"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={MyStyles.margin}
            />

            <TextInput
                label="Giá bán lẻ trên mỗi vỉ/hộp (VND)"
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

const styles = StyleSheet.create({
    serviceBtn: { margin: 10, padding: 4, borderRadius: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginHorizontal: 12, marginTop: 15, marginBottom: 5 }
});

export default ImportMedicine;