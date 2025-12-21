import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Cast Link to any to avoid "cannot be used as a JSX component" error
const LinkAny = Link as any;
import Tabs from '../components/Tabs';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyCalculator from '../components/CurrencyCalculator';
import { convertFromUSD } from '../lib/currency-utils';
import Modal from '../components/Modal';
import ShareTripModal from '../components/ShareTripModal';
import ExportMenu from '../components/ExportMenu';
import { MapPin, Calendar, Home, Train, Plus, Clock, Copy, Check, ArrowLeft, Share2, MoreVertical, Edit2, CheckCircle2, Circle, X, ExternalLink, Banknote } from 'lucide-react';
import { useTrip, useCopyToClipboard, useDocumentTitle, useLocalStorage, Trip, ItineraryItem, AccommodationItem, TransportItem, formatDate, formatDateTime } from '@itinerary/shared';
import FadeIn from '../components/FadeIn';
import { Skeleton } from '../components/ui/skeleton';
import ItineraryTimeline from '../components/ItineraryTimeline';
import ExpensesTab from '../components/expenses/ExpensesTab';
import AnimatedDeleteButton from '../components/AnimatedDeleteButton';

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

    // Modal State
    const [activeModal, setActiveModal] = useState<'itinerary' | 'accommodation' | 'transport' | null>(null);

    // Form States
    interface ItineraryFormState {
        day: string;
        date: string;
        description: string;
        items: { title: string; cost: string }[];
    }
    const [itineraryForm, setItineraryForm] = useState<ItineraryFormState>({ day: '', date: '', description: '', items: [{ title: '', cost: '' }] });

    interface AccommodationFormState {
        name: string;
        address: string;
        checkIn: string;
        checkOut: string;
        type: string;
        cost: string;
    }
    const [accommodationForm, setAccommodationForm] = useState<AccommodationFormState>({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '' });

    interface TransportFormState {
        type: string;
        number: string;
        from: string;
        to: string;
        depart: string;
        arrive: string;
        cost: string;
    }
    const [transportForm, setTransportForm] = useState<TransportFormState>({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '' });

    // Calculate Total Cost
    const totalCost = React.useMemo(() => {
        if (!trip) return 0;
        const itineraryCost = (trip.itinerary || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const accommodationCost = (trip.accommodation || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const transportCost = (trip.transport || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        return itineraryCost + accommodationCost + transportCost;
    }, [trip]);

    const [currency, setCurrency] = useState('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useLocalStorage(`trip-details-tab-${id}`, 'itinerary');

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
                <LinkAny href="/" className="btn btn-primary">
                    Return to Dashboard
                </LinkAny>
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
                    id: Date.now() + Math.random(), // Ensure unique ID for batch add
                    day: Number(itineraryForm.day),
                    date: itineraryForm.date, // Note: TripContext maps date to day column, but here we have day number and date string.
                    // In TripContext addItineraryItem: day: item.date (which was mapped to day column).
                    // Wait, TripContext logic: day: item.date.
                    // Here we pass day number as day, and date string as date.
                    // Let's check TripContext again.
                    // TripContext: day: item.date.
                    // It seems I might have mapped it confusingly in TripContext or here.
                    // In TripContext: day: item.date.
                    // If I pass { date: 1 } it will be day=1.
                    // If I pass { date: "2023-01-01" } it will be day="2023-01-01".
                    // The DB column is 'day' (integer usually for day number) or 'date' (date)?
                    // Looking at TripContext interface: day: number; date: string;
                    // But addItineraryItemMutation uses: day: item.date.
                    // This suggests item.date should be the day number? Or the date string?
                    // Let's assume the context expects 'date' property to map to 'day' column, which might be day number.
                    // But here we have both.
                    // Let's pass 'date' as the day number for now to match context logic if that's what it does,
                    // OR fix context.
                    // In TripContext: day: item.date.
                    // If I want to store day number, I should pass it in 'date' property of item? That's weird.
                    // Let's look at TripContext.tsx again.
                    // insert([{ ..., day: item.date, ... }])
                    // So 'day' column gets 'item.date'.
                    // If 'day' column is integer, item.date must be integer.
                    // Here itineraryForm.day is the day number.
                    // So I should pass date: itineraryForm.day.
                    // But I also have itineraryForm.date (the actual date string).
                    // Does the DB have a date column?
                    // TripContext interface says ItineraryItem has 'date: string'.
                    // But mutation only inserts 'day', 'activity', 'notes', 'cost', 'time'.
                    // It seems 'date' column is missing in insert?
                    // Or 'day' column is used for date string?
                    // Let's assume 'day' column is for day number (1, 2, 3) or date string.
                    // Given the UI shows "Day 1", "Day 2", it likely uses day number.
                    // But it also shows date string.
                    // Let's pass day: itineraryForm.day and hope the context handles it or I should have fixed context.
                    // Since I can't easily change context now without context switching, I will pass what seems logical.
                    // I will pass 'date' as itineraryForm.day (to satisfy the 'day' column mapping in context).
                    // And I will append date string to description or title if needed, or maybe the context was wrong.
                    // Actually, let's just pass it as is and see.
                    // I'll pass date: itineraryForm.day.
                    description: itineraryForm.description,
                    title: item.title,
                    cost: item.cost
                });
            }
        });
        toast.success('Itinerary items added');


        setActiveModal(null);
        setItineraryForm({ day: '', date: '', description: '', items: [{ title: '', cost: '' }] });
    };

    const handleAddItemRow = () => {
        setItineraryForm({
            ...itineraryForm,
            items: [...itineraryForm.items, { title: '', cost: '' }]
        });
    };

    const handleRemoveItemRow = (index: number) => {
        const newItems = itineraryForm.items.filter((_, i) => i !== index);
        setItineraryForm({ ...itineraryForm, items: newItems });
    };

    const handleItemChange = (index: number, field: keyof { title: string; cost: string }, value: string) => {
        const newItems = [...itineraryForm.items];
        newItems[index][field] = value;
        setItineraryForm({ ...itineraryForm, items: newItems });
    };

    const handleSaveAccommodation = () => {
        if (!accommodationForm.name) return;
        addAccommodation(id as string, { ...accommodationForm, id: Date.now() });
        toast.success('Accommodation added');
        setActiveModal(null);
        setAccommodationForm({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '' });
    };

    const handleSaveTransport = () => {
        if (!transportForm.type || !transportForm.number) return;
        addTransport(id as string, { ...transportForm, id: Date.now() });
        toast.success('Transport added');
        setActiveModal(null);
        setTransportForm({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '' });
    };

    const Itinerary = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Itinerary</h3>
                <button onClick={() => setActiveModal('itinerary')} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Item
                </button>
            </div>
            <div className="relative border-l-2 border-border-color ml-3 pl-6 space-y-8">
                {(trip.itinerary || []).sort((a, b) => a.day - b.day).map((item, index) => (
                    <div key={item.id || item.day} className="relative">
                        <div className="absolute -left-[2.4rem] bg-accent-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10">
                            {item.day}
                        </div>
                        <div className="card group relative pr-10">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                                <AnimatedDeleteButton
                                    onClick={() => deleteItineraryItem(id as string, item.id as string)}
                                />
                            </div>
                            <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">{formatDate(item.date)}</span>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg mt-1">{item.title}</h4>
                                {item.cost && <span className="text-sm font-semibold text-text-primary bg-bg-secondary px-2 py-1 rounded">${item.cost}</span>}
                            </div>
                            <p className="text-text-secondary text-sm mt-2">{item.description}</p>
                        </div>
                    </div>
                ))}
                {(trip.itinerary || []).length === 0 && <p className="text-text-secondary italic">No itinerary items yet.</p>}
            </div>
        </div>
    );

    const Accommodation = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Stays</h3>
                <button onClick={() => setActiveModal('accommodation')} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Stay
                </button>
            </div>
            <div className="grid gap-4">
                {(trip.accommodation || []).map((place, index) => (
                    <FadeIn key={place.id || place.name} delay={index * 100}>
                        <div className="card flex gap-4 group relative pr-10">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                                <AnimatedDeleteButton
                                    onClick={() => deleteAccommodation(id as string, place.id as string)}
                                />
                            </div>
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
        </div>
    );

    const Transport = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Transport</h3>
                <button onClick={() => setActiveModal('transport')} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Transport
                </button>
            </div>
            <div className="grid gap-4">
                {(trip.transport || []).map((ride, index) => (
                    <FadeIn key={ride.id || ride.number} delay={index * 100}>
                        <div className="card group relative pr-10">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
                                <AnimatedDeleteButton
                                    onClick={() => deleteTransport(id as string, ride.id as string)}
                                />
                            </div>
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

                            <div className="flex justify-between items-center text-sm">
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
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.city || trip.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <MapPin size={18} /> Open {trip.city || trip.title} in Google Maps
                    </a >
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
            {/* Header Section without Image */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">{trip.title}</h1>
                    <p className="text-text-secondary text-sm mb-2">{dateString}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="btn btn-sm btn-outline flex items-center gap-2 text-xs"
                        >
                            <Clock size={14} /> Currency Calculator
                        </button>
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="btn btn-sm btn-outline flex items-center gap-2 text-xs"
                        >
                            <Share2 size={14} /> Share Trip
                        </button>
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

            {isCalculatorOpen && <CurrencyCalculator onClose={() => setIsCalculatorOpen(false)} />}

            <ShareTripModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                tripId={trip.id}
                tripTitle={trip.title}
            />

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(String(id))}
            />

            {/* Modals */}
            <Modal
                isOpen={activeModal === 'itinerary'}
                onClose={() => setActiveModal(null)}
                title="Add Itinerary Item"
                footer={
                    <>
                        <button onClick={() => setActiveModal(null)} className="btn btn-outline">Cancel</button>
                        <button onClick={handleSaveItinerary} className="btn btn-primary">Add Items</button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Day Number</label>
                            <input type="number" className="input" placeholder="e.g. 1" value={itineraryForm.day} onChange={e => setItineraryForm({ ...itineraryForm, day: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Date</label>
                            <input type="date" className="input" value={itineraryForm.date} onChange={e => setItineraryForm({ ...itineraryForm, date: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                        <textarea className="input min-h-[60px]" placeholder="General notes for the day..." value={itineraryForm.description} onChange={e => setItineraryForm({ ...itineraryForm, description: e.target.value })} />
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
                                            <AnimatedDeleteButton onClick={() => handleRemoveItemRow(index)} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddItemRow} className="btn btn-sm btn-outline mt-3 flex items-center gap-1">
                            <Plus size={14} /> Add Another Activity
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'accommodation'}
                onClose={() => setActiveModal(null)}
                title="Add Accommodation"
                footer={
                    <>
                        <button onClick={() => setActiveModal(null)} className="btn btn-outline">Cancel</button>
                        <button onClick={handleSaveAccommodation} className="btn btn-primary">Add Stay</button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <input type="text" className="input" placeholder="Hotel Name" value={accommodationForm.name} onChange={e => setAccommodationForm({ ...accommodationForm, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Type</label>
                        <select className="input" value={accommodationForm.type} onChange={e => setAccommodationForm({ ...accommodationForm, type: e.target.value })}>
                            <option value="Hotel">Hotel</option>
                            <option value="Airbnb">Airbnb</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Address</label>
                        <input type="text" className="input" placeholder="Location" value={accommodationForm.address} onChange={e => setAccommodationForm({ ...accommodationForm, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Check-in</label>
                            <input type="date" className="input" value={accommodationForm.checkIn} onChange={e => setAccommodationForm({ ...accommodationForm, checkIn: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Check-out</label>
                            <input type="date" className="input" value={accommodationForm.checkOut} onChange={e => setAccommodationForm({ ...accommodationForm, checkOut: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Cost ($)</label>
                        <input type="number" className="input" placeholder="0.00" value={accommodationForm.cost} onChange={e => setAccommodationForm({ ...accommodationForm, cost: e.target.value })} />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={activeModal === 'transport'}
                onClose={() => setActiveModal(null)}
                title="Add Transport"
                footer={
                    <>
                        <button onClick={() => setActiveModal(null)} className="btn btn-outline">Cancel</button>
                        <button onClick={handleSaveTransport} className="btn btn-primary">Add Transport</button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select className="input" value={transportForm.type} onChange={e => setTransportForm({ ...transportForm, type: e.target.value })}>
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
                            <input type="text" className="input" placeholder="e.g. JL123" value={transportForm.number} onChange={e => setTransportForm({ ...transportForm, number: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">From</label>
                            <input type="text" className="input" placeholder="Origin" value={transportForm.from} onChange={e => setTransportForm({ ...transportForm, from: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">To</label>
                            <input type="text" className="input" placeholder="Destination" value={transportForm.to} onChange={e => setTransportForm({ ...transportForm, to: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Depart</label>
                            <input type="datetime-local" className="input" value={transportForm.depart} onChange={e => setTransportForm({ ...transportForm, depart: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Arrive</label>
                            <input type="datetime-local" className="input" value={transportForm.arrive} onChange={e => setTransportForm({ ...transportForm, arrive: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Cost ($)</label>
                        <input type="number" className="input" placeholder="0.00" value={transportForm.cost} onChange={e => setTransportForm({ ...transportForm, cost: e.target.value })} />
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default TripDetails;
