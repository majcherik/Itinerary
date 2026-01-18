"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
    ArrowUp,
    Facebook,
    Github,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Twitter,
} from "lucide-react";

const footerLinks = [
    {
        title: "Product",
        links: [
            { name: "Dashboard", href: "/" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy (GDPR)", href: "/gdpr" },
            { name: "Terms of Service", href: "/terms" },
        ],
    },
];

const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Github, label: "GitHub", href: "#" },
];

export function FooterBlock() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const shouldReduceMotion = useReducedMotion();

    return (
        <footer
            aria-labelledby="footer-heading"
            className="relative w-full overflow-hidden border-t border-border bg-card/50 backdrop-blur-xl mt-auto"
        >
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <motion.div
                    className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[160px]"
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : { opacity: [0.1, 0.25, 0.1], scale: [0.9, 1.05, 0.95] }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : { duration: 12, repeat: Infinity, ease: "easeInOut" }
                    }
                />
            </div>
            <h2 id="footer-heading" className="sr-only">
                Site footer
            </h2>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-3"
                    >
                        <motion.div
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 inline-flex items-center gap-3"
                        >
                            <Card className="rounded-2xl border border-border/60 bg-card/80 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted-foreground shadow-sm">
                                TripPlanner
                            </Card>
                            <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                            >
                                Beta
                            </Badge>
                        </motion.div>
                        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                            Simplifying your journey with modern travel planning tools.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <motion.div
                                whileHover={shouldReduceMotion ? undefined : { x: 5 }}
                                className="flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" aria-hidden />
                                <span>hello@tripplanner.io</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer Links */}
                    {footerLinks.map((section, sectionIndex) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                        >
                            <h4 className="mb-4 text-sm font-semibold text-foreground/90">
                                {section.title}
                            </h4>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <motion.li
                                        key={link.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: linkIndex * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition-all hover:text-primary hover:pl-1"
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="my-6 h-px bg-border/50"
                />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-2"
                    >
                        {socialLinks.map((social, index) => (
                            <Button
                                key={social.label}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full border border-border/40 bg-white/5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                aria-label={social.label}
                            >
                                <social.icon className="h-4 w-4" aria-hidden />
                            </Button>
                        ))}
                    </motion.div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                        <span>© {new Date().getFullYear()} TripPlanner. All rights reserved.</span>
                    </motion.div>

                    {/* Scroll to Top */}
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full border-border/60"
                        onClick={scrollToTop}
                    >
                        <ArrowUp className="h-4 w-4" aria-hidden />
                    </Button>
                </div>
            </div>
        </footer>
    );
}
