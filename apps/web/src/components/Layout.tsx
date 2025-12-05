import React from 'react';
import Link from 'next/link';

// Cast Link to any to avoid "cannot be used as a JSX component" error
const LinkAny = Link as any;
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();

    return (
        <div className="min-h-screen pb-24">
            <header className="py-6 border-b border-border-color mb-8 bg-bg-secondary">
                <div className="container max-w-5xl mx-auto flex justify-between items-center px-4">
                    <LinkAny href="/" className="no-underline">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                            TripPlanner
                        </h1>
                    </LinkAny>
                    <div className="w-8 h-8 rounded-full bg-bg-card border border-border-color"></div>
                </div>
            </header>
            <main key={pathname} className="container max-w-5xl mx-auto px-4 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
