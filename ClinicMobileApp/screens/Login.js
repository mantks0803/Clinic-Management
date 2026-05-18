import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { endpoints } from '../configs/API';
import MyStyles from '../styles/MyStyles';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
            return;
        }

        setLoading(true);
        
        try {
            let form = new FormData();
            form.append("username", username);
            form.append("password", password);
            form.append("client_id", "GnrqA2ozeDH6WbBPXfUMC1YzfD5gkbrMqCDpZvKc"); 
            form.append("client_secret", "OtXQ5acgA4zjiakcQ031TeX323jtDbJU9OId030F2IP7wEfhRBjC5Nh3ebQDff74SZ6N7n96x0N8daXkFHcSSC7akyjuGaUomquMBc23YkAQlgfHYH3wQdDk12azcOPC");
            form.append("grant_type", "password");

            let res = await API.post(endpoints['login'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await AsyncStorage.setItem("access_token", res.data.access_token);
            Alert.alert("Thành công", "Đăng nhập thành công! Đã có Token.");

        } catch (ex) {
            console.error(ex);
            Alert.alert("Lỗi đăng nhập", "Tài khoản hoặc mật khẩu không đúng!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[MyStyles.container, MyStyles.margin, { justifyContent: 'center' }]}>
            <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: 10 }}>🏥🧑‍⚕️💉</Text>
            <Text style={MyStyles.subject}>PHÒNG KHÁM OU</Text>

            <TextInput
                label="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                style={MyStyles.margin}
                mode="outlined"
            />

            <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                style={MyStyles.margin}
                mode="outlined"
            />

            {loading ? <ActivityIndicator size="large" color="blue" /> : (
                <Button 
                    mode="contained" 
                    onPress={handleLogin} 
                    style={[MyStyles.margin, { marginTop: 20, padding: 5 }]}
                    buttonColor="#005b9f"
                >
                    ĐĂNG NHẬP
                </Button>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
                <Text style={{ textAlign: 'center', color: 'blue', fontSize: 16 }}>
                    Chưa có tài khoản? Đăng ký ngay
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Login;