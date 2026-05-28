import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    chatHeader: { padding: 12, backgroundColor: '#005b9f', alignItems: 'center', justifyContent: 'center' },
    headerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 12, paddingVertical: 16 },
    bubbleContainer: { marginVertical: 6, flexDirection: 'row', width: '100%' },
    myBubbleAlign: { justifyContent: 'flex-end' },
    otherBubbleAlign: { justifyContent: 'flex-start' },
    bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, maxWith: '75%', elevation: 1 },
    myBubbleColor: { backgroundColor: '#005b9f', borderBottomRightRadius: 2 },
    otherBubbleColor: { backgroundColor: '#fff', borderBottomLeftRadius: 2, borderWidth: 0.5, borderColor: '#cfd8dc' },
    myText: { color: '#fff', fontSize: 15 },
    otherText: { color: '#263238', fontSize: 15 },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    myTimeColor: { color: '#e3f2fd' },
    otherTimeColor: { color: '#90a4ae' },
    inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#cfd8dc' },
    inputField: { flex: 1, backgroundColor: '#f8f9fa', marginRight: 8, maxHeight: 100 },
    sendBtn: { borderRadius: 8 }
});