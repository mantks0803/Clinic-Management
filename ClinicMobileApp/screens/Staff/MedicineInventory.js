import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { List, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/API';
import MyStyles from '../../styles/MyStyles';

const MedicineInventory = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await authApi(token).get(endpoints['medicine-batches']);
      setBatches(res.data.results || res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <View style={MyStyles.container}>
      <Text style={[MyStyles.subject, { margin: 10 }]}>QUẢN LÝ TỒN KHO THUỐC</Text>
      {loading ? <ActivityIndicator size="large" color="blue" /> : (
        <FlatList
          data={batches}
          keyExtractor={item => item.id.toString()}
          onRefresh={loadInventory}
          refreshing={loading}
          renderItem={({ item }) => (
            <List.Item
              title={`${item.medicine_name} - Lô: ${item.batch_number}`}
              description={`Số lượng tồn: ${item.quantity} | HSD: ${item.expiration_date}`}
              left={props => <List.Icon {...props} icon="pill" />}
              right={() => <Text style={{ alignSelf: 'center', fontWeight: 'bold' }}>{parseInt(item.selling_price).toLocaleString()}đ</Text>}
            />
          )}
        />
      )}
    </View>
  );
};

export default MedicineInventory;