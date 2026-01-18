'use client';

import React from 'react';
import { Circle, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTrip } from '@itinerary/shared';

import Modal from '../../../../src/components/Modal';
import { cn } from '../../../../src/lib/utils';
import { AnimatedCircularProgressBar } from '../../../../src/components/ui/animated-circular-progress-bar';
import { Button } from '../../../../src/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../../../src/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../../src/components/ui/popover"
import ProtectedRoute from '../../../../src/components/ProtectedRoute';
import { SidebarLayout } from '../../../../src/components/SidebarLayout';
import AnimatedCheckbox from '../../../../src/components/AnimatedCheckbox';
import AnimatedDeleteButton from '../../../../src/components/AnimatedDeleteButton';
import Breadcrumbs from '../../../../src/components/Breadcrumbs';

import { useOnClickOutside } from '@itinerary/shared';

const PackingListContent = () => {
    const { id } = useParams();
    const { getTrip, addPackingItem, updatePackingItem, deletePackingItem, resetPackingList } = useTrip();
    const trip = getTrip(id);
    const items = trip?.packingList || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ name: '', category: 'Misc' });
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const dropdownRef = React.useRef(null);

    useOnClickOutside(dropdownRef, () => setOpenCombobox(false));

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

    const filteredCategories = allCategories.filter(cat =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate progress
    const totalItems = items.length;
    const packedItems = items.filter(i => i.is_packed).length;
    const progress = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <Breadcrumbs items={[{ label: trip.title, href: `/trip/${id}` }, { label: 'Packing List' }]} />

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
                                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleItem(item.id)}>
                                            <AnimatedCheckbox
                                                checked={item.is_packed || false}
                                                onChange={() => toggleItem(item.id)}
                                            />
                                            <span className={item.is_packed ? 'line-through text-text-secondary' : ''}>{item.item || item.text || item.name}</span>
                                        </div>
                                        <AnimatedDeleteButton onClick={() => deleteItem(item.id)} className="text-text-secondary" />
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
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center justify-between w-full p-3 border rounded-md border-border-color bg-bg-primary cursor-pointer"
                                onClick={() => setOpenCombobox(!openCombobox)}
                            >
                                <span className={newItem.category ? 'text-text-primary' : 'text-text-secondary'}>
                                    {newItem.category || "Select category..."}
                                </span>
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            </div>

                            {openCombobox && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-bg-card border border-border-color rounded-md shadow-lg z-50 flex flex-col max-h-60">
                                    <div className="p-2 border-b border-border-color flex-none bg-bg-card sticky top-0 z-10">
                                        <input
                                            type="text"
                                            className="w-full bg-transparent outline-none text-sm p-1"
                                            placeholder="Search or create..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="py-1 overflow-y-auto flex-1">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map(category => {
                                                const isDefault = ['Clothes', 'Electronics', 'Toiletries', 'Misc'].includes(category);
                                                return (
                                                    <div
                                                        key={category}
                                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-bg-secondary flex items-center justify-between group ${newItem.category === category ? 'bg-bg-secondary font-medium' : ''}`}
                                                        onClick={() => {
                                                            setNewItem({ ...newItem, category });
                                                            setOpenCombobox(false);
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span>{category}</span>
                                                            {newItem.category === category && <Check size={14} className="text-accent-primary" />}
                                                        </div>
                                                        {!isDefault && (
                                                            <div
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <AnimatedDeleteButton
                                                                    onClick={() => {
                                                                        if (window.confirm(`Delete category "${category}"? Items will be moved to "Misc".`)) {
                                                                            // Find all items with this category and update them to 'Misc'
                                                                            const itemsToUpdate = items.filter(i => i.category === category);
                                                                            itemsToUpdate.forEach(item => {
                                                                                updatePackingItem(id, item.id, { category: 'Misc' });
                                                                            });
                                                                            // If currently selected, reset to Misc
                                                                            if (newItem.category === category) {
                                                                                setNewItem({ ...newItem, category: 'Misc' });
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-text-secondary"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-text-secondary">No matching categories</div>
                                        )}

                                        {searchTerm && !allCategories.includes(searchTerm) && (
                                            <div
                                                className="px-3 py-2 text-sm cursor-pointer hover:bg-bg-secondary text-accent-primary border-t border-border-color mt-1 flex items-center gap-2"
                                                onClick={() => {
                                                    setNewItem({ ...newItem, category: searchTerm });
                                                    setOpenCombobox(false);
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <Plus size={14} />
                                                Create "{searchTerm}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1">
                            * Select an existing category or type to create a new one.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default function PackingListPage() {
    return (
        <ProtectedRoute>
            <SidebarLayout>
                <PackingListContent />
            </SidebarLayout>
        </ProtectedRoute>
    );
}
