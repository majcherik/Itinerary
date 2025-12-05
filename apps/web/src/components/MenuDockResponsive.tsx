import React, { useMemo } from 'react';
import { MenuDock } from '@/components/ui/shadcn-io/menu-dock';
import { LayoutDashboard, Wallet, CheckSquare, FileText, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useMediaQuery } from '@itinerary/shared';

export default function MenuDockResponsive() {
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();
    const match = pathname.match(/^\/trip\/(\d+)/);
    const id = match ? match[1] : null;

    const menuItems = useMemo(() => [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            onClick: () => router.push('/')
        },
        {
            label: 'Wallet',
            icon: Wallet,
            onClick: () => id && router.push(`/trip/${id}/wallet`)
        },
        {
            label: 'Packing',
            icon: CheckSquare,
            onClick: () => id && router.push(`/trip/${id}/packing`)
        },
        {
            label: 'Docs',
            icon: FileText,
            onClick: () => id && router.push(`/trip/${id}/docs`)
        },
        {
            label: 'Logout',
            icon: LogOut,
            onClick: () => signOut()
        },
    ], [router, id, signOut]);

    // Determine active index based on path
    const activeIndex = useMemo(() => {
        if (pathname === '/') return 0;
        if (pathname.includes('/wallet')) return 1;
        if (pathname.includes('/packing')) return 2;
        if (pathname.includes('/docs')) return 3;
        return 0; // Default to Dashboard
    }, [pathname]);

    // Check for desktop view
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    return (
        <div className="fixed bottom-[10px] left-1/2 -translate-x-1/2 z-[99999] flex justify-center pointer-events-none w-auto">
            <div className="bg-bg-card border border-border-color shadow-2xl rounded-xl p-1 pointer-events-auto flex">
                {!isDesktop ? (
                    <MenuDock
                        items={menuItems}
                        variant="compact"
                        className="bg-transparent border-none shadow-none"
                        activeIndex={activeIndex}
                        showLabels={false}
                    />
                ) : (
                    <MenuDock
                        items={menuItems}
                        variant="default"
                        className="bg-transparent border-none shadow-none"
                        activeIndex={activeIndex}
                        showLabels={true}
                    />
                )}
            </div>
        </div>
    );
}
