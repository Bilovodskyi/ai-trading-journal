"use server";

import { db } from "@/drizzle/db";
import { JournalTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getJournalEntry(date: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const entry = await db.query.JournalTable.findFirst({
        where: and(
            eq(JournalTable.userId, userId),
            eq(JournalTable.date, date)
        ),
    });

    return entry;
}

export async function saveJournalEntry(date: string, content: Record<string, unknown>) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const existingEntry = await db.query.JournalTable.findFirst({
            where: and(
                eq(JournalTable.userId, userId),
                eq(JournalTable.date, date)
            ),
        });

        if (existingEntry) {
            await db
                .update(JournalTable)
                .set({
                    content,
                    updatedAt: new Date(),
                })
                .where(eq(JournalTable.id, existingEntry.id));
        } else {
            await db.insert(JournalTable).values({
                userId,
                date,
                content,
            });
        }

        revalidatePath("/private/journal");
        return { success: true };
    } catch (error) {
        console.error("Error saving journal entry:", error);
        return { success: false, error: "Failed to save entry" };
    }
}

export async function getJournalDates() {
    const { userId } = await auth();
    if (!userId) return [];

    const entries = await db.query.JournalTable.findMany({
        where: eq(JournalTable.userId, userId),
        columns: {
            date: true,
        },
        orderBy: [desc(JournalTable.date)],
    });

    return entries.map((entry) => entry.date);
}
