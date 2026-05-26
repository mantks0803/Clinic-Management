import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../configs/API';
import { MyUserContext } from '../contexts/MyUserContext';

const Appointment = ({ navigation }) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appointments, setAppointments] = useState([]);

    const loadAppointments = async (showIndicator = true) => {
        if (showIndicator) setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get('/api/v1/appointments/');
            setAppointments(res.data.results || res.data || []);
        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi", "Không thể tải danh sách lịch hẹn!");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAppointments(true);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadAppointments(false);
    };

    const handleConfirm = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApi(token).post(`/api/v1/appointments/${id}/confirm/`);
            Alert.alert("Thành công", "Đã duyệt chấp nhận lịch hẹn này!");
            loadAppointments(false);
        } catch (ex) {
            Alert.alert("Thất bại", "Lỗi phê duyệt lịch hẹn!");
        }
    };

    const handleReject = async (id) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApi(token).post(`/api/v1/appointments/${id}/reject/`);
            Alert.alert("Thành công", "Đã hủy bỏ ca lịch hẹn này!");
            loadAppointments(false);
        } catch (ex) {
            Alert.alert("Thất bại", "Lỗi hủy lịch hẹn!");
        }
    };

    const getStatusChip = (status) => {
        if (status === 'COMPLETED') return { label: 'Đã hoàn thành', color: '#2e7d32', bg: '#e8f5e9' };
        if (status === 'CONFIRMED') return { label: 'Đã duyệt', color: '#0288d1', bg: '#e1f5fe' };
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
            <FlatList
                data={appointments}
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => {
                    const chip = getStatusChip(item.status);
                    return (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.rowSpace}>
                                    <Text style={styles.titleText}>Mã lịch khám: #{item.id}</Text>
                                    <Chip flat style={{ backgroundColor: chip.bg }} selectedColor={chip.color}>{chip.label}</Chip>
                                </View>
                                <Divider style={styles.divider} />
                                
                                <Text style={styles.infoLine}>Bệnh nhân: {item.patient_name || "Khách hàng hệ thống"}</Text>
                                <Text style={styles.infoLine}>Bác sĩ: {item.doctor_name || "Bác sĩ phụ trách"}</Text>
                                <Text style={styles.infoLine}>Ngày hẹn: {item.appointment_date} | Khung giờ: {item.time_slot}</Text>
                                <Text style={styles.infoLine}>Lý do khám: {item.reason || "Khám định kỳ"}</Text>

                                <View style={styles.actionArea}>
                                    {user && user.role === 'DOCTOR' && item.status === 'PENDING' && (
                                        <View style={styles.rowButtons}>
                                            <Button mode="contained" buttonColor="#2e7d32" onPress={() => handleConfirm(item.id)} style={styles.flexBtn}>Duyệt</Button>
                                            <Button mode="contained" buttonColor="#c62828" onPress={() => handleReject(item.id)} style={[styles.flexBtn, { marginLeft: 8 }]}>Hủy lịch</Button>
                                        </View>
                                    )}

                                    {user && user.role === 'DOCTOR' && item.status === 'CONFIRMED' && (
                                        <Button 
                                            mode="contained" 
                                            buttonColor="#005b9f" 
                                            icon="medical-bag"
                                            onPress={() => navigation.navigate('MedicalExamination', { appointmentId: item.id, patientName: item.patient_name })}
                                            style={styles.fullBtn}
                                        >
                                            BẮT ĐẦU KHÁM BỆNH
                                        </Button>
                                    )}

                                    {item.status === 'COMPLETED' && (
                                        <View style={user && user.role === 'PATIENT' ? styles.rowButtons : null}>
                                            <Button 
                                                mode="contained" 
                                                buttonColor="#005b9f" 
                                                icon="file-document-outline"
                                                onPress={() => navigation.navigate('MedicalRecordDetail', { appointmentId: item.id })}
                                                style={user && user.role === 'PATIENT' ? styles.flexBtn : styles.fullBtn}
                                            >
                                                XEM BỆNH ÁN
                                            </Button>
                                            {user && user.role === 'PATIENT' && (
                                                <Button 
                                                    mode="contained" 
                                                    buttonColor="#0288d1" 
                                                    icon="credit-card-outline"
                                                    onPress={() => navigation.navigate('PaymentScreen', { appointmentId: item.id })}
                                                    style={[styles.flexBtn, { marginLeft: 8 }]}
                                                >
                                                    THANH TOÁN
                                                </Button>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Hiện tại chưa ghi nhận ca lịch hẹn nào.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, elevation: 2 },
    rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleText: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
    divider: { marginVertical: 8, backgroundColor: '#cfd8dc' },
    infoLine: { fontSize: 13, color: '#455a64', marginVertical: 3 },
    actionArea: { marginTop: 10 },
    rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    flexBtn: { flex: 1, borderRadius: 6 },
    fullBtn: { width: '100%', borderRadius: 6, paddingVertical: 2 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae' }
});

export default Appointment;