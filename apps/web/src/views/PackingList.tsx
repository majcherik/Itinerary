import React from 'react';
import { CheckCircle, Circle, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTrip } from '@itinerary/shared';

import Modal from '../components/Modal';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { AnimatedCircularProgressBar } from '../components/ui/animated-circular-progress-bar';
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

const PackingList: React.FC = () => {
    const { id } = useParams();
    const { getTrip, addPackingItem, updatePackingItem, deletePackingItem, resetPackingList } = useTrip();
    const trip = getTrip(id as string);
    const items = trip?.packingList || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ name: '', category: 'Misc' });
    const [openCombobox, setOpenCombobox] = React.useState(false);

    const toggleItem = (itemId: number | string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            updatePackingItem(id as string, itemId, { is_packed: !item.is_packed });
        }
    };

    const deleteItem = (itemId: number | string) => {
        deletePackingItem(id as string, itemId);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to uncheck all items?')) {
            resetPackingList(id as string);
        }
    };

    const handleAddItem = () => {
        if (!newItem.name) return;
        addPackingItem(id as string, { text: newItem.name, category: newItem.category, checked: false });
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
                <div className="flex items-center justify-center">
                    <AnimatedCircularProgressBar
                        max={100}
                        min={0}
                        value={progress}
                        gaugePrimaryColor="var(--accent-primary)"
                        gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                        className="w-16 h-16 text-lg"
                    />
                </div>
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
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleItem(item.id!)}>
                                            {item.is_packed ?
                                                <CheckCircle className="text-success" size={20} /> :
                                                <Circle className="text-text-secondary" size={20} />
                                            }
                                            <span className={item.is_packed ? 'line-through text-text-secondary' : ''}>{item.item || item.category}</span>
                                            {/* Note: item.item seems to be the text content based on context, or item.text. Checking TripContext: item: item.text */}
                                        </div>
                                        <button onClick={() => deleteItem(item.id!)} className="text-text-secondary hover:text-danger">
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
                        {/* @ts-ignore */}
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            {/* @ts-ignore */}
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
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {allCategories.map((category) => (
                                                <CommandItem
                                                    key={category}
                                                    value={category}
                                                    onSelect={(currentValue: string) => {
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
                                            {/* @ts-ignore */}
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
