import { JournalEditor } from "@/components/journal/JournalEditor";
import { getJournalEntry } from "@/server/actions/journal";
import { notFound } from "next/navigation";
import dayjs from "dayjs";

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export default async function JournalEntryPage({ params }: PageProps) {
    const { slug } = await params;

    // Validate slug (YYYY/MM/DD)
    if (slug.length !== 3) {
        notFound();
    }

    const [year, month, day] = slug;
    const dateStr = `${year}-${month}-${day}`;

    if (!dayjs(dateStr).isValid()) {
        notFound();
    }

    const entry = await getJournalEntry(dateStr);

    return <JournalEditor date={dateStr} initialContent={entry?.content as Record<string, unknown> | undefined} />;
}
