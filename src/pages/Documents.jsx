import React from 'react';
import Tabs from '../components/Tabs';
import { FileText, Upload, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

const Documents = () => {
    const { id } = useParams();
    const { getTrip, addNote } = useTrip();
    const trip = getTrip(id);
    const notes = trip?.documents || [];

    const handleAddNote = () => {
        const title = window.prompt('Enter note title:');
        if (!title) return;
        const contentStr = window.prompt('Enter note content:');
        if (!contentStr) return;

        const newNote = {
            id: Date.now(),
            title,
            content: [contentStr],
            isWarning: false
        };
        addNote(id, newNote);
    };

    if (!trip) return <div>Trip not found</div>;

    const VisaSection = () => (
        <div className="flex flex-col gap-6">
            <div className="card bg-bg-card border-l-4 border-warning">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-warning shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg">Visa Required</h3>
                        <p className="text-text-secondary text-sm">Check visa requirements for {trip.destination}. Ensure your passport is valid for at least 6 months.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-lg">My Documents</h3>

                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded text-success">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">Passport</h4>
                            <p className="text-text-secondary text-xs">Expires: Dec 2030</p>
                        </div>
                    </div>
                    <button className="text-sm text-accent-primary font-medium">View</button>
                </div>

                <div className="card flex items-center justify-between border-dashed border-2 border-border-color bg-transparent hover:bg-bg-card/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-bg-card rounded text-text-secondary">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-secondary">Upload Visa</h4>
                            <p className="text-text-secondary text-xs">PDF or JPG</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const NotesSection = () => (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Destination Notes</h3>
                <button onClick={handleAddNote} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Note
                </button>
            </div>

            <div className="grid gap-4">
                {notes.length === 0 && <p className="text-text-secondary text-center py-4">No notes added yet.</p>}
                {notes.map(note => (
                    <div key={note.id} className="card">
                        <h4 className={`font-bold mb-2 ${note.isWarning ? 'text-danger' : ''}`}>{note.title}</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                            {note.content.map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

    const tabs = [
        { id: 'visa', label: 'Visas & Docs', content: <VisaSection /> },
        { id: 'notes', label: 'Destination Info', content: <NotesSection /> },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Documents & Info</h2>
            <Tabs tabs={tabs} />
        </div>
    );
};

export default Documents;
