import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Portal, Dialog, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../configs/API';
import { MyUserContext } from '../contexts/MyUserContext';
import styles from '../styles/AppointmentStyles';

const Appointment = ({ navigation }) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appointments, setAppointments] = useState([]);
    
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

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

    const openCancelDialog = (id) => {
        setSelectedId(id);
        setCancelReason('');
        setDialogVisible(true);
    };

    const handlePatientCancel = async () => {
        if (!cancelReason.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập lý do hủy lịch hẹn!");
            return;
        }
        setCancelLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApi(token).post(`/api/v1/appointments/${selectedId}/cancel/`, {
                reason: cancelReason
            });
            setDialogVisible(false);
            Alert.alert("Thành công", "Bạn đã hủy ca hẹn khám thành công!");
            loadAppointments(false);
        } catch (ex) {
            Alert.alert("Thất bại", "Không thể thực hiện hủy lịch lúc này!");
        } finally {
            setCancelLoading(false);
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
                                {item.status === 'CANCELLED' && item.cancel_reason && (
                                    <Text style={[styles.infoLine, {color: '#c62828', fontWeight: 'bold'}]}>Lý do hủy: {item.cancel_reason}</Text>
                                )}

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

                                    {user && user.role === 'PATIENT' && (item.status === 'PENDING' || item.status === 'CONFIRMED') && (
                                        <Button 
                                            mode="contained" 
                                            buttonColor="#c62828" 
                                            icon="calendar-remove"
                                            onPress={() => openCancelDialog(item.id)}
                                            style={[styles.fullBtn, {marginTop: 4}]}
                                        >
                                            HỦY LỊCH KHÁM NÀY
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

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Xác nhận hủy lịch khám</Dialog.Title>
                    <Dialog.Content>
                        <Text style={{marginBottom: 10, color: '#555'}}>Vui lòng nhập lý do hủy lịch hẹn để hệ thống lưu vết thông tin lâm sàng:</Text>
                        <TextInput
                            label="Lý do hủy lịch (*)"
                            value={cancelReason}
                            onChangeText={setCancelReason}
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)} disabled={cancelLoading}>QUAY LẠI</Button>
                        {cancelLoading ? <ActivityIndicator size="small" color="red" style={{marginRight: 15}} /> : (
                            <Button onPress={handlePatientCancel} textColor="red">XÁC NHẬN HỦY</Button>
                        )}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default Appointment;