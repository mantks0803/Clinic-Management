import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    patientBanner: { fontSize: 16, fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#005b9f', padding: 12, borderRadius: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 8 },
    input: { marginBottom: 10, backgroundColor: '#fff' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    checkboxLabel: { fontSize: 14, color: '#495057' },
    medicineListHorizontal: { flexDirection: 'row', marginBottom: 15, paddingVertical: 5 },
    btnMedSelect: { marginRight: 8, borderColor: '#005b9f' },
    medCard: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
    medCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    medName: { fontSize: 14, fontWeight: 'bold', color: '#212529' },
    medCardBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    inputQty: { width: '20%', height: 45, backgroundColor: '#fff' },
    inputInstruction: { width: '76%', height: 45, backgroundColor: '#fff' },
    submitBtn: { padding: 4, borderRadius: 8, marginBottom: 40 }
});