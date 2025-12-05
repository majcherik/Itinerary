import React, { useState } from 'react';
import { useTrip, Trip } from '@itinerary/shared';
import { toast } from 'sonner';
import { Plus, X, User } from 'lucide-react';

interface TripMembersProps {
    trip: Trip;
    onClose: () => void;
}

const TripMembers: React.FC<TripMembersProps> = ({ trip, onClose }) => {
    const { updateTripMembers } = useTrip();
    const [members, setMembers] = useState<string[]>(trip.members || ['Me']);
    const [newMember, setNewMember] = useState('');

    const handleAddMember = () => {
        if (!newMember.trim()) return;
        if (members.includes(newMember.trim())) {
            toast.error('Member already exists');
            return;
        }
        setMembers([...members, newMember.trim()]);
        setNewMember('');
    };

    const handleRemoveMember = (member: string) => {
        if (members.length <= 1) {
            toast.error('Trip must have at least one member');
            return;
        }
        // Check if member is involved in expenses? Ideally yes, but for now just warn or allow.
        // Simple implementation:
        setMembers(members.filter(m => m !== member));
    };

    const handleSave = async () => {
        try {
            await updateTripMembers(trip.id, members);
            toast.success('Members updated');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update members');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
                Add people to this trip to split expenses with them.
            </p>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter name (e.g. Alice)"
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                />
                <button onClick={handleAddMember} className="btn btn-primary px-3">
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {members.map(member => (
                    <div key={member} className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center text-accent-primary font-bold text-sm">
                                {member.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{member}</span>
                        </div>
                        <button
                            onClick={() => handleRemoveMember(member)}
                            className="text-text-secondary hover:text-danger p-1"
                            disabled={members.length <= 1}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-color">
                <button onClick={onClose} className="btn btn-outline">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
            </div>
        </div>
    );
};

export default TripMembers;
