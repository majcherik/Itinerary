import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>TripPlanner Mobile</Text>
            <Text style={styles.subtitle}>Welcome to your new mobile app!</Text>
            <Link href="/details" style={styles.link}>Go to Details</Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fdfbf7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4a4036',
    },
    subtitle: {
        fontSize: 16,
        color: '#786c5e',
        marginTop: 8,
    },
    link: {
        marginTop: 20,
        color: '#8c7851',
        fontWeight: 'bold',
    },
});
