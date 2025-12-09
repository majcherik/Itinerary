import { z } from 'zod';

export const createExpenseSchema = (members: string[] = []) => z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    category: z.string().min(1, "Category is required"),
    payer: z.string().refine((val) => members.includes(val) || val === 'Me', {
        message: "Payer must be a trip member",
    }),
    splitWith: z.array(z.string()).min(1, "Must split with at least one person"),
});

export type CreateExpenseInput = {
    description: string;
    amount: number;
    date: string;
    category: string;
    payer: string;
    splitWith: string[];
};
