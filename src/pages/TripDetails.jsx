import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Tabs from '../components/Tabs';
import CurrencyConverter from '../components/CurrencyConverter';
import CurrencyCalculator from '../components/CurrencyCalculator';
import Modal from '../components/Modal';
import { MapPin, Calendar, Home, Train, Plus, Trash2, Clock, Copy, Check } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard';
import { useDocumentTitle } from '../hooks/use-document-title';

const TripDetails = () => {
    const { id } = useParams();
    const [copiedText, copy] = useCopyToClipboard();
    const {
        getTrip,
        addItineraryItem,
        deleteItineraryItem,
        addAccommodation,
        deleteAccommodation,
        addTransport,
        deleteTransport
    } = useTrip();

    const trip = getTrip(id);
    useDocumentTitle(trip ? `${trip.title} | TripPlanner` : 'Trip Details | TripPlanner');

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'itinerary', 'accommodation', 'transport' or null

    // Form States
    const [itineraryForm, setItineraryForm] = useState({ day: '', date: '', description: '', items: [{ title: '', cost: '' }] });
    const [accommodationForm, setAccommodationForm] = useState({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '' });
    const [transportForm, setTransportForm] = useState({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '' });

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
                <p className="text-text-secondary">The trip you are looking for does not exist.</p>
            </div>
        );
    }

    // Handlers
    const handleSaveItinerary = () => {
        if (!itineraryForm.day) return;

        itineraryForm.items.forEach(item => {
            if (item.title) {
                addItineraryItem(id, {
                    id: Date.now() + Math.random(), // Ensure unique ID for batch add
                    day: Number(itineraryForm.day),
                    date: itineraryForm.date,
                    description: itineraryForm.description,
                    title: item.title,
                    cost: item.cost
                });
            }
        });

        setActiveModal(null);
        setItineraryForm({ day: '', date: '', description: '', items: [{ title: '', cost: '' }] });
    };

    const handleAddItemRow = () => {
        setItineraryForm({
            ...itineraryForm,
            items: [...itineraryForm.items, { title: '', cost: '' }]
        });
    };

    const handleRemoveItemRow = (index) => {
        const newItems = itineraryForm.items.filter((_, i) => i !== index);
        setItineraryForm({ ...itineraryForm, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...itineraryForm.items];
        newItems[index][field] = value;
        setItineraryForm({ ...itineraryForm, items: newItems });
    };

    const handleSaveAccommodation = () => {
        if (!accommodationForm.name) return;
        addAccommodation(id, { ...accommodationForm, id: Date.now() });
        setActiveModal(null);
        setAccommodationForm({ name: '', address: '', checkIn: '', checkOut: '', type: 'Hotel', cost: '' });
    };

    const handleSaveTransport = () => {
        if (!transportForm.type || !transportForm.number) return;
        addTransport(id, { ...transportForm, id: Date.now() });
        setActiveModal(null);
        setTransportForm({ type: 'Flight', number: '', from: '', to: '', depart: '', arrive: '', cost: '' });
    };

    // Calculate Total Cost
    const totalCost = React.useMemo(() => {
        const itineraryCost = (trip.itinerary || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const accommodationCost = (trip.accommodation || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        const transportCost = (trip.transport || []).reduce((acc, item) => acc + (Number(item.cost) || 0), 0);
        return itineraryCost + accommodationCost + transportCost;
    }, [trip]);

    const Itinerary = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Itinerary</h3>
                <button onClick={() => setActiveModal('itinerary')} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Item
                </button>
            </div>
            <div className="relative border-l-2 border-border-color ml-3 pl-6 space-y-8">
                {(trip.itinerary || []).sort((a, b) => a.day - b.day).map((item) => (
                    <div key={item.id || item.day} className="relative">
                        <div className="absolute -left-[2.4rem] bg-accent-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10">
                            {item.day}
                        </div>
                        <div className="card group relative pr-10">
                            <button
                                onClick={() => deleteItineraryItem(id, item.id)}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-bg-primary text-text-secondary hover:text-danger hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete item"
                            >
                                <Trash2 size={14} />
                            </button>
                            <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">{item.date}</span>
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
                {(trip.accommodation || []).map((place) => (
                    <div key={place.id || place.name} className="card flex gap-4 group relative pr-10">
                        <button
                            onClick={() => deleteAccommodation(id, place.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-bg-primary text-text-secondary hover:text-danger hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete stay"
                        >
                            <Trash2 size={14} />
                        </button>
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
                                    onClick={() => copy(place.address)}
                                    className="ml-2 p-1 hover:bg-bg-secondary rounded-full text-text-secondary hover:text-accent-primary transition-colors"
                                    title="Copy Address"
                                >
                                    {copiedText === place.address ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>
                            <div className="flex items-center gap-1 text-text-secondary text-sm mt-1">
                                <Calendar size={14} />
                                <span>{place.checkIn} - {place.checkOut}</span>
                            </div>
                        </div>
                    </div>
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
                {(trip.transport || []).map((ride) => (
                    <div key={ride.id || ride.number} className="card group relative pr-10">
                        <button
                            onClick={() => deleteTransport(id, ride.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-bg-primary text-text-secondary hover:text-danger hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete transport"
                        >
                            <Trash2 size={14} />
                        </button>
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
                                <span className="font-semibold">{ride.depart}</span>
                            </div>
                            <div className="h-px bg-border-color flex-1 mx-4"></div>
                            <div className="text-right">
                                <span className="text-text-secondary text-xs block">Arrive</span>
                                <span className="font-semibold">{ride.arrive}</span>
                            </div>
                        </div>
                    </div>
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
                    </a>
                </div>
            </div>

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
        </div>
    );

    const tabs = [
        { id: 'itinerary', label: 'Itinerary', content: <Itinerary /> },
        { id: 'accommodation', label: 'Accommodation', content: <Accommodation /> },
        { id: 'transport', label: 'Transport', content: <Transport /> },
        { id: 'map', label: 'Map', content: <MapView /> },
    ];



    const [currency, setCurrency] = useState('USD');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    const handleCurrencyChange = (newCurrency, rate) => {
        setCurrency(newCurrency);
        setExchangeRate(rate);
    };

    const convertedTotalCost = totalCost * exchangeRate;

    const startDate = trip ? new Date(trip.start_date) : null;
    const endDate = trip ? new Date(trip.end_date) : null;
    const options = { month: 'short', day: 'numeric' };
    const dateString = trip ? `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}` : '';

    return (
        <div className="flex flex-col gap-4">
            {/* Header Section without Image */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">{trip.title}</h1>
                    <p className="text-text-secondary text-sm mb-2">{dateString}</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="btn btn-sm btn-outline flex items-center gap-2 text-xs"
                        >
                            <Clock size={14} /> Currency Calculator
                        </button>
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


            <Tabs tabs={tabs} />

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
                                        <button onClick={() => handleRemoveItemRow(index)} className="p-2 text-text-secondary hover:text-danger mt-1">
                                            <Trash2 size={18} />
                                        </button>
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
