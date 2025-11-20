import { Rule } from "@/types/dbSchema.types";
import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const UserTable = pgTable("user", {
    id: text("id").notNull().unique(),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    capital: text("capital"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    tokens: integer("tokens").default(5),
    onboardingCompleted: boolean("onboarding_completed")
        .notNull()
        .default(false),
});

export const TradeTable = pgTable(
    "trades",
    {
        id: text("id").primaryKey().notNull(),
        userId: text("userId").notNull().references(() => UserTable.id),
        positionType: text("positionType").notNull(),
        openDate: text("openDate").notNull(),
        openTime: text("openTime").notNull(),
        closeDate: text("closeDate"),
        closeTime: text("closeTime"),
        isActiveTrade: boolean("isActiveTrade").default(true).notNull(),
        instrumentName: text("instrumentName").notNull(),
        symbolName: text("symbolName").notNull(),
        entryPrice: text("entryPrice"),
        deposit: text("deposit").notNull(),
        result: text("result"),
        totalCost: text("totalCost"),
        quantity: text("quantity"),
        sellPrice: text("sellPrice"),
        quantitySold: text("quantitySold"),
        notes: text("notes"),
        rating: integer("rating").default(0),
        strategyId: uuid("strategy_id").references(() => StrategyTable.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        appliedOpenRules: jsonb("applied_open_rules").$type<Rule[]>(),
        appliedCloseRules: jsonb("applied_close_rules").$type<Rule[]>(),
    },
    (table) => ({
        userIdCloseDateIndex: index("userIdCloseDateIndex").on(
            table.userId,
            table.closeDate
        ),
        tradeStrategyIdIndex: index("trade_strategy_id_idx").on(
            table.strategyId
        ),
    })
);

export const StrategyTable = pgTable(
    "strategies",
    {
        id: uuid("id").primaryKey().notNull(),
        userId: text("userId")
            .notNull()
            .references(() => UserTable.id),
        strategyName: text("strategyName").notNull(),
        description: text("description"),
        openPositionRules: jsonb("open_position_rules").$type<Rule[]>().default([]).notNull(),
        closePositionRules: jsonb("close_position_rules").$type<Rule[]>().default([]).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    },
    (table) => ({
        userIdIndex: index("strategy_user_id_idx").on(table.userId),
    })
);

export const StrategyRelations = relations(StrategyTable, ({ many }) => ({
    trades: many(TradeTable),
}));

export const TradeRelations = relations(TradeTable, ({ one }) => ({
    strategy: one(StrategyTable, {
        fields: [TradeTable.strategyId],
        references: [StrategyTable.id],
    }),
}));

export const ReportsTable = pgTable("reports", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    reportData: jsonb("report_data").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const TransactionsTable = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    plan: text("plan").notNull(),
});

// New table for user-submitted feedback from the FeedbackCard
export const FeedbackTable = pgTable("feedbacks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => UserTable.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const JournalTable = pgTable(
    "journal",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        date: text("date").notNull(), // Stored as YYYY-MM-DD
        content: jsonb("content"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdDateIndex: index("journal_user_id_date_idx").on(
            table.userId,
            table.date
        ),
    })
);
