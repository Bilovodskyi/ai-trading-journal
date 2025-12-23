"use server";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function addCapitalOrUpdate(
    capital: string
): Promise<{ error: boolean } | undefined> {
    const { userId } = await auth();

    if (userId == null) {
        return { error: true };
    }

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (user == null) {
            await db
                .insert(UserTable)
                .values({ capital, id: userId, tokens: 5 });
        } else {
            await db
                .update(UserTable)
                .set({ capital })
                .where(eq(UserTable.id, userId));
        }
    } catch (err) {
        console.log(err);
        return { error: true };
    }
}

export async function getCapital(): Promise<
    string | undefined | { error: boolean }
> {
    const { userId } = await auth();

    if (userId == null) {
        return { error: true };
    }

    try {
        const data = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        // Coerce potential null from DB to undefined to satisfy the return type
        return data?.capital ?? undefined;
    } catch (err) {
        console.log(err);
        return { error: true };
    }
}

export async function checkIfUserHasTokens(): Promise<
    | { success: true; tokens: number | null }
    | { success: false; message: string }
> {
    try {
        const { userId } = await auth();
        if (userId == null) {
            return { success: false, message: "Not authenticated" };
        }

        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (user == null || user.tokens === null) {
            return {
                success: false,
                message:
                    "To get free tokens, you must finish your profile, go to the statistics page, and add your starting capital.",
            };
        }

        if (user.tokens === 0) {
            return { success: true, tokens: null };
        }

        return { success: true, tokens: user.tokens };
    } catch (err) {
        console.error("Error checking tokens:", err);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        };
    }
}

const PLAN_TOKEN_MAP = {
    "5": 20,
    "10": 60,
} as const;

export async function updateCredits({
    plan,
    userId,
}: {
    plan: string;
    userId: string;
}): Promise<
    { success: true; message: string } | { success: false; message: string }
> {
    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return { success: false, message: "User not found!" };
        }

        const updateTokensValue =
            PLAN_TOKEN_MAP[plan as keyof typeof PLAN_TOKEN_MAP];
        if (updateTokensValue === undefined) {
            return { success: false, message: "Invalid plan selected" };
        }

        await db
            .update(UserTable)
            .set({ tokens: Number(user.tokens) + updateTokensValue })
            .where(eq(UserTable.id, userId));

        return {
            success: true,
            message:
                "Thank you for your purchase! Tokens will be deposited into your account shortly.",
        };
    } catch (error) {
        console.error("Error checking tokens:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        };
    }
}


export async function completeOnboarding() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    await db.update(UserTable).set({ onboardingCompleted: true }).where(eq(UserTable.id, userId));
}

// Custom Field Names Management
export async function getCustomFieldNames(): Promise<{
    openFields: string[];
    closeFields: string[];
} | { error: boolean }> {
    const { userId } = await auth();
    if (!userId) {
        return { error: true };
    }

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        return {
            openFields: (user?.openCustomFieldNames as string[]) || [],
            closeFields: (user?.closeCustomFieldNames as string[]) || [],
        };
    } catch (err) {
        console.error("Error getting custom field names:", err);
        return { error: true };
    }
}

export async function addCustomFieldName(
    type: "open" | "close",
    fieldName: string
): Promise<{ success: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentFields = type === "open"
            ? (user.openCustomFieldNames as string[]) || []
            : (user.closeCustomFieldNames as string[]) || [];

        // Check if field already exists
        if (currentFields.includes(fieldName)) {
            return { success: true }; // Already exists, no need to add
        }

        const updatedFields = [...currentFields, fieldName];

        if (type === "open") {
            await db.update(UserTable)
                .set({ openCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        } else {
            await db.update(UserTable)
                .set({ closeCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        }

        return { success: true };
    } catch (err) {
        console.error("Error adding custom field name:", err);
        return { success: false, error: "Failed to add field" };
    }
}

export async function removeCustomFieldName(
    type: "open" | "close",
    fieldName: string
): Promise<{ success: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentFields = type === "open"
            ? (user.openCustomFieldNames as string[]) || []
            : (user.closeCustomFieldNames as string[]) || [];

        const updatedFields = currentFields.filter(f => f !== fieldName);

        if (type === "open") {
            await db.update(UserTable)
                .set({ openCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        } else {
            await db.update(UserTable)
                .set({ closeCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        }

        return { success: true };
    } catch (err) {
        console.error("Error removing custom field name:", err);
        return { success: false, error: "Failed to remove field" };
    }
}