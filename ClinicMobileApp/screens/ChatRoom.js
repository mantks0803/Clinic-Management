import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../configs/firebase';
import { MyUserContext } from '../contexts/MyUserContext';
import styles from '../styles/ChatStyles';

const ChatRoom = ({ route }) => {
    const { appointmentId, receiverName } = route.params;
    const user = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef();

    useEffect(() => {
        const msgCollectionRef = collection(db, 'chats', appointmentId.toString(), 'messages');
        const q = query(msgCollectionRef, orderBy('created_at', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setMessages(list);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [appointmentId]);

    const handleSendMessage = async () => {
        if (!text.trim()) return;
        const currentText = text;
        setText('');

        try {
            const msgCollectionRef = collection(db, 'chats', appointmentId.toString(), 'messages');
            await addDoc(msgCollectionRef, {
                sender_id: user.id,
                sender_role: user.role,
                text: currentText,
                created_at: new Date().getTime()
            });
        } catch (ex) {
            console.error(ex);
            // Bồi thêm dòng Alert này để check lỗi trên điện thoại:
            Alert.alert("Lỗi kết nối Firebase", ex.message || "Không thể gửi tin nhắn!");
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const hr = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${hr}:${min}`;
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={80}>
            <View style={styles.chatHeader}>
                <Text style={styles.headerText}>Tư vấn: {receiverName}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#005b9f" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item }) => {
                        const isMe = item.sender_id === user.id;
                        return (
                            <View style={[styles.bubbleContainer, isMe ? styles.myBubbleAlign : styles.otherBubbleAlign]}>
                                <View style={[styles.bubble, isMe ? styles.myBubbleColor : styles.otherBubbleColor]}>
                                    <Text style={isMe ? styles.myText : styles.otherText}>{item.text}</Text>
                                    <Text style={[styles.timeText, isMe ? styles.myTimeColor : styles.otherTimeColor]}>
                                        {formatTime(item.created_at)}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Nhập nội dung ..."
                    value={text}
                    onChangeText={setText}
                    mode="flat"
                    multiline
                    style={styles.inputField}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                />
                <IconButton
                    icon="send"
                    mode="contained"
                    containerColor="#005b9f"
                    iconColor="#fff"
                    size={24}
                    onPress={handleSendMessage}
                    style={styles.sendBtn}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatRoom;