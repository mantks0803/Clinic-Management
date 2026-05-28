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
import PaymentScreen from './screens/Patient/PaymentScreen';
import PaymentWebView from './screens/Patient/PaymentWebView';
import AdminInvoiceList from './screens/Admin/AdminInvoiceList';
import AdminRecordList from './screens/Admin/AdminRecordList';
import AdminAppointmentList from './screens/Admin/AdminAppointmentList';
import MedicalExamination from './screens/Doctor/MedicalExamination';
import CreateDoctor from './screens/Admin/CreateDoctor';
import ChatRoom from './screens/ChatRoom';

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
                        <Stack.Screen 
                            name="PaymentScreen" 
                            component={PaymentScreen} 
                            options={{ headerShown: true, title: "Hóa đơn viện phí", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="PaymentWebView" 
                            component={PaymentWebView} 
                            options={{ headerShown: true, title: "Cổng thanh toán VNPay", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="AdminInvoiceList" 
                            component={AdminInvoiceList} 
                            options={{ headerShown: true, title: "Chi tiết hóa đơn doanh thu", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="AdminRecordList" 
                            component={AdminRecordList} 
                            options={{ headerShown: true, title: "Danh sách bệnh nhân mắc bệnh", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="AdminAppointmentList" 
                            component={AdminAppointmentList} 
                            options={{ headerShown: true, title: "Danh sách ca lịch hẹn khoa", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="MedicalExamination" 
                            component={MedicalExamination} 
                            options={{ headerShown: true, title: "Phòng khám bệnh lâm sàng", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="CreateDoctor" 
                            component={CreateDoctor} 
                            options={{ headerShown: true, title: "Cấp tài khoản & Phân khoa", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
                        />
                        <Stack.Screen 
                            name="ChatRoom" 
                            component={ChatRoom} 
                            options={{ headerShown: true, title: "Tư vấn sức khỏe trực tuyến", headerTintColor: '#fff', headerStyle: { backgroundColor: '#005b9f' } }} 
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