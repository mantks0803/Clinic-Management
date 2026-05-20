import React from 'react';
import { View, Text } from 'react-native';
import MyStyles from '../styles/MyStyles';

const Appointment = () => {
    return (
        <View style={[MyStyles.container, MyStyles.center]}>
            <Text>Lịch hẹn</Text>
        </View>
    );
};
export default Appointment;