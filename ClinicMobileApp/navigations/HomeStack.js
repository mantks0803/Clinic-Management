import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientHome from '../screens/PatientHome';
import DoctorList from '../screens/DoctorList';
const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PatientHome" component={PatientHome} />
            <Stack.Screen name="DoctorList" component={DoctorList} />
        </Stack.Navigator>
    );
};
export default HomeStack;