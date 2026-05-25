import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Button, List, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const PaymentScreen = ({ route, navigation }) => {
    const { appointmentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/invoices/by-appointment/?appointment_id=${appointmentId}`);
                setInvoice(res.data);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadInvoice();
    }, [appointmentId]);

    const handlePayOSPayment = async () => {
        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).post(`/api/v1/invoices/${invoice.id}/payos-payment/`);
            if (res.data.payment_url) {
                navigation.navigate('PaymentWebView', { paymentUrl: res.data.payment_url });
            } else {
                Alert.alert("Lỗi", "Không nhận được liên kết thanh toán từ PayOS!");
            }
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể khởi tạo cổng thanh toán PayOS!");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#005b9f" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    if (!invoice) {
        return (
            <View style={styles.center}><Text>Không tìm thấy thông tin hóa đơn viện phí.</Text></View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="CHI TIẾT VIỆN PHÍ" titleStyle={{ fontWeight: 'bold' }} left={props => <List.Icon {...props} icon="file-document-outline" color="#005b9f" />} />
                <Card.Content>
                    <List.Item title="Phí khám gốc cố định" description={`${parseInt(invoice.doc_fee).toLocaleString()} VND`} left={props => <List.Icon {...props} icon="doctor" />} />
                    <Divider />
                    <List.Item title="Tiền dịch vụ y tế cận lâm sàng" description={`${parseInt(invoice.services_total).toLocaleString()} VND`} left={props => <List.Icon {...props} icon="medical-bag" />} />
                    <Divider />
                    <List.Item title="Tiền thuốc kê đơn theo toa" description={`${parseInt(invoice.medicine_total).toLocaleString()} VND`} left={props => <List.Icon {...props} icon="pill" />} />
                    <Divider />
                    <List.Item title="Trạng thái hiện tại" description={invoice.status === 'PAID' ? "Đã thanh toán" : "Chưa thanh toán"} descriptionStyle={{ color: invoice.status === 'PAID' ? 'green' : 'red', fontWeight: 'bold' }} left={props => <List.Icon {...props} icon="credit-card-clock" />} />
                    <Divider />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TỔNG TIỀN CẦN TRẢ:</Text>
                        <Text style={styles.totalValue}>{parseInt(invoice.total_amount).toLocaleString()} VND</Text>
                    </View>
                </Card.Content>
            </Card>

            {invoice.status === 'UNPAID' ? (
                submitting ? <ActivityIndicator size="large" color="#005eff" /> : (
                    <Button mode="contained" icon="qrcode" onPress={handlePayOSPayment} style={styles.payBtn} buttonColor="#005eff">
                        THANH TOÁN QUA CỔNG PAYOS
                    </Button>
                )
            ) : (
                <Button mode="outlined" disabled style={styles.payBtn}>
                    HÓA ĐƠN ĐÃ ĐƯỢC CHI TRẢ
                </Button>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f3f5', padding: 12 },
    card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: 10, backgroundColor: '#e3f2fd', borderRadius: 6 },
    totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#005eff' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#005eff' },
    payBtn: { padding: 6, borderRadius: 8, marginHorizontal: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default PaymentScreen;