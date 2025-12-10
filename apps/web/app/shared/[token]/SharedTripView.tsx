'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Skeleton } from '../../../src/components/ui/skeleton';
import { toast } from 'sonner';
import Tabs from '../../../src/components/Tabs';
import ItineraryTimeline from '../../../src/components/ItineraryTimeline';
import type { Trip } from '@itinerary/shared';
import { formatDate } from '@itinerary/shared';

interface SharedTripViewProps {
    token: string;
}

const SharedTripView: React.FC<SharedTripViewProps> = ({ token }) => {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        fetchSharedTrip();
    }, [token]);

    const fetchSharedTrip = async () => {
        try {
            const response = await fetch(`/api/share/${token}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError('This share link does not exist or has been removed.');
                } else if (response.status === 410) {
                    setError('This share link has expired.');
                } else {
                    setError('Failed to load shared trip.');
                }
                setLoading(false);
                return;
            }

            const data = await response.json();
            setTrip(data.trip);
            setIsPasswordProtected(data.shareLink.isPasswordProtected);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching shared trip:', error);
            setError('Failed to load shared trip.');
            setLoading(false);
        }
    };

    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);

        try {
            const response = await fetch(`/api/share/${token}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                toast.error('Incorrect password');
                setVerifying(false);
                return;
            }

            setIsUnlocked(true);
            toast.success('Access granted!');
        } catch (error) {
            console.error('Error verifying password:', error);
            toast.error('Failed to verify password');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-6xl mx-auto space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-primary mx-auto" />
                    <h1 className="text-2xl font-bold text-text-primary">Oops!</h1>
                    <p className="text-text-secondary">{error}</p>
                    <a href="/">
                        <Button className="bg-primary hover:bg-primary/90">Go to Homepage</Button>
                    </a>
                </div>
            </div>
        );
    }

    // Password protection screen
    if (isPasswordProtected && !isUnlocked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <Lock className="w-16 h-16 text-primary mx-auto" />
                        <h1 className="text-2xl font-bold text-text-primary">Password Protected</h1>
                        <p className="text-text-secondary">
                            This trip is password protected. Please enter the password to view.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyPassword} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            disabled={!password || verifying}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            {verifying ? 'Verifying...' : 'Unlock'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    if (!trip) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div
                className="relative h-64 bg-cover bg-center"
                style={{
                    backgroundImage: trip.hero_image
                        ? `url(${trip.hero_image})`
                        : 'linear-gradient(135deg, #e0525e 0%, #fff0e6 100%)',
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
                    <div className="flex items-center gap-4 text-white/90">
                        {trip.city && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{trip.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>
                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Read-only notice */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-900">
                        You're viewing a shared trip. This is a read-only view.
                    </p>
                </div>

                {/* Tabs */}
                <Tabs
                    tabs={[
                        {
                            id: 'itinerary',
                            label: 'Itinerary',
                            content: (
                                <div className="space-y-4">
                                    {trip.itinerary && trip.itinerary.length > 0 ? (
                                        trip.itinerary
                                            .sort((a, b) => {
                                                const dayA =
                                                    typeof a.day === 'number'
                                                        ? a.day
                                                        : parseInt(String(a.day));
                                                const dayB =
                                                    typeof b.day === 'number'
                                                        ? b.day
                                                        : parseInt(String(b.day));
                                                return dayA - dayB;
                                            })
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-4 bg-white rounded-lg shadow"
                                                >
                                                    <h3 className="font-bold text-lg text-text-primary">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary">
                                                        {item.date ? formatDate(item.date) : `Day ${item.day}`}
                                                        {item.time && ` • ${item.time}`}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-2 text-text-primary">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    {item.cost && (
                                                        <p className="mt-2 text-sm text-text-secondary">
                                                            Cost: ${Number(item.cost).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-center text-text-secondary py-8">
                                            No itinerary items
                                        </p>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'timeline',
                            label: 'Timeline',
                            content: trip.itinerary ? (
                                <ItineraryTimeline items={trip.itinerary} />
                            ) : (
                                <p className="text-center text-text-secondary py-8">
                                    No timeline available
                                </p>
                            ),
                        },
                        {
                            id: 'accommodation',
                            label: 'Accommodation',
                            content: (
                                <div className="space-y-4">
                                    {trip.accommodation && trip.accommodation.length > 0 ? (
                                        trip.accommodation.map((accom) => (
                                            <div
                                                key={accom.id}
                                                className="p-4 bg-white rounded-lg shadow"
                                            >
                                                <h3 className="font-bold text-lg text-text-primary">
                                                    {accom.name}
                                                </h3>
                                                {accom.address && (
                                                    <p className="text-sm text-text-secondary">
                                                        {accom.address}
                                                    </p>
                                                )}
                                                <p className="text-sm text-text-secondary mt-2">
                                                    Check-in: {formatDate(accom.checkIn)} • Check-out:{' '}
                                                    {formatDate(accom.checkOut)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-text-secondary py-8">
                                            No accommodations
                                        </p>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-r from-primary to-secondary rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Create Your Own Trip Itinerary
                    </h2>
                    <p className="text-white/90 mb-6">
                        Start planning your next adventure with our easy-to-use trip planner
                    </p>
                    <a href="/">
                        <Button className="bg-white text-primary hover:bg-white/90">
                            Get Started
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SharedTripView;
