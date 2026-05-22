import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import HomeStack from './HomeStack';
import Appointment from '../screens/Appointment';
import Profile from '../screens/User/Profile';
import MedicineInventory from '../screens/Staff/MedicineInventory';
import StaffStack from './StaffStack'; // Đổi từ ImportMedicine sang StaffStack
import { MyUserContext } from '../contexts/MyUserContext';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const user = useContext(MyUserContext);

    return (
        <Tab.Navigator>
            {user && user.role === 'STAFF' ? (
                <>
                    <Tab.Screen 
                        name="MedicineInventory" 
                        component={MedicineInventory} 
                        options={{ title: 'Kho thuốc', tabBarIcon: ({ color }) => <Icon source="package-variant-closed" size={30} color={color} /> }} 
                    />
                    {/* Component đổi thành StaffStack và tắt headerShown của Tab đi vì Stack con có header riêng rồi */}
                    <Tab.Screen 
                        name="ImportMedicine" 
                        component={StaffStack} 
                        options={{ title: 'Nhập thuốc', headerShown: false, tabBarIcon: ({ color }) => <Icon source="plus-box" size={30} color={color} /> }} 
                    />
                </>
            ) : (
                <>
                    <Tab.Screen 
                        name="Trang chủ Stack" 
                        component={HomeStack} 
                        options={{ title: 'Trang chủ', headerShown: false, tabBarIcon: ({ color }) => <Icon source="home" size={30} color={color} /> }} 
                    />
                    <Tab.Screen 
                        name="Lịch hẹn" 
                        component={Appointment} 
                        options={{ title: 'Lịch hẹn', tabBarIcon: ({ color }) => <Icon source="calendar" size={30} color={color} /> }} 
                    />
                </>
            )}
            <Tab.Screen 
                name="Profile" 
                component={Profile} 
                options={{ title: 'Cá nhân', tabBarIcon: ({ color }) => <Icon source="account" size={30} color={color} /> }} 
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;