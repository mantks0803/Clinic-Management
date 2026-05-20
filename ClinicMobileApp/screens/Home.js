import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { List } from 'react-native-paper';
import API, { endpoints } from '../configs/API';
import MyStyles from '../styles/MyStyles';

const Home = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            let res = await API.get(endpoints['doctors']);
            setDoctors(res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    return (
        <View style={MyStyles.container}>
            {loading ? <ActivityIndicator size="large" color="blue" style={{marginTop: 20}}/> : (
                <FlatList 
                    data={doctors}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.full_name}
                            description={item.specialty.name}
                            left={() => <List.Icon icon="doctor" />}
                        />
                    )}
                />
            )}
        </View>
    );
};

export default Home;