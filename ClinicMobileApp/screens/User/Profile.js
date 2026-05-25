import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Button, List, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext, MyDispatchContext } from '../../contexts/MyUserContext';

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);

    const handleLogout = () => {
        Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất tài khoản không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('access_token');
                    dispatch({ type: 'logout' }); 
                }
            }
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text 
                    size={80} 
                    label={user?.first_name ? user.first_name.substring(0, 2).toUpperCase() : "OU"} 
                    backgroundColor="#005b9f" 
                    color="#fff"
                />
                <Text style={styles.name}>{user?.last_name} {user?.first_name}</Text>
                <Text style={styles.role}>Vai trò: {user?.role}</Text>
            </View>

            <Divider />

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>
                <List.Item
                    title="Tên đăng nhập"
                    description={user?.username || "Chưa cập nhật"}
                    left={props => <List.Icon {...props} icon="account-box" />}
                />
                <List.Item
                    title="Địa chỉ Email"
                    description={user?.email || "Chưa cập nhật"}
                    left={props => <List.Icon {...props} icon="email" />}
                />
                <List.Item
                    title="Số điện thoại"
                    description={user?.phone || "Chưa cập nhật"}
                    left={props => <List.Icon {...props} icon="phone" />}
                />
                <List.Item
                    title="Ngày sinh"
                    description={user?.dob || "Chưa cập nhật"}
                    left={props => <List.Icon {...props} icon="calendar" />}
                />
            </View>

            <Button 
                mode="contained" 
                icon="logout"
                onPress={handleLogout}
                style={styles.logoutBtn}
                buttonColor="#b71c1c"
            >
                ĐĂNG XUẤT TÀI KHOẢN
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', marginTop: 12, color: '#212529' },
    role: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    infoSection: { padding: 10, backgroundColor: '#fff', marginTop: 15 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#005b9f', marginLeft: 15, marginTop: 10 },
    logoutBtn: { margin: 20, marginTop: 40, padding: 4 }
});

export default Profile;