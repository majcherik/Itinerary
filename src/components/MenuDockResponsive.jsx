import React, { useMemo } from 'react';
import { MenuDock } from '@/components/ui/shadcn-io/menu-dock';
import { LayoutDashboard, Wallet, CheckSquare, FileText, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MenuDockResponsive() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();
    const match = location.pathname.match(/^\/trip\/(\d+)/);
    const id = match ? match[1] : null;

    const menuItems = useMemo(() => [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            onClick: () => navigate('/')
        },
        {
            label: 'Wallet',
            icon: Wallet,
            onClick: () => id && navigate(`/trip/${id}/wallet`)
        },
        {
            label: 'Packing',
            icon: CheckSquare,
            onClick: () => id && navigate(`/trip/${id}/packing`)
        },
        {
            label: 'Docs',
            icon: FileText,
            onClick: () => id && navigate(`/trip/${id}/docs`)
        },
        {
            label: 'Logout',
            icon: LogOut,
            onClick: () => signOut()
        },
    ], [navigate, id, signOut]);

    // Determine active index based on path
    const activeIndex = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return 0;
        if (path.includes('/wallet')) return 1;
        if (path.includes('/packing')) return 2;
        if (path.includes('/docs')) return 3;
        return 0; // Default to Dashboard
    }, [location.pathname]);

    return (
        <div className="fixed bottom-[10px] left-1/2 -translate-x-1/2 z-[99999] flex justify-center pointer-events-none w-auto">
            <div className="bg-bg-card border border-border-color shadow-2xl rounded-xl p-1 pointer-events-auto flex">
                <MenuDock
                    items={menuItems}
                    variant="compact"
                    className="lg:hidden bg-transparent border-none shadow-none"
                    activeIndex={activeIndex}
                    showLabels={false}
                />
                <MenuDock
                    items={menuItems}
                    variant="default"
                    className="hidden lg:flex bg-transparent border-none shadow-none"
                    activeIndex={activeIndex}
                    showLabels={true}
                />
            </div>
        </div>
    );
}
