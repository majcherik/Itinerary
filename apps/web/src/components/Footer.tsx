import React from 'react';
import Link from 'next/link';

const YEAR = new Date().getFullYear();

const LINKS = [
    { title: "Dashboard", href: "/" },
    { title: "GDPR", href: "/gdpr" },
    { title: "Terms of Service", href: "/terms" },
];

export default function Footer() {
    return (
        <footer className="w-full border-t pb-8 pt-16 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-row flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-border pt-8 text-center md:justify-between">
                    <p className="text-foreground text-sm">
                        Copyright &copy; {YEAR} TripPlanner
                    </p>
                    <ul className="flex flex-wrap items-center justify-center gap-6">
                        {LINKS.map(({ title, href }, key) => (
                            <li key={key}>
                                <Link
                                    href={href}
                                    className="text-foreground hover:text-primary text-sm transition-colors"
                                >
                                    {title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
