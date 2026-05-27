import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, List, ProgressBar, Divider, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';
import styles from '../../styles/AdminStyles';

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

    const totalRev = statData?.doanh_thu_tong || 0;
    const hcmRev = statData?.doanh_thu_tphcm || 0;
    const otherRev = statData?.doanh_thu_tinh_khac || 0;
    const hcmProgress = totalRev > 0 ? hcmRev / totalRev : 0;
    const otherProgress = totalRev > 0 ? otherRev / totalRev : 0;

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <Card style={styles.mainRevenueCard}>
                <Card.Content>
                    <Text style={styles.cardLabelMain}>TỔNG DOANH THU PHÒNG KHÁM LÂM SÀNG</Text>
                    <Text style={styles.cardValueMain}>{parseInt(totalRev).toLocaleString('vi-VN')} đ</Text>
                    <Divider style={styles.mainDivider} />
                    
                    <TouchableOpacity onPress={() => navigation.navigate('AdminInvoiceList', { region: 'TPHCM' })}>
                        <View style={styles.regionRow}>
                            <Text style={styles.regionLabel}>📍 Khu vực TP. Hồ Chí Minh</Text>
                            <Text style={styles.regionValue}>{parseInt(hcmRev).toLocaleString('vi-VN')} đ</Text>
                        </View>
                        <ProgressBar progress={hcmProgress} color="#fff" style={styles.progress} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('AdminInvoiceList', { region: 'OTHER' })}>
                        <View style={styles.regionRow}>
                            <Text style={styles.regionLabel}>✈️ Các tỉnh thành khác</Text>
                            <Text style={styles.regionValue}>{parseInt(otherRev).toLocaleString('vi-VN')} đ</Text>
                        </View>
                        <ProgressBar progress={otherProgress} color="#b3e5fc" style={styles.progress} />
                    </TouchableOpacity>
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>QUẢN LÝ ĐIỀU HÀNH PHÒNG KHÁM</Text>
            <Card style={[styles.subCard, {backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#2e7d32'}]} onPress={() => navigation.navigate('CreateDoctor')}>
                <List.Item
                    title="Cấp tài khoản & Điều phối Bác sĩ mới"
                    description="Thêm nhân sự bác sĩ lâm sàng, ghim phòng ban khoa trực thuộc"
                    left={props => <List.Icon {...props} icon="account-plus-outline" color="#2e7d32" />}
                    right={props => <List.Icon {...props} icon="chevron-right" color="#2e7d32" />}
                />
            </Card>

            <Text style={styles.sectionTitle}>MÔ HÌNH BỆNH LÝ PHỔ BIẾN TẦN SUẤT CAO</Text>
            <Card style={styles.listCard}>
                <Card.Content style={{ paddingVertical: 5 }}>
                    {statData?.benh_pho_bien?.map((item, idx) => (
                        <View key={idx}>
                            <List.Item
                                title={item.diagnosis}
                                description={`Ghi nhận: ${item.disease_count} ca mắc bệnh lý`}
                                left={props => <List.Icon {...props} icon="virus-outline" color="#c62828" />}
                                right={() => <Text style={styles.rankBadge}>Top {idx + 1}</Text>}
                                onPress={() => navigation.navigate('AdminRecordList', { disease: item.diagnosis })}
                            />
                            {idx < statData.benh_pho_bien.length - 1 && <Divider />}
                        </View>
                    ))}
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>NHÂN KHẨU HỌC & PHÂN LOẠI CƠ CẤU</Text>
            <Card style={[styles.listCard, { marginBottom: 30 }]}>
                <Card.Content>
                    <List.Accordion title="Cơ cấu giới tính bệnh nhân" left={props => <List.Icon {...props} icon="gender-male-female" color="#005b9f" />}>
                        {statData?.benh_nhan_theo_gioi_tinh?.map((item, idx) => (
                            <View key={idx} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Giới tính: {item.gender === 'MALE' ? 'Nam giới' : item.gender === 'FEMALE' ? 'Nữ giới' : 'Khác'}</Text>
                                <Text style={styles.dataValue}>{item.total} người</Text>
                            </View>
                        ))}
                    </List.Accordion>
                    <Divider />

                    <List.Accordion title="Cơ cấu độ tuổi (Năm hiện tại 2026)" left={props => <List.Icon {...props} icon="account-group" color="#005b9f" />}>
                        {statData?.benh_nhan_theo_tuoi?.map((item, idx) => (
                            <View key={idx} style={styles.dataRow}>
                                <Text style={styles.dataLabel}>Nhóm tuổi: {item.age_group}</Text>
                                <Text style={styles.dataValue}>{item.total} bệnh nhân</Text>
                            </View>
                        ))}
                    </List.Accordion>
                    <Divider />

                    <List.Accordion title="Lượng khách đăng ký theo Chuyên khoa" left={props => <List.Icon {...props} icon="office-building-marker" color="#005b9f" />}>
                        {statData?.benh_nhan_theo_khoa?.map((item, idx) => (
                            <View key={idx}>
                                <TouchableOpacity style={styles.dataRow} onPress={() => navigation.navigate('AdminAppointmentList', { specialty: item.doctor__specialty__name })}>
                                    <Text style={styles.dataLabel}>Khoa: {item.doctor__specialty__name || "Chưa phân bổ"}</Text>
                                    <Text style={styles.dataValue}>{item.total_patients} khách</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </List.Accordion>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

export default AdminDashboard;