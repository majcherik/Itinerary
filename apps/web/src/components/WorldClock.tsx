'use client';
import {
    RelativeTime,
    RelativeTimeZone,
    RelativeTimeZoneDate,
    RelativeTimeZoneDisplay,
    RelativeTimeZoneLabel,
} from '@/components/ui/shadcn-io/relative-time';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Globe } from 'lucide-react';

const timezones = [
    { label: 'NYC', zone: 'America/New_York' },
    { label: 'LON', zone: 'Europe/London' },
    { label: 'PAR', zone: 'Europe/Paris' },
    { label: 'TOK', zone: 'Asia/Tokyo' },
    { label: 'SYD', zone: 'Australia/Sydney' },
    { label: 'LAX', zone: 'America/Los_Angeles' },
];

interface WorldClockProps {
    trigger?: React.ReactNode;
}

const WorldClock = ({ trigger }: WorldClockProps) => (
    <Drawer direction="right">
        <DrawerTrigger asChild>
            {trigger || (
                <Button variant="outline" className="gap-2">
                    <Globe size={16} />
                    World Clock
                </Button>
            )}
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>World Clock</DrawerTitle>
                <DrawerDescription>
                    Current time across major cities.
                </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
                <RelativeTime dateFormatOptions={{ dateStyle: 'full' }} className="gap-4">
                    {timezones.map(({ zone, label }) => (
                        <RelativeTimeZone key={zone} zone={zone}>
                            <RelativeTimeZoneLabel>{label}</RelativeTimeZoneLabel>
                            <RelativeTimeZoneDate className="text-muted-foreground text-sm" />
                            <RelativeTimeZoneDisplay className="pl-2 ml-auto font-medium text-text-primary" />
                        </RelativeTimeZone>
                    ))}
                </RelativeTime>
            </div>
            <DrawerFooter>
                <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
);

export default WorldClock;
