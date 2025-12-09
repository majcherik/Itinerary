import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trip, createExpenseSchema, CreateExpenseInput, useAddExpense } from '@itinerary/shared';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Plus, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddExpenseModalProps {
    trip: Trip;
    onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ trip, onClose }) => {
    const members = trip.members || ['Me'];
    const { mutateAsync: addExpense, isPending } = useAddExpense();

    // Default categories
    const defaultCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Misc'];
    const [categories, setCategories] = useState(defaultCategories);
    const [openCategory, setOpenCategory] = useState(false);
    const [searchCategory, setSearchCategory] = useState('');

    const form = useForm<CreateExpenseInput>({
        resolver: zodResolver(createExpenseSchema(members)) as any,
        defaultValues: {
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: '',
            payer: 'Me',
            splitWith: members,
        }
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const splitWith = watch('splitWith');
    const categoryValue = watch('category');
    const payerValue = watch('payer');
    const isAllSelected = splitWith.length === members.length;

    const onSubmit = async (data: CreateExpenseInput) => {
        try {
            await addExpense({
                tripId: trip.id, expense: {
                    description: data.description,
                    amount: Number(data.amount),
                    date: data.date,
                    category: data.category,
                    payer: data.payer,
                    split_with: data.splitWith  // Map camelCase to snake_case
                } as any
            });
            toast.success('Expense added');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add expense');
        }
    };

    const toggleSplitMember = (member: string) => {
        const current = splitWith;
        if (current.includes(member)) {
            // Validate length > 1 handled by schema, but good for UX to prevent deselecting last one here too or just let schema handle error
            if (current.length > 1) {
                setValue('splitWith', current.filter(m => m !== member), { shouldValidate: true });
            } else {
                toast.error("Expense must be split with at least one person");
            }
        } else {
            setValue('splitWith', [...current, member], { shouldValidate: true });
        }
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            // Keep payer selected to avoid empty state, or just empty and let validation catch it
            const keep = members.includes(payerValue) ? [payerValue] : [members[0]];
            setValue('splitWith', keep, { shouldValidate: true });
        } else {
            setValue('splitWith', members, { shouldValidate: true });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
                <label className="text-sm font-medium mb-1.5 block text-text-secondary">
                    Description <span className="text-red-400">*</span>
                </label>
                <input
                    {...register('description')}
                    type="text"
                    className={cn("input w-full", errors.description && "border-red-400 focus:border-red-400")}
                    placeholder="e.g. Dinner at Mario's"
                    autoFocus
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">
                        Amount <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-xs">$</span>
                        <input
                            {...register('amount')}
                            type="number"
                            step="0.01"
                            className={cn("input w-full pl-7", errors.amount && "border-red-400 focus:border-red-400")}
                            placeholder="0.00"
                            style={{ paddingLeft: '1.75rem' }}
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Date</label>
                    <input
                        {...register('date')}
                        type="date"
                        className="input w-full"
                    />
                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">
                        Category <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setOpenCategory(!openCategory);
                                if (!openCategory) setSearchCategory('');
                            }}
                            className={cn(
                                "input w-full flex justify-between items-center text-left font-normal",
                                !categoryValue && "text-text-secondary",
                                errors.category && "border-red-400"
                            )}
                        >
                            {categoryValue || "Select category..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>

                        {openCategory && (
                            <>
                                <div
                                    className="fixed inset-0 z-[99998]"
                                    onClick={() => {
                                        setOpenCategory(false);
                                        setSearchCategory('');
                                    }}
                                />
                                <div
                                    className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[99999] max-h-[300px] overflow-hidden flex flex-col"
                                >
                                    <div className="p-2 border-b">
                                        <input
                                            type="text"
                                            placeholder="Search category..."
                                            value={searchCategory}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded"
                                            onChange={(e) => setSearchCategory(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="overflow-y-auto p-2">
                                        {(() => {
                                            const filteredCategories = categories.filter(cat => cat.toLowerCase().includes(searchCategory.toLowerCase()));

                                            if (filteredCategories.length === 0) {
                                                return (
                                                    <div className="py-6 text-center text-sm text-text-secondary">
                                                        No category found.
                                                    </div>
                                                );
                                            }

                                            return filteredCategories.map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => {
                                                        setValue('category', category, { shouldValidate: true });
                                                        setOpenCategory(false);
                                                        setSearchCategory('');
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm transition-colors flex items-center"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4 flex-shrink-0",
                                                            categoryValue === category ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <span>{category}</span>
                                                </button>
                                            ));
                                        })()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const custom = window.prompt("Enter new category name:");
                                                if (custom) {
                                                    setCategories([...categories, custom]);
                                                    setValue('category', custom, { shouldValidate: true });
                                                    setOpenCategory(false);
                                                    setSearchCategory('');
                                                }
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm transition-colors flex items-center text-text-secondary italic border-t mt-1 pt-2"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create custom...
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium mb-1.5 block text-text-secondary">Paid By</label>
                    <select
                        {...register('payer')}
                        className="input w-full"
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
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs text-accent-primary hover:underline font-medium flex items-center gap-1"
                    >
                        <Users size={12} />
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {members.map(member => {
                        const isSelected = splitWith.includes(member);
                        return (
                            <button
                                key={member}
                                type="button"
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
                {errors.splitWith && <p className="text-xs text-red-500 mt-1">{errors.splitWith.message}</p>}
                <p className="text-[10px] text-text-secondary mt-2">
                    * {splitWith.length} people selected
                </p>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color">
                <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary px-8 flex items-center gap-2">
                    {isPending && <Loader2 className="animate-spin" size={16} />}
                    Add Expense
                </button>
            </div>
        </form>
    );
};

export default AddExpenseModal;
