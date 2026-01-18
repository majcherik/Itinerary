'use client';

import React from 'react';
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PanelLeft } from "lucide-react";
import { FooterBlock } from "@/components/FooterBlock";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

function SidebarLayoutContent({ children }: SidebarLayoutProps) {
    const { open, isMobile } = useSidebar();

    // Calculate margin-left based on sidebar state (desktop only)
    const marginLeft = isMobile ? 0 : open ? '16rem' : '5rem';

    return (
        <main
            className="min-h-svh flex-1 flex flex-col bg-background transition-[padding-left] duration-200 ease-linear"
            style={{ paddingLeft: marginLeft }}
        >
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-[5]">
                <SidebarTrigger className="-ml-1">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </SidebarTrigger>
                <span className="text-sm text-muted-foreground mr-auto">Toggle Sidebar</span>
                <div className="flex-1" />
            </header>
            <div className="flex-1 p-4 overflow-auto">
                {children}
            </div>
            <FooterBlock />
        </main>
    );
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarLayoutContent>{children}</SidebarLayoutContent>
        </SidebarProvider>
    );
}
