import React, { useState, useMemo } from 'react';
import { Plus, Users, PieChart as PieChartIcon, List } from 'lucide-react';
import { useTrip, Trip, formatDate } from '@itinerary/shared';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import Modal from '../Modal';
import AddExpenseModal from './AddExpenseModal';
import TripMembers from './TripMembers';
import SettlementView from './SettlementView';
import AnimatedDeleteButton from '../AnimatedDeleteButton';

interface ExpensesTabProps {
    trip: Trip;
}

const COLORS = ['#e0525e', '#FFBB28', '#00C49F', '#0088FE', '#FF8042', '#8884d8'];

// Cast Recharts components to any to avoid "cannot be used as a JSX component" error
const PieChartAny = PieChart as any;
const PieAny = Pie as any;
const CellAny = Cell as any;
const ResponsiveContainerAny = ResponsiveContainer as any;
const TooltipAny = Tooltip as any;
const LegendAny = Legend as any;

const ExpensesTab: React.FC<ExpensesTabProps> = ({ trip }) => {
    const { deleteExpense } = useTrip();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'chart' | 'settlement'>('list');

    const expenses = trip.expenses || [];
    const members = trip.members || ['Me'];

    const totalCost = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expensesByCategory = useMemo(() => {
        const data: { [key: string]: number } = {};
        expenses.forEach(exp => {
            data[exp.category] = (data[exp.category] || 0) + Number(exp.amount);
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const expensesByPayer = useMemo(() => {
        const data: { [key: string]: number } = {};
        expenses.forEach(exp => {
            data[exp.payer] = (data[exp.payer] || 0) + Number(exp.amount);
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Delete this expense?')) {
            await deleteExpense(trip.id, id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-bold">Expenses</h3>
                    <p className="text-text-secondary text-sm">
                        Total Spent: <span className="font-bold text-accent-primary">${totalCost.toFixed(2)}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="btn btn-sm btn-outline flex items-center gap-2"
                    >
                        <Users size={16} /> Members
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-sm btn-primary flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex p-1 bg-bg-secondary/50 rounded-lg w-fit self-center md:self-start">
                <button
                    onClick={() => setViewMode('list')}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'list' ? "bg-bg-primary shadow-sm text-accent-primary" : "text-text-secondary hover:text-text-primary")}
                >
                    List
                </button>
                <button
                    onClick={() => setViewMode('chart')}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'chart' ? "bg-bg-primary shadow-sm text-accent-primary" : "text-text-secondary hover:text-text-primary")}
                >
                    Charts
                </button>
                <button
                    onClick={() => setViewMode('settlement')}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'settlement' ? "bg-bg-primary shadow-sm text-accent-primary" : "text-text-secondary hover:text-text-primary")}
                >
                    Settlement
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {viewMode === 'list' && (
                    <div className="space-y-3">
                        {expenses.length === 0 ? (
                            <p className="text-text-secondary italic text-center py-10">No expenses added yet.</p>
                        ) : (
                            expenses.map((expense) => (
                                <div key={expense.id} className="card flex justify-between items-center p-4 group">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold">{expense.description}</h4>
                                            <span className="text-xs px-2 py-0.5 bg-bg-secondary rounded-full text-text-secondary">{expense.category}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Paid by <span className="font-medium text-text-primary">{expense.payer}</span> • {formatDate(expense.date)}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            Split with: {expense.splitWith?.join(', ') || 'Everyone'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg">${Number(expense.amount).toFixed(2)}</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AnimatedDeleteButton
                                                onClick={() => handleDelete(expense.id!)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {viewMode === 'chart' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="card p-4 flex flex-col items-center">
                            <h4 className="font-bold mb-4">By Category</h4>
                            <div className="w-full h-[250px]">
                                <ResponsiveContainerAny width="100%" height="100%">
                                    <PieChartAny>
                                        <PieAny
                                            data={expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expensesByCategory.map((entry, index) => (
                                                <CellAny key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </PieAny>
                                        <TooltipAny formatter={(value: number) => `$${value.toFixed(2)}`} />
                                        <LegendAny />
                                    </PieChartAny>
                                </ResponsiveContainerAny>
                            </div>
                        </div>
                        <div className="card p-4 flex flex-col items-center">
                            <h4 className="font-bold mb-4">By Payer</h4>
                            <div className="w-full h-[250px]">
                                <ResponsiveContainerAny width="100%" height="100%">
                                    <PieChartAny>
                                        <PieAny
                                            data={expensesByPayer}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expensesByPayer.map((entry, index) => (
                                                <CellAny key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </PieAny>
                                        <TooltipAny formatter={(value: number) => `$${value.toFixed(2)}`} />
                                        <LegendAny />
                                    </PieChartAny>
                                </ResponsiveContainerAny>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'settlement' && (
                    <SettlementView trip={trip} />
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Expense"
                footer={null} // Footer handled in component
            >
                <AddExpenseModal
                    trip={trip}
                    onClose={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
                title="Manage Trip Members"
                footer={null}
            >
                <TripMembers
                    trip={trip}
                    onClose={() => setIsMembersModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default ExpensesTab;
