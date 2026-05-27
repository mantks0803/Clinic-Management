import React, { useContext } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Button, List, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext, MyDispatchContext } from '../../contexts/MyUserContext';
import styles from '../../styles/UserStyles';

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

    const getEmail = () => {
        if (user?.email && user.email !== "") return user.email;
        return "Chưa cập nhật";
    };

    const getPhone = () => {
        if (!user) return "Chưa cập nhật";
        if (user.role === 'PATIENT') return user.patient?.phone || "Chưa cập nhật";
        if (user.role === 'DOCTOR') return user.doctor?.phone || "Chưa cập nhật";
        return "Chưa cập nhật";
    };

    const getDob = () => {
        if (!user) return "Chưa cập nhật";
        if (user.role === 'PATIENT') return user.patient?.dob || "Chưa cập nhật";
        if (user.role === 'DOCTOR') return user.doctor?.dob || "Chưa cập nhật";
        return "Chưa cập nhật";
    };

    const getAddress = () => {
        if (!user) return "Chưa cập nhật";
        if (user.role === 'PATIENT') return user.patient?.address || "Chưa cập nhật";
        if (user.role === 'DOCTOR') return user.doctor?.address || "Chưa cập nhật";
        return "Chưa cập nhật";
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                {user && user.avatar ? (
                    <Avatar.Image size={80} source={{ uri: user.avatar }} />
                ) : (
                    <Avatar.Icon size={80} icon="account" backgroundColor="#005b9f" color="#fff" />
                )}
                <Text style={styles.name}>
                    {user ? `${user.last_name} ${user.first_name}` : "Người dùng"}
                </Text>
                <Text style={styles.role}>
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 
                     user?.role === 'DOCTOR' ? 'Bác sĩ chuyên khoa' : 
                     user?.role === 'STAFF' ? 'Nhân viên kho dược' : 'Bệnh nhân'}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>THÔNG TIN HỒ SƠ CHI TIẾT</Text>
            
            <View style={styles.infoSection}>
                <List.Item
                    title="Tên tài khoản"
                    description={user?.username || "Chưa ghi nhận"}
                    left={props => <List.Icon {...props} icon="account-box-outline" />}
                />
                <Divider />
                <List.Item
                    title="Email"
                    description={getEmail()}
                    left={props => <List.Icon {...props} icon="email-outline" />}
                />
                <Divider />
                <List.Item
                    title="Số điện thoại"
                    description={getPhone()}
                    left={props => <List.Icon {...props} icon="phone" />}
                />
                <Divider />
                <List.Item
                    title="Ngày sinh"
                    description={getDob()}
                    left={props => <List.Icon {...props} icon="calendar" />}
                />
                <Divider />
                <List.Item
                    title="Địa chỉ / Quê quán"
                    description={getAddress()}
                    left={props => <List.Icon {...props} icon="map-marker" />}
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

export default Profile;