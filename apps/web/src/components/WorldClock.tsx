'use client';
import {
    RelativeTime,
    RelativeTimeZone,
    RelativeTimeZoneDate,
    RelativeTimeZoneDisplay,
    RelativeTimeZoneLabel,
} from '@/components/ui/shadcn-io/relative-time';

const timezones = [
    { label: 'NYC', zone: 'America/New_York' },
    { label: 'LON', zone: 'Europe/London' },
    { label: 'PAR', zone: 'Europe/Paris' },
    { label: 'TOK', zone: 'Asia/Tokyo' },
    { label: 'SYD', zone: 'Australia/Sydney' },
    { label: 'LAX', zone: 'America/Los_Angeles' },
];

const WorldClock = () => (
    <div className="card p-4 h-full flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">World Clock</h3>
        </div>
        <RelativeTime dateFormatOptions={{ dateStyle: 'full' }} className="gap-3">
            {timezones.map(({ zone, label }) => (
                <RelativeTimeZone key={zone} zone={zone}>
                    <RelativeTimeZoneLabel>{label}</RelativeTimeZoneLabel>
                    <RelativeTimeZoneDate className="hidden sm:block text-muted-foreground" />
                    <RelativeTimeZoneDisplay className="pl-2 ml-auto font-medium text-text-primary" />
                </RelativeTimeZone>
            ))}
        </RelativeTime>
    </div>
);

export default WorldClock;
