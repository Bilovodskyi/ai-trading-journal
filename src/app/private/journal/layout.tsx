import { getJournalDates } from "@/server/actions/journal";
import { JournalSidebar } from "@/components/journal/JournalSidebar";

export default async function JournalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dates = await getJournalDates();

    return (
        <div className="flex h-full">
            <JournalSidebar dates={dates} />
            <div className="flex-1 overflow-y-auto bg-white">
                {children}
            </div>
        </div>
    );
}
