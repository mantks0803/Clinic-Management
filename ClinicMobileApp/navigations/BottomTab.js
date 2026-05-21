import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import Appointment from '../screens/Appointment';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Trang chủ Stack') iconName = 'home';
                    else if (route.name === 'Lịch hẹn') iconName = 'calendar';
                    else if (route.name === 'Hồ sơ cá nhân') iconName = 'account';
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#005b9f',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen 
                name="Trang chủ Stack" 
                component={HomeStack} 
                options={{ 
                    headerShown: false, 
                    title: 'Trang chủ' 
                }} 
            />
            <Tab.Screen 
                name="Lịch hẹn" 
                component={Appointment} 
                options={{ title: 'Lịch hẹn của tôi' }}
            />
            <Tab.Screen 
                name="Hồ sơ cá nhân" 
                component={Profile} 
                options={{ title: 'Hồ sơ bệnh nhân' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTab;