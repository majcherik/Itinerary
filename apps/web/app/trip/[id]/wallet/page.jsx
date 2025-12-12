'use client';

import React from 'react';
import { Plane, Ticket, QrCode, Download, Plus, Copy, Check, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTrip, useCopyToClipboard } from '@itinerary/shared';
import QRCode from 'react-qr-code';
import Modal from '../../../../src/components/Modal';
import ProtectedRoute from '../../../../src/components/ProtectedRoute';
import Layout from '../../../../src/components/Layout';
import MenuDockResponsive from '../../../../src/components/MenuDockResponsive';
import Footer from '../../../../src/components/Footer';

const WalletContent = () => {
    const { id } = useParams();
    const [copiedText, copy] = useCopyToClipboard();
    const { getTrip, addTicket, deleteTicket } = useTrip();
    const trip = getTrip(id);
    const tickets = trip?.wallet || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newTicket, setNewTicket] = React.useState({
        type: 'Flight',
        provider: '',
        number: '',
        date: '',
        time: '',
        isRoundTrip: false,
        returnDate: '',
        returnTime: ''
    });

    const [qrModalOpen, setQrModalOpen] = React.useState(false);
    const [selectedTicketForQr, setSelectedTicketForQr] = React.useState(null);

    const handleAddTicket = () => {
        if (!newTicket.provider || !newTicket.date) return;
        if (newTicket.isRoundTrip && (!newTicket.returnDate || !newTicket.returnTime)) {
            alert('Please provide return date and time for round-trip tickets');
            return;
        }
        addTicket(id, { ...newTicket, id: Date.now() });
        setIsModalOpen(false);
        setNewTicket({
            type: 'Flight',
            provider: '',
            number: '',
            date: '',
            time: '',
            isRoundTrip: false,
            returnDate: '',
            returnTime: ''
        });
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
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {ticket.provider}
                                        <button
                                            onClick={() => copy(ticket.provider)}
                                            className="text-text-secondary hover:text-accent-primary transition-colors"
                                            title="Copy Provider"
                                        >
                                            {copiedText === ticket.provider ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </h3>
                                    <p className="text-text-secondary text-sm flex items-center gap-2">
                                        {ticket.refNumber || 'No reference number'}
                                        {ticket.refNumber && (
                                            <button
                                                onClick={() => copy(ticket.refNumber)}
                                                className="text-text-secondary hover:text-accent-primary transition-colors"
                                                title="Copy Reference Number"
                                            >
                                                {copiedText === ticket.refNumber ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {ticket.arrives && (
                                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-medium border border-accent-primary/20">
                                        Round Trip
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-bg-primary rounded-full text-xs font-medium border border-border-color">
                                    {ticket.type}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                            <div>
                                <span className="text-text-secondary text-xs block mb-1">Departure Date</span>
                                <span className="font-semibold">
                                    {ticket.departs ? new Date(ticket.departs).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : 'TBD'}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-secondary text-xs block mb-1">Departure Time</span>
                                <span className="font-semibold">
                                    {ticket.departs ? new Date(ticket.departs).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'TBD'}
                                </span>
                            </div>
                            {ticket.arrives && (
                                <>
                                    <div>
                                        <span className="text-text-secondary text-xs block mb-1">Return Date</span>
                                        <span className="font-semibold">
                                            {new Date(ticket.arrives).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-text-secondary text-xs block mb-1">Return Time</span>
                                        <span className="font-semibold">
                                            {new Date(ticket.arrives).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </>
                            )}
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
                            <div className="flex gap-3">
                                <div
                                    className="flex items-center gap-2 text-accent-primary cursor-pointer hover:underline"
                                    onClick={() => alert(`Downloading PDF for ${ticket.provider}...`)}
                                >
                                    <Download size={16} />
                                    <span className="text-sm font-medium">Download PDF</span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this ticket?')) {
                                            deleteTicket(id, ticket.id);
                                        }
                                    }}
                                    className="flex items-center gap-2 text-text-secondary hover:text-danger transition-colors"
                                    title="Delete Ticket"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-sm font-medium">Delete</span>
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTicketForQr(ticket);
                                    setQrModalOpen(true);
                                }}
                                className="bg-white p-1 rounded hover:opacity-80 transition-opacity"
                            >
                                <QrCode size={48} color="black" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                title="Ticket QR Code"
                footer={
                    <button onClick={() => setQrModalOpen(false)} className="btn btn-primary w-full">Close</button>
                }
            >
                {selectedTicketForQr && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <QRCode
                                value={`TICKET:${selectedTicketForQr.id}:${selectedTicketForQr.provider}`}
                                size={200}
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">{selectedTicketForQr.provider}</h3>
                            <p className="text-text-secondary text-sm">
                                {selectedTicketForQr.refNumber || selectedTicketForQr.type}
                            </p>
                            <p className="text-xs text-text-secondary mt-2 font-mono">
                                ID: {selectedTicketForQr.id}
                            </p>
                            {selectedTicketForQr.departs && (
                                <p className="text-xs text-text-secondary mt-1">
                                    {new Date(selectedTicketForQr.departs).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

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
                                <option value="Train">Train</option>
                                <option value="Bus">Bus</option>
                                <option value="Attraction">Attraction</option>
                                <option value="Concert">Concert</option>
                                <option value="Event">Event</option>
                                <option value="Hotel Reservation">Hotel Reservation</option>
                                <option value="Restaurant Reservation">Restaurant Reservation</option>
                                <option value="Other">Other</option>
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

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Reference Number</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., ABC123"
                                value={newTicket.number}
                                onChange={(e) => setNewTicket({ ...newTicket, number: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="roundTrip"
                                checked={newTicket.isRoundTrip}
                                onChange={(e) => setNewTicket({ ...newTicket, isRoundTrip: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="roundTrip" className="text-sm font-medium">Round Trip</label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Departure Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={newTicket.date}
                                    onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Departure Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={newTicket.time}
                                    onChange={(e) => setNewTicket({ ...newTicket, time: e.target.value })}
                                />
                            </div>
                        </div>

                        {newTicket.isRoundTrip && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Return Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newTicket.returnDate}
                                        onChange={(e) => setNewTicket({ ...newTicket, returnDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Return Time</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={newTicket.returnTime}
                                        onChange={(e) => setNewTicket({ ...newTicket, returnTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

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

export default function WalletPage() {
    return (
        <ProtectedRoute>
            <Layout>
                <WalletContent />
                <Footer />
            </Layout>
            <MenuDockResponsive />
        </ProtectedRoute>
    );
}
