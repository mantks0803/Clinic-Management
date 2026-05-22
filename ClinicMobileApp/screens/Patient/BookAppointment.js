import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MyUserContext } from '../../contexts/MyUserContext';
import API, { endpoints, authApi } from '../../configs/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookAppointment = ({ route, navigation }) => {
    const { doctorId, doctorName } = route.params;
    const user = useContext(MyUserContext);
    const [date, setDate] = useState('');
    const [rawDate, setRawDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [timeSlot, setTimeSlot] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const timeSlots = ["08:00-08:30", "08:30-09:00", "09:00-09:30", "14:00-14:30", "14:30-15:00", "15:00-15:30"];

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setRawDate(selectedDate);
            let y = selectedDate.getFullYear();
            let m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            let d = String(selectedDate.getDate()).padStart(2, '0');
            setDate(`${y}-${m}-${d}`);
        }
    };

    const handleBooking = async () => {
        if (!date || !timeSlot || !reason) {
            Alert.alert("Thông báo", "Vui lòng điền đầy đủ các thông tin!");
            return;
        }
        if (!user || !user.patient) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin bệnh nhân!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const appointmentData = {
                patient: user.patient.id,
                doctor: doctorId,
                appointment_date: date,
                time_slot: timeSlot,
                reason: reason
            };
            await authApi(token).post(endpoints['appointments'], appointmentData);
            Alert.alert("Thành công", "Đặt lịch hẹn thành công!", [{ text: "OK", onPress: () => navigation.navigate('PatientHome') }]);
        } catch (ex) {
            Alert.alert("Lỗi đặt lịch", "Khung giờ này của bác sĩ đã có người đặt!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.label}>Bác sĩ tiếp nhận:</Text>
            <TextInput value={doctorName} editable={false} mode="outlined" style={styles.input} />

            <Text style={styles.label}>Ngày khám bệnh: *</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <View pointerEvents="none">
                    <TextInput value={date} placeholder="Bấm để chọn ngày khám" mode="outlined" style={styles.input} right={<TextInput.Icon icon="calendar" />} />
                </View>
            </TouchableOpacity>
            {showPicker && <DateTimePicker value={rawDate} mode="date" display="calendar" minimumDate={new Date()} onChange={onDateChange} />}

            <Text style={styles.label}>Chọn khung giờ khám: *</Text>
            <View style={styles.slotsRow}>
                {timeSlots.map((slot, index) => (
                    <TouchableOpacity key={index} style={[styles.slotButton, timeSlot === slot && styles.selectedSlot]} onPress={() => setTimeSlot(slot)}>
                        <Text style={[styles.slotText, timeSlot === slot && styles.selectedSlotText]}>{slot}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Lý do đến khám bệnh: *</Text>
            <TextInput value={reason} onChangeText={setReason} placeholder="Ví dụ: Đau đầu, chóng mặt..." multiline numberOfLines={4} mode="outlined" style={styles.input} />
            {loading ? <ActivityIndicator size="large" color="#005b9f" style={{ marginTop: 20 }} /> : <Button mode="contained" onPress={handleBooking} style={styles.button} buttonColor="#005b9f">XÁC NHẬN ĐẶT LỊCH NGAY</Button>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    label: { fontSize: 15, fontWeight: 'bold', color: '#343a40', marginTop: 12, marginBottom: 6 },
    input: { marginBottom: 8, backgroundColor: '#fff' },
    slotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
    slotButton: { width: '48%', backgroundColor: '#f1f3f5', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef' },
    selectedSlot: { backgroundColor: '#e3f2fd', borderColor: '#005b9f' },
    slotText: { fontSize: 14, color: '#495057', fontWeight: '500' },
    selectedSlotText: { color: '#005b9f', fontWeight: 'bold' },
    button: { marginTop: 20, padding: 4, borderRadius: 8, marginBottom: 40 }
});

export default BookAppointment;