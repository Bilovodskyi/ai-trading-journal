import { pgTable, uuid, text, timestamp, jsonb, boolean, unique, integer, index, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const reports = pgTable("reports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	reportData: jsonb("report_data").notNull(),
	isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	plan: text().notNull(),
});

export const user = pgTable("user", {
	id: text().notNull(),
	capital: text().notNull(),
	tokens: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_id_unique").on(table.id),
]);

export const strategies = pgTable("strategies", {
	id: uuid().primaryKey().notNull(),
	userId: text().notNull(),
	strategyName: text().notNull(),
	description: text(),
	openPositionRules: jsonb("open_position_rules").default([]).notNull(),
	closePositionRules: jsonb("close_position_rules").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("strategy_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "strategies_userId_user_id_fk"
		}),
]);

export const trades = pgTable("trades", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	positionType: text().notNull(),
	openDate: text().notNull(),
	openTime: text().notNull(),
	closeDate: text().notNull(),
	closeTime: text().notNull(),
	deposit: text().notNull(),
	result: text().notNull(),
	notes: text(),
	instrumentName: text().notNull(),
	rating: integer().default(0),
	strategyId: uuid("strategy_id"),
	appliedOpenRules: jsonb("applied_open_rules"),
	appliedCloseRules: jsonb("applied_close_rules"),
}, (table) => [
	index("trade_strategy_id_idx").using("btree", table.strategyId.asc().nullsLast().op("uuid_ops")),
	index("userIdCloseDateIndex").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.closeDate.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.strategyId],
			foreignColumns: [strategies.id],
			name: "trades_strategy_id_strategies_id_fk"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const feedbacks = pgTable("feedbacks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text(),
	avatar: text(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "feedbacks_user_id_user_id_fk"
		}),
]);
