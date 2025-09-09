import { z } from "zod";

const ruleSchema = z.object({
    id: z.string(),
    rule: z.string(),
    satisfied: z.boolean(),
    priority: z.enum(["low", "medium", "high"]),
});

export const newTradeFormSchema = z.object({
    positionType: z.string().min(1, { message: "Position Type is required." }),
    openDate: z.string().min(1, { message: "Open date is required." }),
    openTime: z.string().min(1, { message: "Open time is required." }),
    closeDate: z.string().optional(),
    closeTime: z.string().optional(),
    isActiveTrade: z.boolean().default(true),
    deposit: z
        .string()
        .min(1, { message: "Deposit is required." })
        .regex(/^[0-9]+$/, { message: "Only positive numbers are allowed." }),

    result: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true; // Allow empty for optional field
            return /^-?[0-9]+$/.test(val);
        }, {
            message: "Only numbers are allowed.",
        }),
    instrumentName: z
        .string()
        .min(1, { message: "Instrument name is required." }),
    symbolName: z.string().min(1, { message: "Symbol name is required." }),
    entryPrice: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    totalCost: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    quantity: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    sellPrice: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    quantitySold: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),

    strategyName: z.string().optional(),
    strategyId: z.string().optional().nullable(),
    appliedOpenRules: z.array(ruleSchema).optional().default([]),
    appliedCloseRules: z.array(ruleSchema).optional().default([]),
    notes: z.string().optional(),
    rating: z
        .number()
        .max(5, { message: "Rating cannot be more than 5" })
        .default(0),
});

export const addCapitalFormSchema = z.object({
    capital: z
        .string()
        .min(1, { message: "Deposit is required." })
        .regex(/^[0-9]+$/, { message: "Only positive numbers are allowed." }),
});
