/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@itinerary/shared'],
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-dropdown-menu'],
    },
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
};

module.exports = nextConfig;
