import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/Home';
import Appointment from '../screens/Appointment';
import Profile from '../screens/Profile';
import HomeStack from './HomeStack';
const Tab = createBottomTabNavigator();

const BottomTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Appointment') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#005b9f',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Trang chủ' }} />
            <Tab.Screen name="Appointment" component={Appointment} options={{ title: 'Lịch hẹn' }} />
            <Tab.Screen name="Profile" component={Profile} options={{ title: ' Hồ sơ cá nhân' }} />
        </Tab.Navigator>
    );
};

export default BottomTab;