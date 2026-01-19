import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Cast Link to any to avoid "cannot be used as a JSX component" error
const LinkAny = Link as any;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyCalculator from '../components/CurrencyCalculator';
import { convertFromUSD } from '../lib/currency-utils';
import Modal from '../components/Modal';
import ShareTripModal from '../components/ShareTripModal';
import ExportMenu from '../components/ExportMenu';
import CollaboratorAvatars from '../components/CollaboratorAvatars';
import CollaboratorModal from '../components/CollaboratorModal';
import { MapPin, Calendar, Home, Train, Plus, Clock, Copy, Check, ArrowLeft, Share2, MoreVertical, Edit2, CheckCircle2, Circle, X, ExternalLink, Banknote, Trash2, Map as MapIcon, List, Users } from 'lucide-react';
import { useTrip, useCopyToClipboard, useDocumentTitle, useLocalStorage, useIsOwner, useCanEdit, Trip, ItineraryItem, AccommodationItem, TransportItem, formatDate, formatDateTime } from '@itinerary/shared';
import FadeIn from '../components/FadeIn';
import { Skeleton } from '../components/ui/skeleton';
import ItineraryTimeline from '../components/ItineraryTimeline';
import ExpensesTab from '../components/expenses/ExpensesTab';
import AnimatedDeleteButton from '../components/AnimatedDeleteButton';
import Breadcrumbs from '../components/Breadcrumbs';
import TripOverviewMap from '../components/maps/TripOverviewMap';
import ItineraryMap from '../components/maps/ItineraryMap';
import AccommodationMap from '../components/maps/AccommodationMap';
import TransportRouteMap from '../components/maps/TransportRouteMap';
import LocationPicker from '../components/maps/LocationPicker';
import AddressSearchInput from '../components/maps/AddressSearchInput';

interface TripDetailsProps {
    tripId?: string | number;
}

const TripDetails: React.FC<TripDetailsProps> = ({ tripId: propTripId }) => {
    const params = useParams();
    const router = useRouter();
    const id = propTripId || params?.id;

    const [copiedText, copy] = useCopyToClipboard();
    const {
        trips,
        loading,
        deleteTrip,
        updateTrip,
        addItineraryItem,
        deleteItineraryItem,
        addAccommodation,
        deleteAccommodation,
        addTransport,
        deleteTransport
    } = useTrip();

    const trip = trips.find(t => t.id === Number(id));
    useDocumentTitle(trip ? `${trip.title} | TripPlanner` : 'Trip Details | TripPlanner');

    // Collaboration
    const { isOwner } = useIsOwner(Number(id));
    const { canEdit } = useCanEdit(Number(id));

    // Modal State
    const [activeModal, setActiveModal] = useState<'itinerary' | 'accommodation' | 'transport' | null>(null);
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

    // Form States
    interface ItineraryFormState {
        day: string;
        date: string;
        description: string;
        items: { title: string; cost: string }[];
        latitude?: number;
        longitude?: number;
        locationName?: string;
    }
    const [itineraryForm, setItineraryForm] = useState<ItineraryFormState>({ day: '', date: '', description: '', items: [{ title: '', cost: '' }], latitude: undefined, longitude: undefined, locationName: '' });

    interface AccommodationFormState {
        name: string;
        address: string;
        checkIn: string;
        checkOut: string;
        type: string;
        cost: string;
        latitude?: number;
        longitude?: number;
    }
    const [accommodationForm, setAccommodationForm] = useState<AccommodationFormState>({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '', latitude: undefined, longitude: undefined });

    interface TransportFormState {
        type: string;
        number: string;
        from: string;
        to: string;
        depart: string;
        arrive: string;
        cost: string;
        departure_latitude?: number;
        departure_longitude?: number;
        arrival_latitude?: number;
        arrival_longitude?: number;
    }
    const [transportForm, setTransportForm] = useState<TransportFormState>({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '', departure_latitude: undefined, departure_longitude: undefined, arrival_latitude: undefined, arrival_longitude: undefined });

    // Calculate Total Cost
    const totalCost = React.useMemo(() => {
        if (!trip) return 0;
        const itineraryCost = (trip.itinerary || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const accommodationCost = (trip.accommodation || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const transportCost = (trip.transport || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        return itineraryCost + accommodationCost + transportCost;
    }, [trip]);

    // Memoize sorted lists to prevent O(n log n) sorting on every render
    const sortedItinerary = React.useMemo(() =>
        (trip?.itinerary || []).toSorted((a, b) => a.day - b.day),
        [trip?.itinerary]
    );

    const [currency, setCurrency] = useState('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useLocalStorage(`trip-details-tab-${id}`, 'itinerary');
    const [itineraryView, setItineraryView] = useState<'timeline' | 'map'>('timeline');

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Skeleton className="h-10 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <Skeleton className="h-4 w-20" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 border-b border-border-color">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-24" />)}
                </div>
                <div className="space-y-4 mt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold text-text-secondary">Trip not found</h2>
                <Button asChild>
                    <LinkAny href="/">
                        Return to Dashboard
                    </LinkAny>
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this trip?')) {
            deleteTrip(trip.id);
            toast.success('Trip deleted successfully');
            router.push('/');
        }
    };

    // Handlers
    const handleSaveItinerary = () => {
        if (!itineraryForm.day) return;

        itineraryForm.items.forEach(item => {
            if (item.title) {
                addItineraryItem(id as string, {
                    id: Date.now() + Math.random(),
                    day: Number(itineraryForm.day),
                    date: itineraryForm.date,
                    description: itineraryForm.description,
                    title: item.title,
                    cost: item.cost,
                    latitude: itineraryForm.latitude,
                    longitude: itineraryForm.longitude,
                    location_name: itineraryForm.locationName
                });
            }
        });
        toast.success('Itinerary items added');
        setActiveModal(null);
        setItineraryForm({ day: '', date: '', description: '', items: [{ title: '', cost: '' }], latitude: undefined, longitude: undefined, locationName: '' });
    };

    const handleAddItemRow = React.useCallback(() => {
        setItineraryForm(curr => ({
            ...curr,
            items: [...curr.items, { title: '', cost: '' }]
        }));
    }, []); // No dependencies needed with functional update

    const handleRemoveItemRow = React.useCallback((index: number) => {
        setItineraryForm(curr => ({
            ...curr,
            items: curr.items.filter((_, i) => i !== index)
        }));
    }, []); // No dependencies needed with functional update

    const handleItemChange = React.useCallback((index: number, field: keyof { title: string; cost: string }, value: string) => {
        setItineraryForm(curr => ({
            ...curr,
            items: curr.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    }, []); // No dependencies needed with functional update

    const handleSaveAccommodation = () => {
        if (!accommodationForm.name) return;
        addAccommodation(id as string, {
            ...accommodationForm,
            id: Date.now(),
            latitude: accommodationForm.latitude,
            longitude: accommodationForm.longitude
        });
        toast.success('Accommodation added');
        setActiveModal(null);
        setAccommodationForm({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '', latitude: undefined, longitude: undefined });
    };

    const handleSaveTransport = () => {
        if (!transportForm.type || !transportForm.number) return;
        addTransport(id as string, {
            ...transportForm,
            id: Date.now(),
            departure_latitude: transportForm.departure_latitude,
            departure_longitude: transportForm.departure_longitude,
            arrival_latitude: transportForm.arrival_latitude,
            arrival_longitude: transportForm.arrival_longitude
        });
        toast.success('Transport added');
        setActiveModal(null);
        setTransportForm({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '', departure_latitude: undefined, departure_longitude: undefined, arrival_latitude: undefined, arrival_longitude: undefined });
    };

    const Itinerary = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Itinerary</h3>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 border border-border-color rounded-md p-1">
                        <Button
                            variant={itineraryView === 'timeline' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setItineraryView('timeline')}
                            className="h-7 text-xs px-2 gap-1 rounded-sm"
                        >
                            <List size={14} />
                            Timeline
                        </Button>
                        <Button
                            variant={itineraryView === 'map' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setItineraryView('map')}
                            className="h-7 text-xs px-2 gap-1 rounded-sm"
                        >
                            <MapIcon size={14} />
                            Map
                        </Button>
                    </div>
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => setActiveModal('itinerary')} className="h-8 text-xs gap-1">
                            <Plus size={14} /> Add Item
                        </Button>
                    )}
                </div>
            </div>

            {/* Timeline View */}
            {itineraryView === 'timeline' && (
                <div className="relative border-l-2 border-border-color ml-3 pl-6 space-y-8">
                    {sortedItinerary.map((item, index) => (
                        <div key={item.id || item.day} className="relative">
                            <div className="absolute -left-[2.4rem] bg-accent-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10">
                                {item.day}
                            </div>
                            <div className="card group relative pr-10">
                                {canEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this event?')) {
                                                deleteItineraryItem(id as string, item.id as string);
                                            }
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-50 shadow-md transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">{formatDate(item.date)}</span>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg mt-1">{item.title}</h4>
                                    {item.cost && <span className="text-sm font-semibold text-text-primary bg-bg-secondary px-2 py-1 rounded">${item.cost}</span>}
                                </div>
                                <p className="text-text-secondary text-sm mt-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                    {sortedItinerary.length === 0 && <p className="text-text-secondary italic">No itinerary items yet.</p>}
                </div>
            )}

            {/* Map View */}
            {itineraryView === 'map' && (
                <ItineraryMap items={sortedItinerary} showRoutes={true} />
            )}
        </div>
    );

    const Accommodation = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Stays</h3>
                {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => setActiveModal('accommodation')} className="h-8 text-xs gap-1">
                        <Plus size={14} /> Add Stay
                    </Button>
                )}
            </div>
            <div className="grid gap-4">
                {(trip.accommodation || []).map((place, index) => (
                    <FadeIn key={place.id || place.name} delay={index * 100}>
                        <div className="card flex gap-4 group relative pr-10">
                            {canEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this accommodation?')) {
                                            deleteAccommodation(id as string, place.id as string);
                                        }
                                    }}
                                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-50 shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Accommodation"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <div className="p-3 bg-bg-primary rounded-lg h-fit">
                                <Home size={24} className="text-accent-secondary" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-accent-secondary uppercase tracking-wider">{place.type}</span>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg">{place.name}</h4>
                                    {place.cost && <span className="text-sm font-semibold text-text-primary bg-bg-secondary px-2 py-1 rounded">${place.cost}</span>}
                                </div>
                                <div className="flex items-center gap-1 text-text-secondary text-sm mt-1">
                                    <MapPin size={14} />
                                    <span>{place.address}</span>
                                    <button
                                        className="ml-2 p-1 hover:bg-bg-secondary rounded-full text-text-secondary hover:text-accent-primary transition-colors"
                                        onClick={() => {
                                            copy(place.address);
                                            toast.success('Address copied to clipboard');
                                        }}
                                        title="Copy Address"
                                    >
                                        {copiedText === place.address ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 text-text-secondary text-sm mt-1">
                                    <Calendar size={14} />
                                    <span>{formatDate(place.checkIn)} - {formatDate(place.checkOut)}</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
                {(trip.accommodation || []).length === 0 && <p className="text-text-secondary italic">No accommodation added yet.</p>}
            </div>

            {/* Accommodation Map */}
            {(trip.accommodation || []).length > 0 && (
                <AccommodationMap accommodations={trip.accommodation || []} className="mt-2" />
            )}
        </div>
    );

    const Transport = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Transport</h3>
                {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => setActiveModal('transport')} className="h-8 text-xs gap-1">
                        <Plus size={14} /> Add Transport
                    </Button>
                )}
            </div>
            <div className="grid gap-4">
                {(trip.transport || []).map((ride, index) => (
                    <FadeIn key={ride.id || ride.number} delay={index * 100}>
                        <div className="card group relative pr-10">
                            {canEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this transport?')) {
                                            deleteTransport(id as string, ride.id as string);
                                        }
                                    }}
                                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-50 shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Transport"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-bg-primary rounded-lg">
                                        <Train size={24} className="text-accent-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{ride.type} {ride.number}</h4>
                                        <p className="text-text-secondary text-xs">{ride.from} → {ride.to}</p>
                                    </div>
                                </div>
                                {ride.cost && <span className="text-sm font-semibold text-text-primary bg-bg-secondary px-2 py-1 rounded">${ride.cost}</span>}
                            </div>

                            <div className="flex justify-between items-center text-sm mb-4">
                                <div>
                                    <span className="text-text-secondary text-xs block">Depart</span>
                                    <span className="font-semibold">{formatDateTime(ride.depart)}</span>
                                </div>
                                <div className="h-px bg-border-color flex-1 mx-4"></div>
                                <div className="text-right">
                                    <span className="text-text-secondary text-xs block">Arrive</span>
                                    <span className="font-semibold">{formatDateTime(ride.arrive)}</span>
                                </div>
                            </div>

                            {/* Transport Route Map */}
                            {ride.departure_latitude && ride.departure_longitude && ride.arrival_latitude && ride.arrival_longitude && (
                                <TransportRouteMap transport={ride} className="mt-4" />
                            )}
                        </div>
                    </FadeIn>
                ))}
                {(trip.transport || []).length === 0 && <p className="text-text-secondary italic">No transport added yet.</p>}
            </div>
        </div >
    );

    const MapView = () => (
        <div className="flex flex-col gap-4">
            <div className="card p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px] bg-bg-secondary/30 border-dashed border-2 border-border-color">
                <div className="p-4 bg-bg-primary rounded-full shadow-sm">
                    <MapPin size={48} className="text-accent-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Map View</h3>
                    <p className="text-text-secondary max-w-md mx-auto mb-6">
                        Visualize your trip itinerary and saved locations on an interactive map.
                    </p>
                    <Button asChild className="gap-2">
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.city || trip.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MapPin size={18} /> Open {trip.city || trip.title} in Google Maps
                        </a>
                    </Button>
                </div >
            </div >

            <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Home size={18} className="text-accent-secondary" /> Stays
                    </h4>
                    {(trip.accommodation || []).length > 0 ? (
                        <ul className="space-y-3">
                            {(trip.accommodation || []).map((place, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <MapPin size={14} className="mt-1 text-text-secondary" />
                                    <span>{place.name} <span className="text-text-secondary">- {place.address}</span></span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary italic text-sm">No accommodation added.</p>
                    )}
                </div>
                <div className="card">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-accent-primary" /> Itinerary Locations
                    </h4>
                    {(trip.itinerary || []).length > 0 ? (
                        <ul className="space-y-3">
                            {(trip.itinerary || []).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <MapPin size={14} className="mt-1 text-text-secondary" />
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary italic text-sm">No itinerary items added.</p>
                    )}
                </div>
            </div>
        </div >
    );


    // ...

    const tabs = [
        { id: 'itinerary', label: 'Itinerary', content: <Itinerary /> },
        { id: 'timeline', label: 'Timeline', content: <ItineraryTimeline items={trip.itinerary || []} /> },
        { id: 'expenses', label: 'Expenses', content: <ExpensesTab trip={trip} /> },
        { id: 'accommodation', label: 'Accommodation', content: <Accommodation /> },
        { id: 'transport', label: 'Transport', content: <Transport /> },
        { id: 'map', label: 'Map', content: <MapView /> },
    ];

    const handleCurrencyChange = (newCurrency: string, rates: Record<string, number>) => {
        setCurrency(newCurrency);
        setExchangeRates(rates);
    };

    // Always convert from USD base to ensure accuracy
    const convertedTotalCost = convertFromUSD(totalCost, currency, exchangeRates);

    const startDate = trip ? new Date(trip.start_date) : null;
    const endDate = trip ? new Date(trip.end_date) : null;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dateString = trip && startDate && endDate ? `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}` : '';

    return (
        <div className="flex flex-col gap-4">
            {/* Breadcrumbs */}
            <Breadcrumbs items={[{ label: trip.title }]} />

            {/* Header Section without Image */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{trip.title}</h1>
                        <CollaboratorAvatars tripId={trip.id} size="md" />
                    </div>
                    <p className="text-text-secondary text-sm mb-2">{dateString}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCalculatorOpen(true)}
                            className="h-8 text-xs gap-2"
                        >
                            <Clock size={14} /> Currency Calculator
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsShareModalOpen(true)}
                            className="h-8 text-xs gap-2"
                        >
                            <Share2 size={14} /> Share Trip
                        </Button>
                        {isOwner && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCollaboratorModalOpen(true)}
                                className="h-8 text-xs gap-2"
                            >
                                <Users size={14} /> Manage Collaborators
                            </Button>
                        )}
                        <ExportMenu trip={trip} />
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-text-secondary text-xs uppercase tracking-wider font-bold">Total Cost</p>
                    <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-accent-primary">
                            {currency === 'USD' ? '$' : ''}
                            {convertedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            {currency !== 'USD' ? ` ${currency}` : ''}
                        </p>
                        <CurrencyConverter
                            currentCurrency={currency}
                            onCurrencyChange={handleCurrencyChange}
                        />
                    </div>
                </div>
            </div>

            {/* Trip Overview Map */}
            {trip.latitude && trip.longitude && (
                <TripOverviewMap
                    latitude={trip.latitude}
                    longitude={trip.longitude}
                    city={trip.city || trip.title}
                    className="mt-4"
                />
            )}

            {isCalculatorOpen && <CurrencyCalculator onClose={() => setIsCalculatorOpen(false)} />}

            <ShareTripModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                tripId={trip.id}
                tripTitle={trip.title}
            />

            <CollaboratorModal
                tripId={trip.id}
                isOpen={isCollaboratorModalOpen}
                onClose={() => setIsCollaboratorModalOpen(false)}
            />

            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value)}
                className="w-full"
            >
                <TabsList className="w-full justify-start overflow-x-auto">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-4">
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Modals */}
            <Modal
                isOpen={activeModal === 'itinerary'}
                onClose={() => setActiveModal(null)}
                title="Add Itinerary Item"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button onClick={handleSaveItinerary}>Add Items</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Day Number</label>
                            <input type="number" className="input" placeholder="e.g. 1" value={itineraryForm.day} onChange={e => setItineraryForm(curr => ({ ...curr, day: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Date</label>
                            <input type="date" className="input" value={itineraryForm.date} onChange={e => setItineraryForm(curr => ({ ...curr, date: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                        <textarea className="input min-h-[60px]" placeholder="General notes for the day..." value={itineraryForm.description} onChange={e => setItineraryForm(curr => ({ ...curr, description: e.target.value }))} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Location (Optional)</label>
                        <AddressSearchInput
                            placeholder="Search for location..."
                            onSelectLocation={(result) => {
                                setItineraryForm(curr => ({
                                    ...curr,
                                    locationName: result.display_name,
                                    latitude: result.latitude,
                                    longitude: result.longitude
                                }));
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Pick Location on Map (optional)</label>
                        <LocationPicker
                            initialLatitude={itineraryForm.latitude || 40.7128}
                            initialLongitude={itineraryForm.longitude || -74.006}
                            onLocationChange={(lat, lng, address) => {
                                setItineraryForm(curr => ({
                                    ...curr,
                                    latitude: lat,
                                    longitude: lng,
                                    locationName: address || curr.locationName || ''
                                }));
                            }}
                        />
                    </div>

                    <div className="border-t border-border-color pt-3 mt-1">
                        <label className="text-sm font-bold mb-2 block">Activities & Costs</label>
                        <div className="flex flex-col gap-2">
                            {itineraryForm.items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Activity Title"
                                            value={item.title}
                                            onChange={e => handleItemChange(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="Cost ($)"
                                            value={item.cost}
                                            onChange={e => handleItemChange(index, 'cost', e.target.value)}
                                        />
                                    </div>
                                    {itineraryForm.items.length > 1 && (
                                        <div className="p-2 mt-1">
                                            <AnimatedDeleteButton onClick={(e) => { e.stopPropagation(); handleRemoveItemRow(index); }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddItemRow} className="mt-3 gap-1 h-8">
                            <Plus size={14} /> Add Another Activity
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'accommodation'}
                onClose={() => setActiveModal(null)}
                title="Add Accommodation"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button onClick={handleSaveAccommodation}>Add Stay</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <input type="text" className="input" placeholder="Hotel Name" value={accommodationForm.name} onChange={e => setAccommodationForm(curr => ({ ...curr, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Type</label>
                        <select className="input" value={accommodationForm.type} onChange={e => setAccommodationForm(curr => ({ ...curr, type: e.target.value }))}>
                            <option value="Hotel">Hotel</option>
                            <option value="Airbnb">Airbnb</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Address</label>
                        <AddressSearchInput
                            placeholder="Search for address..."
                            onSelectLocation={(result) => {
                                setAccommodationForm(curr => ({
                                    ...curr,
                                    address: result.display_name,
                                    latitude: result.latitude,
                                    longitude: result.longitude
                                }));
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Location on Map (optional)</label>
                        <LocationPicker
                            initialLatitude={accommodationForm.latitude || 40.7128}
                            initialLongitude={accommodationForm.longitude || -74.006}
                            onLocationChange={(lat, lng, address) => {
                                setAccommodationForm(curr => ({
                                    ...curr,
                                    latitude: lat,
                                    longitude: lng,
                                    address: address || curr.address
                                }));
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Check-in</label>
                            <input type="date" className="input" value={accommodationForm.checkIn} onChange={e => setAccommodationForm(curr => ({ ...curr, checkIn: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Check-out</label>
                            <input type="date" className="input" value={accommodationForm.checkOut} onChange={e => setAccommodationForm(curr => ({ ...curr, checkOut: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Cost ($)</label>
                        <input type="number" className="input" placeholder="0.00" value={accommodationForm.cost} onChange={e => setAccommodationForm(curr => ({ ...curr, cost: e.target.value }))} />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'transport'}
                onClose={() => setActiveModal(null)}
                title="Add Transport"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                        <Button onClick={handleSaveTransport}>Add Transport</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select className="input" value={transportForm.type} onChange={e => setTransportForm(curr => ({ ...curr, type: e.target.value }))}>
                                <option value="Flight">Flight</option>
                                <option value="Train">Train</option>
                                <option value="Bus">Bus</option>
                                <option value="Car Rental">Car Rental</option>
                                <option value="Taxi/Rideshare">Taxi/Rideshare</option>
                                <option value="Ferry">Ferry</option>
                                <option value="Walking">Walking</option>
                                <option value="Cycling">Cycling</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Number</label>
                            <input type="text" className="input" placeholder="e.g. JL123" value={transportForm.number} onChange={e => setTransportForm(curr => ({ ...curr, number: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">From</label>
                            <AddressSearchInput
                                placeholder="Search origin location..."
                                onSelectLocation={(result) => {
                                    setTransportForm(curr => ({
                                        ...curr,
                                        from: result.display_name,
                                        departure_latitude: result.latitude,
                                        departure_longitude: result.longitude
                                    }));
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">To</label>
                            <AddressSearchInput
                                placeholder="Search destination..."
                                onSelectLocation={(result) => {
                                    setTransportForm(curr => ({
                                        ...curr,
                                        to: result.display_name,
                                        arrival_latitude: result.latitude,
                                        arrival_longitude: result.longitude
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Depart</label>
                            <input type="datetime-local" className="input" value={transportForm.depart} onChange={e => setTransportForm(curr => ({ ...curr, depart: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Arrive</label>
                            <input type="datetime-local" className="input" value={transportForm.arrive} onChange={e => setTransportForm(curr => ({ ...curr, arrive: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Cost ($)</label>
                        <input type="number" className="input" placeholder="0.00" value={transportForm.cost} onChange={e => setTransportForm(curr => ({ ...curr, cost: e.target.value }))} />
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default TripDetails;
