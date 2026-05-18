import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        backgroundColor: '#ffffff',
    },
    subject: {
        fontSize: 25,
        fontWeight: "bold",
        color: "blue",
        textAlign: "center",
        marginBottom: 20
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center"
    },
    margin: {
        margin: 5
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40
    }
});