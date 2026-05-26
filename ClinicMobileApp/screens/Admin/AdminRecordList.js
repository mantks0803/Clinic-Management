import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const AdminRecordList = ({ route }) => {
    const { disease } = route.params;
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const loadRecords = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await authApi(token).get(`/api/v1/medical-records/?diagnosis=${disease}`);
                setRecords(res.data.results || res.data || []);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadRecords();
    }, [disease]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#005b9f" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titleHead}>BỆNH LÝ: {disease.toUpperCase()}</Text>
            
            <FlatList
                data={records}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.rowAlign}>
                                <Avatar.Icon size={36} icon="account-box" backgroundColor="#ffebee" color="#c62828" style={{ marginRight: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.patientName}>{item.patient_name || "Bệnh nhân hệ thống"}</Text>
                                    <Text style={styles.dateText}>Ngày lập hồ sơ: {item.created_at_display || item.created_at?.split('T')[0]}</Text>
                                </View>
                            </View>
                            <Divider style={{ marginVertical: 8 }} />
                            <Text style={styles.subLabel}>Triệu chứng lâm sàng:</Text>
                            <Text style={styles.subValue}>{item.symptoms || "Không có ghi nhận"}</Text>
                            
                            <Text style={styles.subLabel}>Lời dặn dặn của bác sĩ:</Text>
                            <Text style={styles.subValue}>{item.notes || "Không có dặn dò"}</Text>
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Chưa có bệnh nhân nào ghi nhận mắc bệnh lý này</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    titleHead: { fontSize: 14, fontWeight: 'bold', color: '#c62828', marginBottom: 12, letterSpacing: 0.5, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, elevation: 2 },
    rowAlign: { flexDirection: 'row', alignItems: 'center' },
    patientName: { fontSize: 16, fontWeight: 'bold', color: '#263238' },
    dateText: { fontSize: 12, color: '#78909c' },
    subLabel: { fontSize: 12, color: '#78909c', marginTop: 4 },
    subValue: { fontSize: 14, color: '#37474f', marginBottom: 4, fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae' }
});

export default AdminRecordList;