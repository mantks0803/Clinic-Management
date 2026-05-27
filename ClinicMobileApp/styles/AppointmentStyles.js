import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },
    card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, elevation: 2 },
    rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleText: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
    divider: { marginVertical: 8, backgroundColor: '#cfd8dc' },
    infoLine: { fontSize: 13, color: '#455a64', marginVertical: 3 },
    actionArea: { marginTop: 10 },
    rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    flexBtn: { flex: 1, borderRadius: 6 },
    fullBtn: { width: '100%', borderRadius: 6, paddingVertical: 2 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#90a4ae' }
});