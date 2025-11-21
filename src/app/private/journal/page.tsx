"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

export default function JournalPage() {
    const today = dayjs().format("YYYY/MM/DD");

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="p-2 bg-neutral-100 rounded-xl mb-6">
                <Image
                    src="/main-logo.png"
                    width={48}
                    height={48}
                    alt="Logo"
                    className="w-12 h-12"
                />
            </div>
            <h1 className="text-2xl font-bold text-zinc-800 mb-2">
                Your Trading Journal
            </h1>
            <p className="text-zinc-500 max-w-md mb-8">
                Document your trading journey, write down your thoughts, and review your performance.
            </p>
            <Button asChild>
                <Link href={`/private/journal/${today}`}>
                    Write Today&apos;s Entry
                </Link>
            </Button>
        </div>
    );
}
