import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/API';

const MedicalRecordDetail = ({ route }) => {
    const { appointmentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [recordData, setRecordData] = useState(null);

    useEffect(() => {
        const loadMedicalRecord = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/appointments/${appointmentId}/medical-record/`);
                setRecordData(res.data);
            } catch (ex) {
                console.error("Lỗi bốc dữ liệu bệnh án:", ex);
            } finally {
                setLoading(false);
            }
        };
        loadMedicalRecord();
    }, [appointmentId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#005b9f" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    if (!recordData) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'gray' }}>Bác sĩ chưa hoàn tất cập nhật bệnh án cho ca khám này!</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="THÔNG TIN BỆNH ÁN" titleStyle={styles.cardTitle} left={props => <List.Icon {...props} icon="clipboard-pulse" color="#005b9f" />} />
                <Card.Content>
                    <Text style={styles.label}>Triệu chứng lâm sàng:</Text>
                    <Text style={styles.value}>{recordData.symptoms || "Không ghi nhận"}</Text>
                    
                    <Divider style={styles.divider} />
                    
                    <Text style={styles.label}>Chẩn đoán bệnh:</Text>
                    <Text style={styles.valueBold}>{recordData.diagnosis}</Text>
                    
                    <Divider style={styles.divider} />
                    
                    <Text style={styles.label}>Lời dặn bác sĩ / Ghi chú:</Text>
                    <Text style={styles.value}>{recordData.advice || "Uống thuốc theo toa và tái khám nếu có dấu hiệu bất thường."}</Text>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="TOA THUỐC ĐI KÈM" titleStyle={styles.cardTitle} left={props => <List.Icon {...props} icon="pill" color="#e67e22" />} />
                <Card.Content>
                    {recordData.prescriptions && recordData.prescriptions.length > 0 ? (
                        recordData.prescriptions.map((item, index) => (
                            <View key={index} style={styles.medItem}>
                                <Text style={styles.medName}>{index + 1}. {item.medicine_name}</Text>
                                <Text style={styles.medDetail}>Số lượng: {item.quantity} {item.unit} | Cách dùng: {item.instructions}</Text>
                                <Divider style={{ marginVertical: 6, backgroundColor: '#f1f3f5' }} />
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: 'gray', textAlign: 'center' }}>Không có thuốc kê toa cho ca khám này.</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f3f5', padding: 10 },
    card: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 8 },
    cardTitle: { fontWeight: 'bold', color: '#333', fontSize: 15 },
    label: { fontSize: 13, color: '#7f8c8d', fontWeight: '500' },
    value: { fontSize: 15, color: '#2c3e50', marginTop: 3, marginBottom: 10 },
    valueBold: { fontSize: 16, color: '#d35400', fontWeight: 'bold', marginTop: 3, marginBottom: 10 },
    divider: { my: 5, backgroundColor: '#f1f3f5' },
    medItem: { marginVertical: 4 },
    medName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
    medDetail: { fontSize: 13, color: '#555', marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});

export default MedicalRecordDetail;