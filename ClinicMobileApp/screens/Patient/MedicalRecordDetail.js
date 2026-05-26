import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Divider, ActivityIndicator, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const MedicalRecordDetail = ({ route }) => {
    const { appointmentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState(null);

    useEffect(() => {
        const loadRecordDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/appointments/${appointmentId}/medical-record/`);
                setRecord(res.data);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadRecordDetail();
    }, [appointmentId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#005b9f" />
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy thông tin bệnh án chi tiết.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title 
                    title="Thông tin chẩn đoán chuyên khoa" 
                    left={props => <Avatar.Icon {...props} icon="clipboard-pulse" backgroundColor="#e1f5fe" color="#0288d1" />} 
                />
                <Card.Content>
                    <Text style={styles.label}>Chẩn đoán bệnh lý chính:</Text>
                    <Text style={styles.valueName}>{record.diagnosis || "Chưa ghi nhận"}</Text>
                    <Divider style={styles.divider} />
                    <Text style={styles.label}>Lời dặn dặn và tư vấn bác sĩ:</Text>
                    <Text style={styles.subValue}>{record.notes || "Không có dặn dò bổ sung"}</Text>
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>CHỈ ĐỊNH CẬN LÂM SÀNG & DỊCH VỤ Y TẾ</Text>
            <Card style={styles.card}>
                <Card.Content style={{ paddingVertical: 5 }}>
                    {record.services && record.services.length > 0 ? (
                        record.services.map((svc, idx) => (
                            <View key={svc.id}>
                                <List.Item
                                    title={svc.service_name}
                                    description={`Chi phí thực hiện: ${parseInt(svc.price).toLocaleString('vi-VN')} đ`}
                                    left={props => <List.Icon {...props} icon="shield-check-outline" color="#00796b" />}
                                />
                                {idx < record.services.length - 1 && <Divider />}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Không chỉ định dịch vụ cận lâm sàng nào</Text>
                    )}
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>TOA THUỐC ĐIỀU TRỊ CHI TIẾT</Text>
            <Card style={styles.card}>
                <Card.Content style={{ paddingVertical: 5 }}>
                    {record.prescriptions && record.prescriptions.length > 0 ? (
                        record.prescriptions.map((med, idx) => (
                            <View key={med.id}>
                                <List.Item
                                    title={med.medicine_name}
                                    description={`Số lượng: ${med.quantity} viên\nHướng dẫn dùng: ${med.dosage_instruction}`}
                                    descriptionNumberOfLines={3}
                                    left={props => <List.Icon {...props} icon="pill" color="#d32f2f" />}
                                />
                                {idx < record.prescriptions.length - 1 && <Divider />}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Không kê đơn thuốc kèm theo</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 2 },
    label: { fontSize: 13, color: '#78909c', marginTop: 4 },
    valueName: { fontSize: 16, fontWeight: 'bold', color: '#263238', marginBottom: 6 },
    subValue: { fontSize: 14, color: '#455a64', marginTop: 2, fontWeight: '500' },
    divider: { marginVertical: 8, backgroundColor: '#eceff1' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#455a64', marginTop: 5, marginBottom: 8, letterSpacing: 0.3 },
    emptyText: { padding: 15, color: '#90a4ae', textAlign: 'center' }
});

export default MedicalRecordDetail;