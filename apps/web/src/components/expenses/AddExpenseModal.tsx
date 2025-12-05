import React, { useState } from 'react';
import { useTrip, Trip } from '@itinerary/shared';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface AddExpenseModalProps {
    trip: Trip;
    onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ trip, onClose }) => {
    const { addExpense } = useTrip();
    const members = trip.members || ['Me'];

    const [form, setForm] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        payer: 'Me',
        splitWith: members // Default to split with everyone
    });

    const [openCategory, setOpenCategory] = useState(false);
    // Default categories + any custom ones used in existing expenses could be added here if we had access to them easily
    // For now, we'll start with defaults and allow adding new ones.
    const defaultCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Misc'];
    const [categories, setCategories] = useState(defaultCategories);

    const handleSubmit = async () => {
        if (!form.description || !form.amount) {
            toast.error('Please fill in description and amount');
            return;
        }
        if (!form.category) {
            toast.error('Please select a category');
            return;
        }

        try {
            await addExpense(trip.id, {
                ...form,
                amount: parseFloat(form.amount)
            });
            toast.success('Expense added');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add expense');
        }
    };

    const toggleSplitMember = (member: string) => {
        if (form.splitWith.includes(member)) {
            // Don't allow removing the last person (must split with someone)
            if (form.splitWith.length > 1) {
                setForm({ ...form, splitWith: form.splitWith.filter(m => m !== member) });
            } else {
                toast.error("Expense must be split with at least one person");
            }
        } else {
            setForm({ ...form, splitWith: [...form.splitWith, member] });
        }
    };

    const toggleSelectAll = () => {
        if (form.splitWith.length === members.length) {
            // Deselect all (except payer maybe? logic says at least one, let's keep payer or just first one)
            // Better UX: Deselect all but the payer if payer is in list, otherwise just keep the first one to avoid empty state
            const keep = members.includes(form.payer) ? [form.payer] : [members[0]];
            setForm({ ...form, splitWith: keep });
        } else {
            // Select all
            setForm({ ...form, splitWith: members });
        }
    };

    const isAllSelected = form.splitWith.length === members.length;

    return (
        <div className="flex flex-col gap-5">
            <div>
                <label className="text-sm font-medium mb-1.5 block text-text-secondary">Description</label>
                <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. Dinner at Mario's"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                        <input
                            type="number"
                            className="input w-full pl-7"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Date</label>
                    <input
                        type="date"
                        className="input w-full"
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Category</label>
                    <Popover open={openCategory} onOpenChange={setOpenCategory}>
                        <PopoverTrigger asChild>
                            <button className={cn(
                                "input w-full flex justify-between items-center text-left font-normal",
                                !form.category && "text-text-secondary"
                            )}>
                                {form.category || "Select category..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[240px] z-[200]" align="start">
                            <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                    <CommandEmpty>No category found.</CommandEmpty>
                                    <CommandGroup>
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category}
                                                value={category}
                                                onSelect={(currentValue) => {
                                                    // Capitalize first letter for display if needed, but value is what matters
                                                    // CommandItem lowercases value, so we use the original category string if it matches
                                                    const match = categories.find(c => c.toLowerCase() === currentValue.toLowerCase());
                                                    setForm({ ...form, category: match || currentValue });
                                                    setOpenCategory(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.category === category ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {category}
                                            </CommandItem>
                                        ))}
                                        <CommandItem
                                            value="create-custom"
                                            className="text-text-secondary italic border-t mt-1 pt-2"
                                            onSelect={() => {
                                                const custom = window.prompt("Enter new category name:");
                                                if (custom) {
                                                    setCategories([...categories, custom]);
                                                    setForm({ ...form, category: custom });
                                                    setOpenCategory(false);
                                                }
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create "{form.category}"...
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Paid By</label>
                    <select
                        className="input w-full"
                        value={form.payer}
                        onChange={e => setForm({ ...form, payer: e.target.value })}
                    >
                        {members.map(member => (
                            <option key={member} value={member}>{member}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-secondary">Split With</label>
                    <button
                        onClick={toggleSelectAll}
                        className="text-xs text-accent-primary hover:underline font-medium flex items-center gap-1"
                    >
                        <Users size={12} />
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {members.map(member => {
                        const isSelected = form.splitWith.includes(member);
                        return (
                            <button
                                key={member}
                                onClick={() => toggleSplitMember(member)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm border transition-all duration-200 flex items-center gap-2",
                                    isSelected
                                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary font-medium"
                                        : "bg-bg-secondary text-text-secondary border-transparent hover:border-border-color"
                                )}
                            >
                                {isSelected && <Check size={14} />}
                                {member}
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-text-secondary mt-2">
                    * {form.splitWith.length} people selected
                </p>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color">
                <button onClick={onClose} className="btn btn-outline">Cancel</button>
                <button onClick={handleSubmit} className="btn btn-primary px-8">Add Expense</button>
            </div>
        </div>
    );
};

export default AddExpenseModal;
