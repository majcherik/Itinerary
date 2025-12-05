import { Stack } from 'expo-router';
import { AuthProvider } from '@itinerary/shared';
import { TripProvider } from '@itinerary/shared';

export default function Layout() {
    return (
        <AuthProvider>
            <TripProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </TripProvider>
        </AuthProvider>
    );
}
