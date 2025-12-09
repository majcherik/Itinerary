export const QUERY_KEYS = {
    trips: ['trips'] as const,
    trip: (id: string | number) => ['trip', id] as const,
};
