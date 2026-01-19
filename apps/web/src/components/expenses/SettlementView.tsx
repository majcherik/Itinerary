import React, { useMemo } from 'react';
import { Trip, ExpenseItem, useCollaborators } from '@itinerary/shared';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
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
    const { data: collaborators, isLoading } = useCollaborators(trip.id);
    const expenses = trip.expenses || [];

    // Create user ID to name mapping
    const userIdToName = useMemo(() => {
        const map: Record<string, string> = {};
        if (collaborators) {
            collaborators.forEach(collab => {
                map[collab.user.id] = collab.user.display_name || collab.user.email || 'Unknown';
            });
        }
        return map;
    }, [collaborators]);

    // Get all display names for balances
    const allDisplayNames = useMemo(() => {
        const names = new Set<string>();

        // Add all collaborator names
        if (collaborators) {
            collaborators.forEach(collab => {
                names.add(collab.user.display_name || collab.user.email || 'Unknown');
            });
        }

        // Add legacy member names from old expenses
        expenses.forEach(exp => {
            if (exp.payer) names.add(exp.payer);
            if (exp.splitWith) exp.splitWith.forEach(name => names.add(name));
        });

        return Array.from(names);
    }, [collaborators, expenses]);

    const settlements = useMemo(() => {
        // 1. Calculate Net Balance for each person
        const balances: { [key: string]: number } = {};
        allDisplayNames.forEach(name => balances[name] = 0);

        expenses.forEach((exp: any) => {
            const amount = Number(exp.amount);

            // Determine payer and split - support both old and new formats
            let payerName: string;
            let splitWithNames: string[];

            if (exp.payer_user_id && exp.split_with_user_ids) {
                // New format: use user IDs
                payerName = userIdToName[exp.payer_user_id] || 'Unknown';
                splitWithNames = (exp.split_with_user_ids || []).map((id: string) =>
                    userIdToName[id] || 'Unknown'
                );
            } else {
                // Old format: use string names
                payerName = exp.payer;
                splitWithNames = exp.split_with || exp.splitWith || allDisplayNames;
            }

            // Skip if no valid payer or split
            if (!payerName || splitWithNames.length === 0) return;

            // Payer gets +amount
            balances[payerName] = (balances[payerName] || 0) + amount;

            // Splitters get -share
            const share = amount / splitWithNames.length;
            splitWithNames.forEach(person => {
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
        const sortedDebtors = debtors.toSorted((a, b) => a.amount - b.amount);
        const sortedCreditors = creditors.toSorted((a, b) => b.amount - a.amount);

        const transactions: Transaction[] = [];
        let i = 0; // debtor index
        let j = 0; // creditor index

        while (i < sortedDebtors.length && j < sortedCreditors.length) {
            const debtor = sortedDebtors[i];
            const creditor = sortedCreditors[j];

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
    }, [expenses, allDisplayNames, userIdToName]);

    const { transactions, balances } = settlements;

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

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
