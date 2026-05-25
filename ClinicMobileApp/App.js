import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AppProvider from './components/AppProvider';
import { MyUserContext } from './contexts/MyUserContext';
import Login from './screens/User/Login';
import Register from './screens/User/Register';
import BottomTab from './navigations/BottomTab';
import MedicalRecordDetail from './screens/Patient/MedicalRecordDetail';

const Stack = createStackNavigator();

const Root = () => {
    const user = useContext(MyUserContext);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user === null ? (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="BottomTab" component={BottomTab} />
                        <Stack.Screen 
                            name="MedicalRecordDetail" 
                            component={MedicalRecordDetail} 
                            options={{ headerShown: true, title: "Chi tiết bệnh án & Toa thuốc", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AppProvider>
            <PaperProvider>
                <SafeAreaView style={{ flex: 1 }}>
                    <Root />
                </SafeAreaView>
            </PaperProvider>
        </AppProvider>
    );
}