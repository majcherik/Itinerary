import React from 'react';
import { Plane, Ticket, QrCode, Download, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

const Wallet = () => {
    const { id } = useParams();
    const { getTrip, addTicket } = useTrip();
    const trip = getTrip(id);
    const tickets = trip?.wallet || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newTicket, setNewTicket] = React.useState({ type: 'Flight', provider: '', number: '', date: '', time: '' });

    const handleAddTicket = () => {
        if (!newTicket.provider || !newTicket.date) return;
        addTicket(id, { ...newTicket, id: Date.now() });
        setIsModalOpen(false);
        setNewTicket({ type: 'Flight', provider: '', number: '', date: '', time: '' });
    };

    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Wallet</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-sm btn-primary flex items-center gap-2">
                    <Plus size={16} /> Add Ticket
                </button>
            </div>

            <div className="grid gap-6">
                {tickets.length === 0 && <p className="text-text-secondary text-center py-8">No tickets added yet.</p>}
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="card relative overflow-hidden">
                        {/* Decorative circle */}
                        <div className="absolute -right-12 -top-12 w-32 h-32 bg-accent-primary opacity-10 rounded-full"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-bg-primary rounded-lg">
                                    {ticket.type === 'Flight' ? <Plane size={24} className="text-accent-primary" /> : <Ticket size={24} className="text-accent-secondary" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{ticket.provider}</h3>
                                    <p className="text-text-secondary text-sm">{ticket.type === 'Flight' ? ticket.number : ticket.name}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-bg-primary rounded-full text-xs font-medium border border-border-color">
                                {ticket.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                            <div>
                                <span className="text-text-secondary text-xs block mb-1">Date</span>
                                <span className="font-semibold">{ticket.date}</span>
                            </div>
                            <div>
                                <span className="text-text-secondary text-xs block mb-1">Time</span>
                                <span className="font-semibold">{ticket.time}</span>
                            </div>
                            {ticket.type === 'Flight' && (
                                <>
                                    <div>
                                        <span className="text-text-secondary text-xs block mb-1">Gate</span>
                                        <span className="font-semibold">{ticket.gate || 'TBD'}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary text-xs block mb-1">Seat</span>
                                        <span className="font-semibold">{ticket.seat || 'TBD'}</span>
                                    </div>
                                </>
                            )}
                            {ticket.type === 'Attraction' && (
                                <div>
                                    <span className="text-text-secondary text-xs block mb-1">Ticket</span>
                                    <span className="font-semibold">{ticket.count || '1 Adult'}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-dashed border-border-color my-4 -mx-6"></div>

                        <div className="flex justify-between items-center relative z-10">
                            <div
                                className="flex items-center gap-2 text-accent-primary cursor-pointer hover:underline"
                                onClick={() => alert(`Downloading PDF for ${ticket.provider}...`)}
                            >
                                <Download size={16} />
                                <span className="text-sm font-medium">Download PDF</span>
                            </div>
                            <QrCode size={48} className="bg-white p-1 rounded" color="black" />
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="card w-full max-w-md p-6 flex flex-col gap-4">
                        <h3 className="text-xl font-bold">Add New Ticket</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                className="input"
                                value={newTicket.type}
                                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                            >
                                <option value="Flight">Flight</option>
                                <option value="Attraction">Attraction</option>
                                <option value="Train">Train</option>
                                <option value="Bus">Bus</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Provider / Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Japan Airlines"
                                value={newTicket.provider}
                                onChange={(e) => setNewTicket({ ...newTicket, provider: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Date</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Oct 15, 2025"
                                    value={newTicket.date}
                                    onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Time</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="12:00 PM"
                                    value={newTicket.time}
                                    onChange={(e) => setNewTicket({ ...newTicket, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleAddTicket} className="btn btn-primary">Add Ticket</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
