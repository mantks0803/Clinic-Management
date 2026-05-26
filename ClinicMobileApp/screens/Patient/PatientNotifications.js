import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, List, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/API';

const PatientNotifications = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifs, setNotifs] = useState([]);

    const loadNotifications = async (showIndicator = true) => {
        if (showIndicator) setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApi(token).get('/api/v1/notifications/patient/');
            setNotifs(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications(true);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications(false);
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
                data={notifs}
                keyExtractor={item => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content style={{ paddingVertical: 5 }}>
                            <List.Item
                                title={item.title}
                                titleStyle={styles.titleStyle}
                                description={item.message}
                                descriptionNumberOfLines={4}
                                left={props => <List.Icon {...props} icon="bell-alert" color="#005b9f" />}
                            />
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Bạn không có lịch khám nào diễn ra trong 7 ngày tới.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
    titleStyle: { fontWeight: 'bold', color: '#005b9f' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae', paddingHorizontal: 20 }
});

export default PatientNotifications;