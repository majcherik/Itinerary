import React from 'react';
import { Calendar, Plus, Trash2, Edit2, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useDocumentTitle } from '../hooks/use-document-title';
import { useCountdown } from '../hooks/use-countdown';

const Dashboard = () => {
    useDocumentTitle('My Trips | TripPlanner');
    const { trips, addTrip, deleteTrip, updateTrip } = useTrip();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTrip, setEditingTrip] = React.useState(null);

    // Find next upcoming trip
    const upcomingTrip = React.useMemo(() => {
        const now = new Date();

        const futureTrips = trips
            .filter(t => {
                // Parse as local time by appending time component
                const tripDate = new Date(`${t.start_date}T00:00:00`);
                return tripDate >= now;
            })
            .sort((a, b) => new Date(`${a.start_date}T00:00:00`) - new Date(`${b.start_date}T00:00:00`));

        return futureTrips[0];
    }, [trips]);

    // Pass the correctly formatted date string to useCountdown
    const targetDate = upcomingTrip ? `${upcomingTrip.start_date}T00:00:00` : null;
    const [days, hours, minutes, seconds] = useCountdown(targetDate);

    // Form state
    const [destination, setDestination] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');

    const openAddModal = () => {
        setEditingTrip(null);
        setDestination('');
        setStartDate('');
        setEndDate('');
        setIsModalOpen(true);
    };

    const openEditModal = (trip, e) => {
        e.preventDefault();
        setEditingTrip(trip);
        setDestination(trip.destination);
        setStartDate('');
        setEndDate('');
        setIsModalOpen(true);
    };

    const handleSaveTrip = () => {
        if (!destination || !startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const options = { month: 'short', day: 'numeric' };
        const year = end.getFullYear();

        // Use simple concatenation to avoid potential template literal issues
        const startStr = start.toLocaleDateString('en-US', options);
        const endStr = end.toLocaleDateString('en-US', options);
        const dateString = startStr + ' - ' + endStr + ', ' + year;

        if (editingTrip) {
            updateTrip(editingTrip.id, {
                destination,
                dates: dateString
            });
        } else {
            const newTrip = {
                title: destination,
                city: destination, // Using destination for city as well for now
                startDate: startDate,
                endDate: endDate,
                heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000'
            };
            addTrip(newTrip);
        }

        setIsModalOpen(false);
    };

    const handleDeleteTrip = (id, e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            deleteTrip(id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">My Trips</h2>
                    <p className="text-text-secondary">Manage your upcoming adventures</p>
                </div>
                {upcomingTrip && days >= 0 && (
                    <div className="flex items-center gap-4 bg-bg-secondary px-4 py-2 rounded-xl border border-border-color">
                        <div className="flex items-center gap-2 text-accent-primary font-bold">
                            <Clock size={20} />
                            <span>Next Trip: {upcomingTrip.title}</span>
                        </div>
                        <div className="flex gap-2 text-sm font-mono">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg leading-none">{days}</span>
                                <span className="text-[10px] text-text-secondary uppercase">Days</span>
                            </div>
                            <span className="font-bold text-lg leading-none">:</span>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg leading-none">{hours}</span>
                                <span className="text-[10px] text-text-secondary uppercase">Hrs</span>
                            </div>
                            <span className="font-bold text-lg leading-none">:</span>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-lg leading-none">{minutes}</span>
                                <span className="text-[10px] text-text-secondary uppercase">Mins</span>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
                    <Plus size={20} /> New Trip
                </button>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {trips.map((trip) => {
                    const startDate = new Date(trip.start_date);
                    const endDate = new Date(trip.end_date);
                    const options = { month: 'short', day: 'numeric' };
                    const dateString = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.getFullYear()}`;

                    return (
                        <Link to={`/trip/${trip.id}`} key={trip.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all group relative">
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex gap-2 z-10">
                                <button
                                    onClick={(e) => openEditModal(trip, e)}
                                    className="p-2 bg-white/90 rounded-full text-accent-primary hover:bg-accent-primary hover:text-white shadow-md transition-colors"
                                    title="Edit Trip"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                                    className="p-2 bg-white/90 rounded-full text-danger hover:bg-danger hover:text-white shadow-md transition-colors"
                                    title="Delete Trip"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="h-32 overflow-hidden relative">
                                <img src={trip.hero_image || trip.image} alt={trip.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-2 text-text-primary">{trip.title}</h3>
                                <div className="flex items-center gap-2 text-text-secondary text-sm">
                                    <Calendar size={16} />
                                    <span>{dateString}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="card w-full max-w-md p-6 flex flex-col gap-4 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold">{editingTrip ? 'Edit Trip' : 'Plan New Trip'}</h3>

                        import LocationAutocomplete from '../components/LocationAutocomplete';

                        // ... (inside component)

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Destination</label>
                            <LocationAutocomplete
                                value={destination}
                                onChange={setDestination}
                                placeholder="Where to?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">End Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSaveTrip} className="btn btn-primary">{editingTrip ? 'Save Changes' : 'Create Trip'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
