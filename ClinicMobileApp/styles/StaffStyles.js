import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
    titleStyle: { fontWeight: 'bold', color: '#c62828' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae', paddingHorizontal: 20 },
    serviceBtn: { margin: 10, padding: 4, borderRadius: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginHorizontal: 12, marginTop: 15, marginBottom: 5 }
});