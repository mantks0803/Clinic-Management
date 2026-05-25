import React, { useState, useContext } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API, { endpoints, authApi } from '../../configs/API';
import MyStyles from '../../styles/MyStyles';
import { MyDispatchContext } from '../../contexts/MyUserContext';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useContext(MyDispatchContext);

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
            form.append("client_id", "VzvqkjG57zWTprwUPi0CNbw2zONO3MNSroq6ZZfE");
            form.append("client_secret", "MS8cVeeDZhDaHjqXRK0gIOJb29lGw2DCYKGrKOjhQsyZMbP5rfWi3ZyXlp22QlCpFhZg0iVOCLWK3vHSTtNaJuOMfbP5MRfvmr8SLa9PVOTTwe9ZSeaq3WAcAbq0LKlq");
            form.append("grant_type", "password");

            let res = await API.post(endpoints['login'], form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await AsyncStorage.setItem("access_token", res.data.access_token);

            let user = await authApi(res.data.access_token).get(endpoints['current-user']);

            dispatch({
                "type": "login",
                "payload": user.data
            });

            Alert.alert("Thành công", "Đăng nhập thành công!");

        } catch (ex) {
            if (ex.response) {
                console.info(ex.response.data);
            }
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