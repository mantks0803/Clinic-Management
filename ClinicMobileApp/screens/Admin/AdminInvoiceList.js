import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const AdminInvoiceList = ({ route }) => {
    const { region } = route.params;
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/invoices/?region=${region}`);
                setInvoices(res.data.results || res.data || []);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, [region]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#005b9f" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titleHead}>
                KHU VỰC: {region === 'TPHCM' ? 'TP. HỒ CHÍ MINH' : 'NGOẠI TỈNH'}
            </Text>
            
            <FlatList
                data={invoices}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.rowJustify}>
                                <Text style={styles.invoiceId}>Mã HĐ: #{item.id}</Text>
                                <Chip 
                                    mode="flat" 
                                    selectedColor={item.status === 'PAID' ? '#2e7d32' : '#c62828'}
                                    style={{ backgroundColor: item.status === 'PAID' ? '#e8f5e9' : '#ffebee' }}
                                >
                                    {item.status === 'PAID' ? 'Đã thu tiền' : 'Chưa thu tiền'}
                                </Chip>
                            </View>
                            
                            <Text style={styles.label}>Bệnh nhân:</Text>
                            <Text style={styles.valueName}>{item.patient_name || "Khách hàng hệ thống"}</Text>
                            
                            <View style={styles.rowJustify}>
                                <Text style={styles.label}>Tổng viện phí:</Text>
                                <Text style={styles.priceValue}>
                                    {parseInt(item.total_amount).toLocaleString('vi-VN')} đ
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Không tìm thấy hóa đơn nào cho khu vực này</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    titleHead: { fontSize: 14, fontWeight: 'bold', color: '#546e7a', marginBottom: 12, letterSpacing: 0.5, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, elevation: 2 },
    rowJustify: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
    invoiceId: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
    label: { fontSize: 13, color: '#78909c', marginTop: 6 },
    valueName: { fontSize: 15, fontWeight: '600', color: '#37474f', marginBottom: 6 },
    priceValue: { fontSize: 16, fontWeight: 'bold', color: '#005b9f' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae' }
});

export default AdminInvoiceList;