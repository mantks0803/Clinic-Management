import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Card, Chip, ActivityIndicator, Badge, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { MyUserContext } from '../contexts/MyUserContext';
import API, { endpoints, authApi } from '../configs/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Appointment = ({ navigation }) => {
    const user = useContext(MyUserContext);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('ALL');

    const isDoctor = user?.role === 'DOCTOR';

    const loadAppointments = async (showProgress = true) => {
        if (!user) return;
        if (showProgress) setLoading(true);

        try {
            const token = await AsyncStorage.getItem("access_token");
            let url = `${endpoints['appointments']}?`;
            
            if (isDoctor) {
                url += `doctor=${user.doctor?.id}`;
            } else {
                url += `patient=${user.patient?.id}`;
            }

            const res = await authApi(token).get(url);
            let data = res.data.results || res.data || [];
            data.sort((a, b) => b.id - a.id);
            setAppointments(data);
            applyFilter(selectedFilter, data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAppointments(true);
        }, [user, selectedFilter])
    );

    const handleAction = async (id, actionType) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const path = actionType === 'CONFIRM' ? 'confirm' : 'reject';
            await authApi(token).post(`${endpoints['appointments']}${id}/${path}/`);
            Alert.alert("Thành công", actionType === 'CONFIRM' ? "Đã duyệt lịch hẹn!" : "Đã từ chối lịch hẹn!");
            loadAppointments(false);
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể thực hiện thao tác này!");
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (filterType, allData = appointments) => {
        setSelectedFilter(filterType);
        if (filterType === 'ALL') setFilteredAppointments(allData);
        else setFilteredAppointments(allData.filter(item => item.status === filterType));
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ xử lý', color: '#ff9800' };
            case 'CONFIRMED': return { label: 'Đã duyệt', color: '#2e7d32' };
            case 'CANCELLED': return { label: 'Đã hủy', color: '#d32f2f' };
            case 'COMPLETED': return { label: 'Hoàn thành', color: '#00796b' };
            default: return { label: status, color: '#6c757d' };
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                <Chip selected={selectedFilter === 'ALL'} onPress={() => applyFilter('ALL')} style={styles.chip}>Tất cả</Chip>
                <Chip selected={selectedFilter === 'PENDING'} onPress={() => applyFilter('PENDING')} style={styles.chip}>Đang chờ</Chip>
                <Chip selected={selectedFilter === 'CONFIRMED'} onPress={() => applyFilter('CONFIRMED')} style={styles.chip}>Đã duyệt</Chip>
                <Chip selected={selectedFilter === 'COMPLETED'} onPress={() => applyFilter('COMPLETED')} style={styles.chip}>Hoàn thành</Chip>
            </View>

            <Text style={styles.headerTitle}>{isDoctor ? "YÊU CẦU ĐẶT LỊCH KHÁM" : "LỊCH HẸN CỦA TÔI"}</Text>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#005b9f" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAppointments(false); }} />}
                    renderItem={({ item }) => {
                        const statusInfo = getStatusDetails(item.status);
                        return (
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.mainInfo}>
                                            {isDoctor ? `BN: ${item.patient_name}` : `BS: ${item.doctor_name}`}
                                        </Text>
                                        <Badge style={{ backgroundColor: statusInfo.color, color: '#fff' }}>{statusInfo.label}</Badge>
                                    </View>
                                    <View style={styles.divider} />
                                    <Text style={styles.subInfo}>📅 Ngày: {item.appointment_date}  |  ⏰ Giờ: {item.time_slot}</Text>
                                    <Text style={styles.subInfo}>📝 Lý do: {item.reason}</Text>

                                    {isDoctor && item.status === 'PENDING' && (
                                        <View style={styles.actionRow}>
                                            <Button mode="contained" onPress={() => handleAction(item.id, 'CONFIRM')} style={[styles.btnAction, {backgroundColor: '#2e7d32'}]}>DUYỆT</Button>
                                            <Button mode="outlined" onPress={() => handleAction(item.id, 'REJECT')} textColor="#d32f2f" style={styles.btnAction}>TỪ CHỐI</Button>
                                        </View>
                                    )}

                                    {isDoctor && item.status === 'CONFIRMED' && (
                                        <View style={styles.actionRow}>
                                            <Button 
                                                mode="contained" 
                                                icon="stethoscope"
                                                onPress={() => navigation.navigate('Trang chủ Stack', {
                                                    screen: 'MedicalExamination',
                                                    params: { appointmentId: item.id, patientName: item.patient_name }
                                                })} 
                                                style={[styles.btnAction, {flex: 1, backgroundColor: '#005b9f'}]}
                                            >
                                                BẮT ĐẦU KHÁM BỆNH
                                            </Button>
                                        </View>
                                    )}

                                    {item.status === 'COMPLETED' && (
                                        <View style={styles.actionRow}>
                                            <Button 
                                                mode="contained" 
                                                icon="file-document"
                                                buttonColor="#005b9f"
                                                onPress={() => navigation.navigate('MedicalRecordDetail', { appointmentId: item.id })}
                                                style={{ flex: 1 }}
                                            >
                                                XEM BỆNH ÁN & ĐƠN THUỐC
                                            </Button>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có lịch hẹn nào</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    filterRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', elevation: 3 },
    headerTitle: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#005b9f', marginTop: 15 },
    card: { marginBottom: 12, borderRadius: 10, backgroundColor: '#fff' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainInfo: { fontSize: 16, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
    subInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    btnAction: { flex: 0.48 },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    chip: { height: 35 }
});

export default Appointment;