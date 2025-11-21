import { Book, Calendar, CheckCircle2, PenLine } from "lucide-react";
import Link from "next/link";
import { CustomButton } from "../CustomButton";

const HomePageJournal = () => {
    return (
        <section className="w-full py-24 px-4 md:px-8 lg:px-16 bg-zinc-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    
                    {/* Text Content */}
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                            <Book className="w-4 h-4" />
                            <span>New Feature</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
                            Master your psychology with <span className="text-orange-500">Daily Journaling</span>
                        </h2>
                        
                        <p className="text-lg text-zinc-600 leading-relaxed">
                            The difference between a gambler and a trader is documentation. 
                            Keep track of your thoughts, emotions, and market observations to identify 
                            patterns in your behavior and improve your decision-making.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Rich text editor with markdown support",
                                "Calendar view for easy navigation",
                                "Link entries to specific trades (coming soon)",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-zinc-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <CustomButton isBlack>
                                <Link href="/private/journal">
                                    Start Journaling
                                </Link>
                            </CustomButton>
                        </div>
                    </div>

                    {/* Visual Preview / Mock UI */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-none">
                        <div className="relative rounded-2xl bg-white shadow-2xl shadow-zinc-200 border border-zinc-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            {/* Mock Window Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <div className="ml-4 flex items-center gap-2 text-xs text-zinc-400 bg-white px-3 py-1 rounded-md border border-zinc-100 shadow-sm">
                                    <Calendar className="w-3 h-3" />
                                    <span>Today&apos;s Entry</span>
                                </div>
                            </div>

                            {/* Mock Editor Content */}
                            <div className="p-8 space-y-6 min-h-[400px] bg-white">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-zinc-800">Market Analysis - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-500">#psychology</span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-500">#review</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 text-sm">
                                        💡 <strong>Note to self:</strong> Don&apos;t chase the opening range breakout today. Wait for the retest.
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-zinc-600">
                                            Market opened with a gap up. Feeling a bit FOMO but sticking to the plan. 
                                            Noticed strong volume on the tech sector.
                                        </p>
                                        <p className="text-zinc-600">
                                            <strong>10:30 AM:</strong> Took a long position on SPY. Setup looked clean, 
                                            risk/reward is 1:3.
                                        </p>
                                    </div>

                                    <div className="pl-4 border-l-2 border-zinc-200 italic text-zinc-500">
                                        &quot;The goal of a successful trader is to make the best trades. Money is secondary.&quot;
                                    </div>
                                </div>

                                {/* Floating Action Button Mock */}
                                <div className="absolute bottom-8 right-8">
                                    <div className="h-12 w-12 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg text-white">
                                        <PenLine className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -z-10 top-1/2 right-1/2 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl" />
                        <div className="absolute -z-10 bottom-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePageJournal;
