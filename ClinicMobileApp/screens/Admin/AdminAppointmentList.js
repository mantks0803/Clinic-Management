import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const AdminAppointmentList = ({ route }) => {
    const { specialty } = route.params;
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/appointments/?specialty_name=${specialty}`);
                setAppointments(res.data.results || res.data || []);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadAppointments();
    }, [specialty]);

    const getStatusChip = (status) => {
        if (status === 'COMPLETED') return { label: 'Đã hoàn thành', color: '#2e7d32', bg: '#e8f5e9' };
        if (status === 'CONFIRMED') return { label: 'Đã xác nhận', color: '#0288d1', bg: '#e1f5fe' };
        if (status === 'CANCELLED') return { label: 'Đã hủy', color: '#c62828', bg: '#ffebee' };
        return { label: 'Chờ duyệt', color: '#f57c00', bg: '#fff3e0' };
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#005b9f" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titleHead}>KHOA LÂM SÀNG: {specialty.toUpperCase()}</Text>
            
            <FlatList
                data={appointments}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => {
                    const chip = getStatusChip(item.status);
                    return (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.rowSpace}>
                                    <Text style={styles.doctorText}>Bác sĩ phụ trách: {item.doctor_name || "Bác sĩ hệ thống"}</Text>
                                    <Chip flat style={{ backgroundColor: chip.bg }} selectedColor={chip.color}>{chip.label}</Chip>
                                </View>
                                <Divider style={{ marginVertical: 8 }} />
                                <Text style={styles.infoLine}>Bệnh nhân: {item.patient_name || "Khách hàng"}</Text>
                                <Text style={styles.infoLine}>Thời gian: {item.appointment_date} | Khung giờ: {item.time_slot}</Text>
                                <Text style={styles.infoLine}>Lý do đến khám: {item.reason || "Khám định kỳ"}</Text>
                            </Card.Content>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Không tìm thấy ca khám nào thuộc chuyên khoa này</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    titleHead: { fontSize: 14, fontWeight: 'bold', color: '#005b9f', marginBottom: 12, letterSpacing: 0.5, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, elevation: 2 },
    rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    doctorText: { fontSize: 15, fontWeight: 'bold', color: '#263238', flex: 0.6 },
    infoLine: { fontSize: 13, color: '#455a64', marginVertical: 2 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae' }
});

export default AdminAppointmentList;