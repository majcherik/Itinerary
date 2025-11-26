import React from 'react';
import { CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

import Modal from '../components/Modal';

const PackingList = () => {
    const { id } = useParams();
    const { getTrip, addPackingItem, updatePackingItem, deletePackingItem } = useTrip();
    const trip = getTrip(id);
    const items = trip?.packingList || [];

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ name: '', category: 'Misc' });

    const toggleItem = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            updatePackingItem(id, itemId, { checked: !item.checked });
        }
    };

    const deleteItem = (itemId) => {
        deletePackingItem(id, itemId);
    };

    const handleAddItem = () => {
        if (!newItem.name) return;
        addPackingItem(id, { text: newItem.name, category: newItem.category, id: Date.now(), checked: false });
        setNewItem({ name: '', category: 'Misc' });
        setIsModalOpen(false);
    };

    const categories = ['Clothes', 'Electronics', 'Toiletries', 'Misc'];

    // Calculate progress
    const totalItems = items.length;
    const packedItems = items.filter(i => i.checked).length;
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
                {Array.from(new Set([...categories, ...items.map(i => i.category || 'Misc')])).map(category => {
                    const categoryItems = items.filter(i => (i.category || 'Misc') === category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <div key={category}>
                            <h3 className="font-bold text-lg mb-3">{category}</h3>
                            <div className="flex flex-col gap-2">
                                {categoryItems.map(item => (
                                    <div key={item.id} className="card flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                            {item.checked ?
                                                <CheckCircle className="text-success" size={20} /> :
                                                <Circle className="text-text-secondary" size={20} />
                                            }
                                            <span className={item.checked ? 'line-through text-text-secondary' : ''}>{item.text || item.name}</span>
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

            <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline flex items-center justify-center gap-2 mt-4 border-dashed"
            >
                <Plus size={20} />
                <span>Add Item</span>
            </button>

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
                        <div className="relative">
                            <input
                                type="text"
                                className="input"
                                list="category-options"
                                placeholder="Select or type category"
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            />
                            <datalist id="category-options">
                                {categories.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PackingList;
