import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { CustomButton } from "../CustomButton";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Github, Twitter } from "lucide-react";
import Link from "next/link";

const HomePageFooter = () => {
    return (
        <footer className="w-full py-12 px-4 md:px-8 lg:px-16 bg-white">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* CTA Section */}
                <div className="w-full rounded-[2.5rem] bg-[#1a1a1a] text-white p-8 md:p-16 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/50 via-transparent to-transparent" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-xs md:text-sm text-zinc-300 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Join for free today
                        </div>

                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
                            Join thousands of <span className="text-zinc-400">smart traders.</span>
                        </h2>
                        
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                            From beginners to pros, your trading success starts here. 
                            Get advanced analytics and AI insights completely free.
                        </p>

                        <div className="pt-4">
                            <CustomButton isBlack={false}>
                                <SignUpButton>
                                    <span className="flex items-center gap-2 text-lg px-2">
                                        Get started for free <ArrowRight className="w-4 h-4" />
                                    </span>
                                </SignUpButton>
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 pt-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 rounded-xl">
                                <Image
                                    src="/logo.svg"
                                    alt="logo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Journal</span>
                        </div>
                        
                        <p className="text-zinc-500 leading-relaxed text-lg">
                            Your personal trading companion. Track market moves, analyze performance, 
                            and sharpen your strategy with AI-powered insights.
                        </p>

                        <div className="flex items-center gap-4">
                            <Link href="#" className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="text-sm text-zinc-400">
                            <p>© {new Date().getFullYear()} Trade Journal. All rights reserved.</p>
                        </div>
                    </div>

                    {/* FAQ Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <h3 className="text-2xl font-semibold tracking-tight mb-6">Frequently Asked Questions</h3>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border border-zinc-200 rounded-xl px-6 data-[state=open]:bg-zinc-50 transition-colors border-b-0">
                                <AccordionTrigger className="hover:no-underline py-6 text-lg font-medium">
                                    What is AI Trade Journal?
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-500 text-base leading-relaxed pb-6">
                                    Trade Journal is your personal trading companion that keeps track of all your market moves, 
                                    analyzes performance with advanced algorithms, and offers practical advice to sharpen your strategy. 
                                    Simply log all your trades and let our AI generate in-depth reports.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border border-zinc-200 rounded-xl px-6 data-[state=open]:bg-zinc-50 transition-colors border-b-0">
                                <AccordionTrigger className="hover:no-underline py-6 text-lg font-medium">
                                    Is it completely free?
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-500 text-base leading-relaxed pb-6">
                                    Yes, AI Trading Journal is completely free to use. You get access to:
                                    <ul className="mt-4 space-y-2 list-disc pl-4">
                                        <li>Comprehensive Calendar & History</li>
                                        <li>Advanced Statistics & Analytics</li>
                                        <li>5 complimentary AI analysis tokens</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border border-zinc-200 rounded-xl px-6 data-[state=open]:bg-zinc-50 transition-colors border-b-0">
                                <AccordionTrigger className="hover:no-underline py-6 text-lg font-medium">
                                    What assets are supported?
                                </AccordionTrigger>
                                <AccordionContent className="text-zinc-500 text-base leading-relaxed pb-6">
                                    We support all major asset classes including:
                                    <ul className="mt-4 grid grid-cols-2 gap-2">
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> Equities & ETFs</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> Cryptocurrencies</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> Forex Pairs</li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"/> Commodities</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default HomePageFooter;
