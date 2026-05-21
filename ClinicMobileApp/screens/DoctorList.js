import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { List, ActivityIndicator, Avatar } from 'react-native-paper';
import API, { endpoints } from '../configs/API';

const DoctorList = ({ route, navigation }) => {
    const { specialtyId } = route.params; 
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDoctors = async () => {
            setLoading(true);
            try {
                let res = await API.get(`${endpoints['doctors']}?specialty_id=${specialtyId}`);
                if (res.data && res.data.results) {
                    setDoctors(res.data.results);
                } else if (Array.isArray(res.data)) {
                    setDoctors(res.data);
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, [specialtyId]);

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#005b9f" style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={doctors}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.card}
                            onPress={() => navigation.navigate('BookAppointment', { doctorId: item.id, doctorName: item.full_name })}
                        >
                            <List.Item
                                title={item.full_name}
                                titleStyle={{ fontWeight: 'bold', color: '#212529' }}
                                description={item.phone || "Chưa cập nhật SĐT"}
                                descriptionStyle={{ color: '#6c757d' }}
                                left={() => <Avatar.Icon size={40} icon="doctor" backgroundColor="#e3f2fd" color="#005b9f" />}
                            />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: 'gray' }}>Không có bác sĩ nào thuộc khoa này</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    }
});

export default DoctorList;