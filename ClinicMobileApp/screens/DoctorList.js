import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { List, ActivityIndicator } from 'react-native-paper';
import API, { endpoints } from '../configs/API';

const DoctorList = ({ route }) => {
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
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {loading ? <ActivityIndicator size="large" color="#005b9f" style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={doctors}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.full_name}
                            description={item.phone || "Chưa cập nhật số điện thoại"}
                            left={() => <List.Icon icon="doctor" color="#005b9f" />}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: 'gray' }}>Không có bác sĩ nào thuộc khoa này</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};
export default DoctorList;