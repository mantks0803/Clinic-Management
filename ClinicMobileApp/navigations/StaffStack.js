import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ImportMedicine from '../screens/Staff/ImportMedicine';
import CreateNewMedicine from '../screens/Staff/CreateNewMedicine';
import CreateMedicalService from '../screens/Staff/CreateMedicalService';

const Stack = createStackNavigator();

const StaffStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ImportMedicineMain" 
                component={ImportMedicine} 
                options={{ title: 'Lập phiếu nhập kho' }} 
            />
            <Stack.Screen 
                name="CreateNewMedicine" 
                component={CreateNewMedicine} 
                options={{ title: 'Thêm thuốc gốc mới' }} 
            />
            <Stack.Screen 
                name="CreateMedicalService" 
                component={CreateMedicalService} 
                options={{ title: 'Thêm dịch vụ y tế mới' }} 
            />
        </Stack.Navigator>
    );
};

export default StaffStack;