import React from 'react';
import Tabs from '../components/Tabs';
import { FileText, Upload, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

const Documents = () => {
    const { id } = useParams();
    const { getTrip, addNote, updateTrip } = useTrip();
    const trip = getTrip(id);
    const notes = trip?.documents || [];

    const [newNote, setNewNote] = React.useState({ title: '', content: '' });
    const [isAddingNote, setIsAddingNote] = React.useState(false);

    const handleSaveNote = () => {
        if (!newNote.title || !newNote.content) return;
        const note = {
            id: Date.now(),
            title: newNote.title,
            content: newNote.content.split('\n'), // Split by newline for paragraphs
            isWarning: false
        };
        addNote(id, note);
        setNewNote({ title: '', content: '' });
        setIsAddingNote(false);
    };



    const VisaSection = () => (
        <div className="flex flex-col gap-6">
            <div className="card bg-bg-card">
                <h3 className="font-bold text-lg mb-4">Visa Status</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-md border-border-color">
                        <div className="flex items-center gap-3">
                            {trip.visa_status === 'required' ? (
                                <AlertTriangle className="text-warning" />
                            ) : trip.visa_status === 'obtained' ? (
                                <CheckCircle className="text-success" />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-text-secondary flex items-center justify-center text-xs text-text-secondary">?</div>
                            )}
                            <div>
                                <h4 className="font-medium">Do you have a valid Visa?</h4>
                                <p className="text-xs text-text-secondary">Mark your current status</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateTrip(id, { visa_status: 'obtained' })}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${trip.visa_status === 'obtained' ? 'bg-success/10 border-success text-success' : 'border-border-color hover:bg-bg-secondary'}`}
                            >
                                Yes, I have it
                            </button>
                            <button
                                onClick={() => updateTrip(id, { visa_status: 'required' })}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${trip.visa_status === 'required' ? 'bg-warning/10 border-warning text-warning' : 'border-border-color hover:bg-bg-secondary'}`}
                            >
                                No / Not yet
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Visa Details / Notes</label>
                        <textarea
                            className="input min-h-[80px]"
                            placeholder="e.g. Valid until Dec 2025, allows 90 days stay..."
                            value={trip.visa_info || ''}
                            onChange={(e) => updateTrip(id, { visa_info: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="font-bold text-lg">My Documents</h3>
                {/* ... existing documents UI ... */}
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
                {!isAddingNote && (
                    <button onClick={() => setIsAddingNote(true)} className="btn btn-sm btn-outline flex items-center gap-1 text-xs">
                        <Plus size={14} /> Add Note
                    </button>
                )}
            </div>

            {isAddingNote && (
                <div className="card border-2 border-accent-primary/20">
                    <input
                        type="text"
                        className="input mb-2 font-bold"
                        placeholder="Note Title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        autoFocus
                    />
                    <textarea
                        className="input min-h-[100px] mb-2"
                        placeholder="Write your note here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAddingNote(false)} className="btn btn-sm btn-ghost">Cancel</button>
                        <button onClick={handleSaveNote} className="btn btn-sm btn-primary">Save Note</button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {notes.length === 0 && !isAddingNote && <p className="text-text-secondary text-center py-4">No notes added yet.</p>}
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
