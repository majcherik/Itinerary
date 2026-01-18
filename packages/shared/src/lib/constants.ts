export const QUERY_KEYS = {
    trips: ['trips'] as const,
    trip: (id: string | number) => ['trip', id] as const,
    profile: (userId?: string) => userId ? ['profile', userId] : ['profile'] as const,
    preferences: (userId?: string) => userId ? ['preferences', userId] : ['preferences'] as const,
};
