import React from 'react';
import { View, Text } from 'react-native';
import MyStyles from '../../styles/MyStyles';

const Profile = () => {
    return (
        <View style={[MyStyles.container, MyStyles.center]}>
            <Text>Hồ sơ</Text>
        </View>
    );
};
export default Profile;