'use client';

import { Badge } from "@/components/ui/badge";
import { Home, Wallet, CheckSquare, FileText, Map, LogOut, ChevronUp, Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useProfile } from '@itinerary/shared';
import WorldClock from './WorldClock';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();
    const { data: profile } = useProfile();

    // Extract trip ID from path if present
    const match = pathname.match(/^\/trip\/(\d+)/);
    const tripId = match ? match[1] : null;

    const navigationItems = [
        {
            title: 'Dashboard',
            url: '/',
            icon: Home,
            alwaysEnabled: true,
        },
        {
            title: 'Wallet',
            url: tripId ? `/trip/${tripId}/wallet` : '#',
            icon: Wallet,
            alwaysEnabled: false,
        },
        {
            title: 'Packing',
            url: tripId ? `/trip/${tripId}/packing` : '#',
            icon: CheckSquare,
            alwaysEnabled: false,
        },
        {
            title: 'Docs',
            url: tripId ? `/trip/${tripId}/docs` : '#',
            icon: FileText,
            alwaysEnabled: false,
        },
        {
            title: 'Map',
            url: tripId ? `/trip/${tripId}/map` : '#',
            icon: Map,
            alwaysEnabled: false,
        },
    ];

    const isActive = (url: string) => {
        if (url === '/') return pathname === '/';
        return pathname.startsWith(url);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/auth');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'User';
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold">
                                T
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <div className="flex items-center gap-2">
                                    <span className="truncate font-bold text-foreground">TripPlanner</span>
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 font-normal">Beta</Badge>
                                </div>
                                <span className="truncate text-xs text-muted-foreground">
                                    {tripId ? `Trip #${tripId}` : 'No trip selected'}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => {
                                const isEnabled = item.alwaysEnabled || tripId;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild={isEnabled ? true : false}
                                            isActive={isActive(item.url)}
                                            tooltip={item.title}
                                            disabled={!isEnabled}
                                            className={!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {isEnabled ? (
                                                <a href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </a>
                                            ) : (
                                                <>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <WorldClock trigger={
                            <SidebarMenuButton tooltip="World Clock">
                                <Globe />
                                <span>World Clock</span>
                            </SidebarMenuButton>
                        } />
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-accent-primary text-white font-semibold text-sm">
                                        {initials}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{displayName}</span>
                                        <span className="truncate text-xs text-muted-foreground">{profile?.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="top"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onClick={() => router.push('/profile')}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/settings')}>
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 size-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
