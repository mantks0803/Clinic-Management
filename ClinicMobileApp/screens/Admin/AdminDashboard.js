import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, List, ProgressBar, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const AdminDashboard = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statData, setStatData] = useState(null);

    const fetchStatistics = async (showIndicator = true) => {
        if (showIndicator) setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get('/api/v1/statistics/');
            setStatData(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStatistics(true);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStatistics(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#005b9f" />
            </View>
        );
    }

    const formatCurrency = (val) => {
        return parseInt(val || 0).toLocaleString('vi-VN') + ' VND';
    };

    const getGenderLabel = (g) => {
        if (g === 'MALE') return 'Nam';
        if (g === 'FEMALE') return 'Nữ';
        return 'Khác';
    };

    const totalRev = statData?.doanh_thu_tong || 1;
    const pctTphcm = (statData?.doanh_thu_tphcm || 0) / totalRev;
    const pctOther = (statData?.doanh_thu_tinh_khac || 0) / totalRev;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Card style={styles.mainRevenueCard}>
                <Card.Content>
                    <Text style={styles.cardLabelMain}>TỔNG DOANH THU PHÒNG KHÁM</Text>
                    <Text style={styles.cardValueMain}>{formatCurrency(statData?.doanh_thu_tong)}</Text>
                    
                    <Divider style={styles.mainDivider} />
                    
                    <TouchableOpacity onPress={() => navigation.navigate('AdminInvoiceList', { region: 'TPHCM' })}>
                        <View style={styles.regionRow}>
                            <Text style={styles.regionLabel}>TP. Hồ Chí Minh ➔</Text>
                            <Text style={styles.regionValue}>{formatCurrency(statData?.doanh_thu_tphcm)}</Text>
                        </View>
                    </TouchableOpacity>
                    <ProgressBar progress={pctTphcm} color="#fff" style={styles.progress} />

                    <TouchableOpacity onPress={() => navigation.navigate('AdminInvoiceList', { region: 'OTHER' })}>
                        <View style={styles.regionRow}>
                            <Text style={styles.regionLabel}>Các tỉnh thành khác ➔</Text>
                            <Text style={styles.regionValue}>{formatCurrency(statData?.doanh_thu_tinh_khac)}</Text>
                        </View>
                    </TouchableOpacity>
                    <ProgressBar progress={pctOther} color="#b3e5fc" style={styles.progress} />
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>MÔ HÌNH BỆNH TẬT PHỔ BIẾN (BẤM XEM CHI TIẾT)</Text>
            <Card style={styles.listCard}>
                <Card.Content style={{ paddingVertical: 5 }}>
                    {statData?.benh_pho_bien?.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity onPress={() => navigation.navigate('AdminRecordList', { disease: item.diagnosis })}>
                                <List.Item
                                    title={item.diagnosis || "Chưa xác định"}
                                    description={`Ghi nhận: ${item.disease_count} trường hợp ➔`}
                                    left={props => <List.Icon {...props} icon="emoticon-sick-outline" color="#b71c1c" />}
                                    right={() => <Text style={styles.rankBadge}>Top {index + 1}</Text>}
                                />
                            </TouchableOpacity>
                            {index < statData.benh_pho_bien.length - 1 && <Divider />}
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>TẦN SUẤT SỬ DỤNG DỊCH VỤ Y TẾ</Text>
            <Card style={styles.listCard}>
                <Card.Content style={{ paddingVertical: 5 }}>
                    {statData?.dich_vu_su_dung?.map((item, index) => (
                        <View key={index}>
                            <List.Item
                                title={item.service__name}
                                description={`Số lần chỉ định thực hiện: ${item.usage_count} lần`}
                                left={props => <List.Icon {...props} icon="needle" color="#00796b" />}
                            />
                            {index < statData.dich_vu_su_dung.length - 1 && <Divider />}
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>NHÂN KHẨU HỌC BỆNH NHÂN</Text>
            
            <Card style={styles.subCard}>
                <Card.Title title="Phân bổ theo Khoa lâm sàng (Bấm xem lịch)" titleStyle={styles.subCardTitle} />
                <Card.Content>
                    {statData?.benh_nhan_theo_khoa?.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => navigation.navigate('AdminAppointmentList', { specialty: item.doctor__specialty__name })}>
                            <View style={styles.dataRow}>
                                <Text style={styles.dataLabel}>{item.doctor__specialty__name} ➔</Text>
                                <Text style={styles.dataValue}>{item.total_patients} bệnh nhân</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </Card.Content>
            </Card>

            <Card style={styles.subCard}>
                <Card.Title title="Phân bổ theo Phân lớp Độ tuổi" titleStyle={styles.subCardTitle} />
                <Card.Content>
                    {statData?.benh_nhan_theo_tuoi?.map((item, index) => (
                        <View key={index} style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{item.age_group}</Text>
                            <Text style={styles.dataValue}>{item.total} người</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <Card style={[styles.subCard, { marginBottom: 35 }]}>
                <Card.Title title="Phân bổ theo Giới tính cơ học" titleStyle={styles.subCardTitle} />
                <Card.Content>
                    {statData?.benh_nhan_theo_gioi_tinh?.map((item, index) => (
                        <View key={index} style={styles.dataRow}>
                            <Text style={styles.dataLabel}>{getGenderLabel(item.gender)}</Text>
                            <Text style={styles.dataValue}>{item.total} người</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    mainRevenueCard: { backgroundColor: '#005b9f', borderRadius: 12, elevation: 4, marginBottom: 15 },
    cardLabelMain: { color: '#e3f2fd', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center', marginTop: 10 },
    cardValueMain: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
    mainDivider: { backgroundColor: '#b3e5fc', opacity: 0.4, marginVertical: 10 },
    regionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 },
    regionLabel: { color: '#fff', fontSize: 14 },
    regionValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
    progress: { height: 6, borderRadius: 3, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#455a64', marginTop: 15, marginBottom: 8, letterSpacing: 0.3 },
    listCard: { backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
    rankBadge: { alignSelf: 'center', backgroundColor: '#ffebee', color: '#c62828', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    subCard: { backgroundColor: '#fff', borderRadius: 10, elevation: 2, marginBottom: 12 },
    subCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eceff1' },
    dataLabel: { fontSize: 14, color: '#37474f' },
    dataValue: { fontSize: 14, fontWeight: '600', color: '#005b9f' }
});

export default AdminDashboard;