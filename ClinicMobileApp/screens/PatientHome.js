import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Card, IconButton } from 'react-native-paper';
import API, { endpoints } from '../configs/API';
import { MyUserContext } from '../contexts/MyUserContext';

const PatientHome = ({ navigation }) => {
    const user = useContext(MyUserContext);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSpecialties = async () => {
            setLoading(true);
            try {
                let res = await API.get(endpoints['specialties']);
                if (res.data && res.data.results) {
                    setSpecialties(res.data.results);
                } else if (Array.isArray(res.data)) {
                    setSpecialties(res.data);
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        };
        loadSpecialties();
    }, []);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.welcomeRow}>
                <View>
                    <Text style={styles.greetingText}>Xin chào 👋</Text>
                    <Text style={styles.userNameText}>
                        {user ? `${user.last_name} ${user.first_name}` : "Bệnh nhân"}
                    </Text>
                </View>
                <Avatar.Icon size={45} icon="account" backgroundColor="#005b9f" color="#fff" />
            </View>

            <Card style={styles.hotlineCard}>
                <Card.Content style={styles.hotlineContent}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.hotlineTitle}>Hỗ trợ khẩn cấp 24/7</Text>
                        <Text style={styles.hotlineSub}>Bấm để gọi tổng đài tư vấn sức khỏe</Text>
                    </View>
                    <IconButton icon="phone-in-talk" iconColor="#fff" backgroundColor="#d32f2f" size={24} />
                </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Danh mục chuyên khoa</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#005b9f" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={specialties}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    ListHeaderComponent={renderHeader}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.gridItem}
                            onPress={() => navigation.navigate('DoctorList', { specialtyId: item.id })}
                        >
                            <View style={styles.iconWrapper}>
                                <IconButton icon="hospital-box" iconColor="#005b9f" size={30} />
                            </View>
                            <Text style={styles.itemTitle} numberOfLines={2}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        padding: 16,
    },
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 14,
        color: '#6c757d',
    },
    userNameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    hotlineCard: {
        backgroundColor: '#005b9f',
        borderRadius: 12,
        marginBottom: 24,
    },
    hotlineContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    hotlineTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    hotlineSub: {
        color: '#e3f2fd',
        fontSize: 12,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 12,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    gridItem: {
        backgroundColor: '#fff',
        width: '48%',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconWrapper: {
        backgroundColor: '#e3f2fd',
        borderRadius: 50,
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#343a40',
        textAlign: 'center',
    },
});

export default PatientHome;