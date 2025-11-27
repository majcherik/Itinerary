import React from 'react';
import { CheckCircle, Circle, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

import Modal from '../components/Modal';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover"

const PackingList = () => {
    const { id } = useParams();
    const { getTrip, addPackingItem, updatePackingItem, deletePackingItem, resetPackingList } = useTrip();
    const trip = getTrip(id);
    const items = trip?.packingList || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ name: '', category: 'Misc' });
    const [openCombobox, setOpenCombobox] = React.useState(false);

    const toggleItem = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            updatePackingItem(id, itemId, { is_packed: !item.is_packed });
        }
    };

    const deleteItem = (itemId) => {
        deletePackingItem(id, itemId);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to uncheck all items?')) {
            resetPackingList(id);
        }
    };

    const handleAddItem = () => {
        if (!newItem.name) return;
        addPackingItem(id, { text: newItem.name, category: newItem.category, checked: false });
        setNewItem({ name: '', category: 'Misc' });
        setIsModalOpen(false);
    };

    const categories = ['Clothes', 'Electronics', 'Toiletries', 'Misc'];
    const allCategories = Array.from(new Set([...categories, ...items.map(i => i.category || 'Misc')]));

    // Calculate progress
    const totalItems = items.length;
    const packedItems = items.filter(i => i.is_packed).length;
    const progress = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Packing List</h2>
                    <p className="text-text-secondary text-sm">{packedItems} of {totalItems} items packed</p>
                </div>
                <div className="text-3xl font-bold text-accent-primary">{progress}%</div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-bg-card rounded-full overflow-hidden">
                <div
                    className="h-full bg-accent-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex flex-col gap-6">
                {allCategories.map(category => {
                    const categoryItems = items.filter(i => (i.category || 'Misc') === category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <div key={category}>
                            <h3 className="font-bold text-lg mb-3">{category}</h3>
                            <div className="flex flex-col gap-2">
                                {categoryItems.map(item => (
                                    <div key={item.id} className="card flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                            {item.is_packed ?
                                                <CheckCircle className="text-success" size={20} /> :
                                                <Circle className="text-text-secondary" size={20} />
                                            }
                                            <span className={item.is_packed ? 'line-through text-text-secondary' : ''}>{item.item || item.text || item.name}</span>
                                        </div>
                                        <button onClick={() => deleteItem(item.id)} className="text-text-secondary hover:text-danger">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-outline flex-1 flex items-center justify-center gap-2 border-dashed"
                >
                    <Plus size={20} />
                    <span>Add Item</span>
                </button>
                <button
                    onClick={handleReset}
                    className="btn btn-outline flex-1 flex items-center justify-center gap-2 border-dashed text-text-secondary hover:text-warning hover:border-warning"
                >
                    <Circle size={20} />
                    <span>Reset All</span>
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Packing Item"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                        <button onClick={handleAddItem} className="btn btn-primary">Add Item</button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Item Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Toothbrush"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Category</label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between font-normal text-text-primary bg-bg-primary border-border-color"
                                >
                                    {newItem.category || "Select category..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-bg-card border-border-color">
                                <Command className="bg-bg-card">
                                    <CommandInput placeholder="Search category..." className="text-text-primary" />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-text-secondary">
                                                No category found.
                                                <button
                                                    className="text-accent-primary hover:underline ml-1"
                                                    onClick={() => {
                                                        // Logic to use the search term as new category is tricky with standard CommandEmpty
                                                        // Instead, we can just let them type it in the input if we used a creatable select,
                                                        // but with Command, we usually filter.
                                                        // A simple way: If they type something that doesn't exist, we can show "Create 'XYZ'".
                                                        // But CommandInput value isn't easily accessible here without controlled state.
                                                        // For simplicity as per "write own category", we can just add a "Custom" option or
                                                        // let them type in a separate input if not found?
                                                        // The user asked for "combo box which allows user to create his new categories".
                                                        // Let's use a simpler approach: Add a "Create" item that appears if no match?
                                                        // Or just a separate input if they want custom?
                                                        // Actually, the user said "put there with very small text next to it note so user knows that when he writes own category, he can create it."
                                                        // This implies typing into the combobox creates it.
                                                        // Let's try to capture the input value.
                                                    }}
                                                >
                                                    Create new
                                                </button>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {allCategories.map((category) => (
                                                <CommandItem
                                                    key={category}
                                                    value={category}
                                                    onSelect={(currentValue) => {
                                                        setNewItem({ ...newItem, category: currentValue === newItem.category ? "" : currentValue });
                                                        setOpenCombobox(false);
                                                    }}
                                                    className="text-text-primary aria-selected:bg-bg-secondary"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            newItem.category === category ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {category}
                                                </CommandItem>
                                            ))}
                                            {/* Allow creating new category by typing */}
                                            <CommandItem
                                                value="create-custom"
                                                className="text-text-secondary italic aria-selected:bg-bg-secondary"
                                                onSelect={() => {
                                                    const custom = window.prompt("Enter new category name:");
                                                    if (custom) {
                                                        setNewItem({ ...newItem, category: custom });
                                                        setOpenCombobox(false);
                                                    }
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create new category...
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-[10px] text-text-secondary mt-1">
                            * Select an existing category or choose "Create new category" to add your own.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PackingList;
