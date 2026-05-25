import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const MedicalRecordDetail = ({ route }) => {
    const { appointmentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [recordData, setRecordData] = useState(null);

    useEffect(() => {
        const loadMedicalRecord = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/appointments/${appointmentId}/medical-record/`);
                console.info("STRUCT:", JSON.stringify(res.data, null, 2));
                setRecordData(res.data);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadMedicalRecord();
    }, [appointmentId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#005b9f" style={styles.centerIndicator} />;
    }

    if (!recordData) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Bác sĩ chưa hoàn tất cập nhật bệnh án cho ca khám này!</Text>
            </View>
        );
    }

    const prescriptionList = recordData.prescriptions || recordData.prescription_set || (recordData.prescription ? [recordData.prescription] : []);

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
                    <Text style={styles.value}>{recordData.notes || recordData.advice || "Uống thuốc theo toa và tái khám nếu có dấu hiệu bất thường."}</Text>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="TOA THUỐC ĐI KÈM" titleStyle={styles.cardTitle} left={props => <List.Icon {...props} icon="pill" color="#e67e22" />} />
                <Card.Content>
                    {prescriptionList && prescriptionList.length > 0 ? (
                        prescriptionList.map((item, index) => (
                            <View key={index} style={styles.medItem}>
                                <Text style={styles.medName}>{index + 1}. {item.medicine_name || "Tên thuốc"}</Text>
                                <Text style={styles.medDetail}>Số lượng: {item.quantity} | Cách dùng: {item.dosage_instruction || item.instructions}</Text>
                                <Divider style={styles.smallDivider} />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Không có thuốc kê toa cho ca khám này.</Text>
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
    divider: { backgroundColor: '#f1f3f5', marginVertical: 5 },
    smallDivider: { marginVertical: 6, backgroundColor: '#f1f3f5' },
    medItem: { marginVertical: 4 },
    medName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
    medDetail: { fontSize: 13, color: '#555', marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerIndicator: { flex: 1, justifyContent: 'center' },
    errorText: { color: 'gray', textAlign: 'center' },
    emptyText: { color: 'gray', textAlign: 'center' }
});

export default MedicalRecordDetail;