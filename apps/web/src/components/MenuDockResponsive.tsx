import React, { useMemo } from 'react';
import { Home, Wallet, CheckSquare, FileText, Map, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@itinerary/shared';
import { cn } from '@/lib/utils';

export default function MenuDockResponsive() {
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();
    const match = pathname.match(/^\/trip\/(\d+)/);
    const id = match ? match[1] : null;

    const menuItems = useMemo(() => [
        {
            label: 'Dashboard',
            icon: Home,
            onClick: () => router.push('/'),
            alwaysEnabled: true
        },
        {
            label: 'Wallet',
            icon: Wallet,
            onClick: () => id && router.push(`/trip/${id}/wallet`),
            alwaysEnabled: false
        },
        {
            label: 'Packing',
            icon: CheckSquare,
            onClick: () => id && router.push(`/trip/${id}/packing`),
            alwaysEnabled: false
        },
        {
            label: 'Docs',
            icon: FileText,
            onClick: () => id && router.push(`/trip/${id}/docs`),
            alwaysEnabled: false
        },
        {
            label: 'Map',
            icon: Map,
            onClick: () => id && router.push(`/trip/${id}/map`),
            alwaysEnabled: false
        },
        {
            label: 'Logout',
            icon: LogOut,
            onClick: () => signOut(),
            alwaysEnabled: true
        },
    ], [router, id, signOut]);

    // Determine active index based on path
    const isActive = (index: number) => {
        if (index === 0 && pathname === '/') return true;
        if (index === 1 && pathname.includes('/wallet')) return true;
        if (index === 2 && pathname.includes('/packing')) return true;
        if (index === 3 && pathname.includes('/docs')) return true;
        if (index === 4 && pathname.includes('/map')) return true;
        return false;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center w-full p-3 bg-gradient-to-b from-black/5 to-transparent backdrop-blur-sm z-50 pointer-events-none">
            <nav className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-yellow-300/20 backdrop-blur-md transform hover:scale-[1.02] transition-all duration-300 max-w-[95%] sm:max-w-[450px] pointer-events-auto">
                <div className="flex items-center justify-center space-x-2 sm:space-x-6">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(index);
                        const isEnabled = item.alwaysEnabled || id;
                        const iconColor = isEnabled
                            ? 'text-yellow-100/80 group-hover:text-yellow-300'
                            : 'text-gray-400/50';

                        return (
                            <div key={item.label} className="relative group">
                                <button
                                    onClick={item.onClick}
                                    disabled={!isEnabled}
                                    className={cn(
                                        "p-1.5 sm:p-2 rounded-full transition-all duration-300 active:scale-95",
                                        isEnabled && "hover:bg-white/5 cursor-pointer hover:shadow-[0_0_15px_rgba(251,191,36,0.1)]",
                                        !isEnabled && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300",
                                            iconColor,
                                            active && isEnabled && "text-yellow-300"
                                        )}
                                    />
                                </button>
                                <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                                    <div className="bg-black/85 backdrop-blur-md text-yellow-300 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg whitespace-nowrap font-light tracking-wider shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-yellow-300/10">
                                        {item.label}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                            <div className="border-4 border-transparent border-t-black/85" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
