import '../src/index.css';
import { Outfit } from 'next/font/google';
import Providers from './providers';
import { Toaster } from 'sonner';
import PageTransition from '../src/components/PageTransition';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
    title: 'Pink Skies',
    description: 'Effortless Trip Planning',
};

import BackgroundGradient from '../src/components/BackgroundGradient';

// ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <BackgroundGradient />
                <Providers>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </Providers>
                {/* @ts-ignore */}
                <Toaster position="top-center" richColors />
            </body>
        </html>
    );
}
