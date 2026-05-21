import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientHome from '../screens/PatientHome';
import DoctorList from '../screens/DoctorList';
import BookAppointment from '../screens/BookAppointment';

const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="PatientHome" component={PatientHome} options={{ title: 'Chuyên khoa' }} />
            <Stack.Screen name="DoctorList" component={DoctorList} options={{ title: 'Danh sách Bác sĩ' }} />
            <Stack.Screen name="BookAppointment" component={BookAppointment} options={{ title: 'Đặt lịch hẹn' }} />
        </Stack.Navigator>
    );
};

export default HomeStack;