import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', marginTop: 12, color: '#212529' },
    role: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    infoSection: { padding: 10, backgroundColor: '#fff', marginTop: 15 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#455a64', marginHorizontal: 16, marginTop: 15 },
    logoutBtn: { margin: 16, padding: 4, borderRadius: 8, marginTop: 30 },
    input: { marginBottom: 10, backgroundColor: '#fff' },
    genderLabel: { fontSize: 15, fontWeight: '500', color: '#495057', marginTop: 6 },
    genderRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 }
});