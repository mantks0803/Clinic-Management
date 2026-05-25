import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Checkbox, Divider } from 'react-native-paper';
import API, { endpoints, authApi } from '../../configs/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MedicalExamination = ({ route, navigation }) => {
    const { appointmentId, patientName } = route.params;
    const [diagnosis, setDiagnosis] = useState('');
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [prescribedMedicines, setPrescribedMedicines] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const [srvRes, batchRes] = await Promise.all([
                    authApi(token).get("/api/v1/services/"), 
                    authApi(token).get("/api/v1/medicine-batches/")
                ]);
                setAllServices(srvRes.data.results || srvRes.data || []);
                setAllBatches(batchRes.data.results || batchRes.data || []);
            } catch (ex) {
                console.error(ex);
            }
        };
        fetchData();
    }, []);

    const toggleService = (id) => {
        if (selectedServices.includes(id)) {
            setSelectedServices(selectedServices.filter(sid => sid !== id));
        } else {
            setSelectedServices([...selectedServices, id]);
        }
    };

    const addMedicine = (batch) => {
        const exists = prescribedMedicines.find(m => m.batch_id === batch.id);
        if (exists) return;
        setPrescribedMedicines([...prescribedMedicines, {
            batch_id: batch.id,
            name: batch.medicine_name,
            quantity: '1',
            instruction: ''
        }]);
    };

    const updateMedicineField = (batchId, field, value) => {
        setPrescribedMedicines(prescribedMedicines.map(m => 
            m.batch_id === batchId ? { ...m, [field]: value } : m
        ));
    };

    const removeMedicine = (batchId) => {
        setPrescribedMedicines(prescribedMedicines.filter(m => m.batch_id !== batchId));
    };

    const handleSubmit = async () => {
        if (!diagnosis) {
            Alert.alert("Thông báo", "Vui lòng nhập chẩn đoán bệnh án!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const payload = {
                diagnosis: diagnosis,
                advice: advice,
                services: selectedServices,
                medicines: prescribedMedicines.map(m => ({
                    batch_id: m.batch_id,
                    quantity: parseInt(m.quantity) || 0,
                    instruction: m.instruction
                }))
            };

            await authApi(token).post(`${endpoints['appointments']}${appointmentId}/examine/`, payload);
            Alert.alert("Thành công", "Đã hoàn thành khám và kê đơn thuốc!", [
                { 
                    text: "OK", 
                    onPress: () => {
                        navigation.goBack();
                        navigation.navigate('Lịch hẹn');
                    } 
                }
            ]);
        } catch (ex) {
            Alert.alert("Thất bại", "Đã xảy ra lỗi hệ thống hoặc kho hết thuốc!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.patientBanner}>Bệnh nhân: {patientName}</Text>

            <Text style={styles.sectionTitle}>1. Nội dung khám bệnh *</Text>
            <TextInput label="Chẩn đoán bệnh" value={diagnosis} onChangeText={setDiagnosis} mode="outlined" style={styles.input} />
            <TextInput label="Lời dặn bác sĩ" value={advice} onChangeText={setAdvice} multiline numberOfLines={3} mode="outlined" style={styles.input} />

            <Text style={styles.sectionTitle}>2. Chỉ định dịch vụ y tế</Text>
            {allServices.map(srv => (
                <View key={srv.id} style={styles.checkboxRow}>
                    <Checkbox status={selectedServices.includes(srv.id) ? 'checked' : 'unchecked'} onPress={() => toggleService(srv.id)} color="#005b9f" />
                    <Text style={styles.checkboxLabel}>{srv.name} ({parseInt(srv.price).toLocaleString()}đ)</Text>
                </View>
            ))}

            <Text style={styles.sectionTitle}>3. Kê đơn thuốc tủ kho</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicineListHorizontal}>
                {allBatches.map(batch => (
                    <Button key={batch.id} mode="outlined" compact onPress={() => addMedicine(batch)} style={styles.btnMedSelect} labelStyle={{fontSize: 12}}>
                        + {batch.medicine_name} ({batch.quantity})
                    </Button>
                ))}
            </ScrollView>

            {prescribedMedicines.map(med => (
                <View key={med.batch_id} style={styles.medCard}>
                    <View style={styles.medCardHeader}>
                        <Text style={styles.medName}>💊 {med.name}</Text>
                        <Button compact textColor="red" onPress={() => removeMedicine(med.batch_id)}>Xóa</Button>
                    </View>
                    <View style={styles.medCardBody}>
                        <TextInput label="SL" value={med.quantity} onChangeText={(val) => updateMedicineField(med.batch_id, 'quantity', val)} keyboardType="numeric" mode="outlined" style={styles.inputQty} />
                        <TextInput label="Cách dùng (VD: Sáng 1v, Tối 1v)" value={med.instruction} onChangeText={(val) => updateMedicineField(med.batch_id, 'instruction', val)} mode="outlined" style={styles.inputInstruction} />
                    </View>
                </View>
            ))}

            <Divider style={{ marginVertical: 20 }} />

            {loading ? (
                <ActivityIndicator size="large" color="#2e7d32" />
            ) : (
                <Button mode="contained" onPress={handleSubmit} style={styles.submitBtn} buttonColor="#2e7d32">
                    HOÀN THÀNH KHÁM & KÊ ĐƠN
                </Button>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    patientBanner: { fontSize: 16, fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#005b9f', padding: 12, borderRadius: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 8 },
    input: { marginBottom: 10, backgroundColor: '#fff' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    checkboxLabel: { fontSize: 14, color: '#495057' },
    medicineListHorizontal: { flexDirection: 'row', marginBottom: 15, paddingVertical: 5 },
    btnMedSelect: { marginRight: 8, borderColor: '#005b9f' },
    medCard: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
    medCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    medName: { fontSize: 14, fontWeight: 'bold', color: '#212529' },
    medCardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    inputQty: { width: '20%', height: 45, backgroundColor: '#fff' },
    inputInstruction: { width: '76%', height: 45, backgroundColor: '#fff' },
    submitBtn: { padding: 4, borderRadius: 8, marginBottom: 40 }
});

export default MedicalExamination;