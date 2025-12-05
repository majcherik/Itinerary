import React, { useMemo } from 'react';
import { Trip, ExpenseItem } from '@itinerary/shared';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettlementViewProps {
    trip: Trip;
}

interface Transaction {
    from: string;
    to: string;
    amount: number;
}

const SettlementView: React.FC<SettlementViewProps> = ({ trip }) => {
    const expenses = trip.expenses || [];
    const members = trip.members || ['Me'];

    const settlements = useMemo(() => {
        // 1. Calculate Net Balance for each person
        const balances: { [key: string]: number } = {};
        members.forEach(m => balances[m] = 0);

        expenses.forEach(exp => {
            const paidBy = exp.payer;
            const amount = Number(exp.amount);
            const splitWith = exp.splitWith || members; // Fallback to all if empty (shouldn't happen)

            // Payer gets +amount
            balances[paidBy] = (balances[paidBy] || 0) + amount;

            // Splitters get -share
            const share = amount / splitWith.length;
            splitWith.forEach(person => {
                balances[person] = (balances[person] || 0) - share;
            });
        });

        // 2. Minimize Transactions (Greedy Algorithm)
        const debtors: { name: string, amount: number }[] = [];
        const creditors: { name: string, amount: number }[] = [];

        Object.entries(balances).forEach(([name, amount]) => {
            // Round to 2 decimals to avoid floating point issues
            const roundedAmount = Math.round(amount * 100) / 100;
            if (roundedAmount < -0.01) debtors.push({ name, amount: roundedAmount }); // Negative balance = owes money
            if (roundedAmount > 0.01) creditors.push({ name, amount: roundedAmount }); // Positive balance = owed money
        });

        // Sort by amount magnitude (optional but helps greedy approach)
        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions: Transaction[] = [];
        let i = 0; // debtor index
        let j = 0; // creditor index

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            // The amount to settle is the minimum of what debtor owes and creditor is owed
            const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

            transactions.push({
                from: debtor.name,
                to: creditor.name,
                amount: amount
            });

            // Adjust balances
            debtor.amount += amount;
            creditor.amount -= amount;

            // Move indices if settled (within small epsilon)
            if (Math.abs(debtor.amount) < 0.01) i++;
            if (Math.abs(creditor.amount) < 0.01) j++;
        }

        return { transactions, balances };
    }, [expenses, members]);

    const { transactions, balances } = settlements;

    return (
        <div className="flex flex-col gap-8">
            {/* Balances Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(balances).map(([name, amount]) => (
                    <div key={name} className={cn("card p-4 text-center border-l-4", amount >= 0 ? "border-l-success" : "border-l-danger")}>
                        <h4 className="font-bold">{name}</h4>
                        <p className={cn("text-lg font-bold mt-1", amount >= 0 ? "text-success" : "text-danger")}>
                            {amount >= 0 ? "+" : ""}${amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-text-secondary">
                            {amount >= 0 ? "gets back" : "owes"}
                        </p>
                    </div>
                ))}
            </div>

            {/* Settlement Plan */}
            <div className="card p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-accent-primary" />
                    Settlement Plan
                </h3>

                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                        <p>All debts are settled! 🎉</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg">{t.from}</span>
                                    <div className="flex flex-col items-center text-text-secondary">
                                        <span className="text-xs uppercase tracking-wider">pays</span>
                                        <ArrowRight size={16} />
                                    </div>
                                    <span className="font-bold text-lg">{t.to}</span>
                                </div>
                                <span className="font-bold text-xl text-accent-primary">
                                    ${t.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettlementView;
