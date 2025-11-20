"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Handshake, MessageCircle, Star } from "lucide-react";
import { completeOnboarding } from "@/server/actions/user";
import { redirect } from "next/navigation";

const STEPS = [
    {
        title: "Welcome to TradeJournal",
        body: "A quick tour of our main features. Let's get started!",
    },
    {
        title: "Step 1: Calendar",
        body: "See you trade history in a visual calendar.",
        image: "/intro/intro-calendar.svg",
    },
    {
        title: "Step 2: Add open and closed positions",
        body: "You can add open trades and close them later.",
        video: "/intro/intro-open-close-position.webm",
    },
    {
        title: "Step 3: Add a strategy",
        body: "Add your strategies so you can stay consistent.",
        image: "/intro/intro-strategies.png",
    },
    {
        title: "Step 4: Track how you follow your rules",
        body: "Attach a strategy to your trade and check off open/close rules.",
        image: "/intro/intro-trade-with-strategy.png",
    },
    {
        title: "Step 5: History page",
        body: "Switch between open and closed trades. Filter by instrument, column, and time. Edit or delete trades.",
        image: "/intro/intro-history.png",
    },
    {
        title: "Step 6: Journal page",
        body: "Journal your thoughts and insights.",
        image: "/intro/intro-journal.svg",
    },
    {
        title: "Step 7: Get your AI report",
        body: "Get your AI report and improve your trading. Currently it's paid, but we're working on a free version.",
        video: "/intro/intro-ai-report.webm",
    },
    {
        title: "Support & Feedback",
        body: "Give us feedback, for you its a few seconds, for us its a big help. Also give us a ⭐ on GitHub if you like the app. More stars - more features.",
        last: true,
    },
];

export default function Page() {
    const [step, setStep] = useState(0);
    const total = STEPS.length;
    const isFirst = step === 0;
    const isLast = step === total - 1;

    // Optional: arrow-key navigation
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" && !isLast) setStep((s) => Math.min(total - 1, s + 1));
            if (e.key === "ArrowLeft" && !isFirst) setStep((s) => Math.max(0, s - 1));
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isFirst, isLast, total]);

    return (
        <div className="mx-auto flex h-full w-full flex-col p-12 absolute top-0 left-0 right-0 bottom-0 bg-white z-[9999]">
            <main className="flex-1" aria-live="polite">
                <h2 className="mb-2 text-xl font-medium">{STEPS[step].title}</h2>
                <p className="text-tertiary text-sm">{STEPS[step].body}</p>
            </main>
            {STEPS[step].image && (
                <div className="w-full h-full flex items-center justify-center">
                    <Image src={STEPS[step].image} alt={STEPS[step].title} width={1200} height={1200} />
                </div>
            )}
            {STEPS[step].video && (
                <div className="w-full h-full flex items-center justify-center">
                    <video src={STEPS[step].video} width={1000} height={1000} autoPlay loop muted playsInline />
                </div>
            )}
            {STEPS[step].last && (
                <div className="w-full h-full flex items-center justify-center gap-12">
                    <div className="flex flex-col gap-2 p-8 border border-zinc-300 rounded-xl w-[300px] h-[240px]">
                        <MessageCircle size={24} />
                        <h1 className="text-2xl font-bold mb-2">Feedback</h1>
                        <p className="text-sm text-zinc-500">Leave feedback on the Feedback page or open an issue on Github, every message is valuable and can spark real change.</p>
                    </div>
                    <div className="flex flex-col gap-2 p-8 border border-zinc-300 rounded-xl w-[300px] h-[240px]">
                        <Star size={24} />
                        <h1 className="text-2xl font-bold mb-2">GitHub</h1>
                        <p className="text-sm text-zinc-500">Give us a star on GitHub — more stars help us prioritize and build new features.</p>
                    </div>
                    <div className="flex flex-col gap-2 p-8 border border-zinc-300 rounded-xl w-[300px] h-[240px]">
                        <Handshake size={24} />
                        <h1 className="text-2xl font-bold mb-2">Collaboration</h1>

                        <p className="text-sm text-zinc-500">Open to collaboration — create a GitHub issue to request a collab; we love working with passionate people.</p>
                    </div>
                </div>
            )}

            <footer className="flex items-center justify-end">
                {/* Back (hidden on first) */}
                <div className="flex items-center gap-2">
                    {!isFirst && (
                        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                            Back
                        </Button>
                    )}
                    {!isLast ? (
                        <Button onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>Next</Button>
                    ) : (
                        <form action={async () => { await completeOnboarding(); redirect("/private/calendar") }}>
                            <input type="hidden" name="redirectTo" />
                            <StartButton />
                        </form>
                    )}
                </div>
            </footer>
            {/* Non-interactive progress dots */}
            <ol
                className="my-6 flex items-center justify-center gap-2 absolute bottom-10 left-1/2 -translate-x-1/2"
                aria-label={`Step ${step + 1} of ${total}`}
            >
                {Array.from({ length: total }).map((_, i) => {
                    const active = i === step;
                    return (

                        <span
                            key={i}
                            className={[
                                "block h-1.5 rounded-full",
                                // smooth animation
                                "transition-all duration-400 ease-in-out motion-safe:transition-all",
                                "will-change-[width,background-color]",
                                active ? "w-4 bg-black/90" : "w-1.5 bg-black/30",
                            ].join(" ")}
                        />

                    );
                })}
            </ol>
        </div>
    );
}

function StartButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Starting…" : "Start Journal"}
        </Button>
    );
}