import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    subject: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#004c87", //
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
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    textBlue: {
        color: 'blue',
        fontSize: 16
    }
});