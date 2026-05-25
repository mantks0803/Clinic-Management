import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentWebView = ({ route, navigation }) => {
    const { paymentUrl } = route.params;

    const handleNavigationStateChange = (navState) => {
        if (navState.url.includes('payos-callback')) {
            if (navState.url.includes('status=cancel')) {
                Alert.alert("Thông báo", "Bạn đã hủy bỏ giao dịch thanh toán viện phí!", [
                    { text: "OK", onPress: () => navigation.navigate('BottomTab') }
                ]);
            } else {
                Alert.alert("Thành công", "Bạn đã chi trả viện phí qua cổng PayOS thành công!", [
                    { text: "OK", onPress: () => navigation.navigate('BottomTab') }
                ]);
            }
        }
    };

    return (
        <View style={styles.container}>
            <WebView 
                source={{ uri: paymentUrl }} 
                onNavigationStateChange={handleNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' }
});

export default PaymentWebView;