"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { StatsGridPageTwo } from "@/components/StatsGridPageTwo";
import { ReactNode, useEffect, useRef, useState } from "react";
import { CustomButton } from "../CustomButton";
import { StatsGridPageOne } from "@/components/StatsGridPageOne";
import { SignUpButton } from "@clerk/nextjs";
import HomePageStart from "./HomePageStart";
import HomePageReviews from "./HomePageReviews";
import HomePageCalendar from "./HomePageCalendar";
import HomePageFooter from "./HomePageFooter";
import { fakeDataChartTwo, otherData, tradingData } from "@/data/data";
import Link from "next/link";
import HomePageAi from "./HomePageAI";
import { SiClaude } from "react-icons/si";
import HomePageMobileAiPage from "./HomePageMobileAI";
import HomePageJournal from "./HomePageJournal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HomePage() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);

    const [isSwitchChartsActive, setIsSwitchChartsActive] = useState(false);

    const [isLargeScreen, setIsLargeScreen] = useState(true);
    useEffect(() => {
        setIsLargeScreen(window.innerWidth >= 768);
    }, []);

    useGSAP(() => {
        if (!sectionRef.current || !contentRef.current) return;
        const section = sectionRef.current;
        const content = contentRef.current;

        const pinScroll = content.scrollHeight - section.offsetHeight;

        gsap.to(content, {
            y: () => -pinScroll, // Move content up as user scrolls
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${pinScroll}`,
                pin: true,
                scrub: true,
                anticipatePin: 1,
            },
        });

        const mainTimeLine = gsap.timeline({
            scrollTrigger: {
                start: 10,
                scrub: false,
                toggleActions: "play none none reverse",
            },
        });

        const parallaxItems = content.querySelectorAll(".parallax-item");

        parallaxItems.forEach((item) => {
            const element = item as HTMLElement;
            const speed = parseFloat(element.dataset.speed || "1") || 1;

            gsap.to(item, {
                y: () => -(pinScroll * (1 - speed)),
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    // end: () => `+=${pinScroll}`,
                    scrub: true,
                },
            });
        });
        const mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            mainTimeLine
                .to(
                    "#navbar",
                    {
                        width: "60%",
                        boxShadow:
                            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    },
                    0
                )
                .to(
                    "#logo-text",
                    {
                        transform: "translateX(20%)",
                        opacity: 0,
                    },
                    0
                );
            // .to(
            //     "#nav-buttons",
            //     {
            //         transform: "translateX(-15px)",
            //     },
            //     0
            // );
        });
    });

    const handleSwitch = () => {
        if (buttonRef.current && !isSwitchChartsActive) {
            buttonRef.current.style.boxShadow =
                "0 0 0 1px #70451a3d, 0 1px 2px #70451a0d, 2px 3px 5px #70451a29, 4px 6px 5px #70451a14, 8px 12px 8px #70451a14,8px 0 0.5px #70451a33 inset, 20px 20px 25px 25px #70451a33 inset";
        } else if (buttonRef.current && isSwitchChartsActive) {
            buttonRef.current.style.boxShadow =
                "0 0 0 1px #70451a3d, 0 1px 2px #70451a0d, 2px 3px 5px #70451a29, 4px 6px 5px #70451a14, 8px 12px 8px #70451a14,8px 0 0.5px #70451a33 inset, 10px 0 4px -6px #70451a33 inset";
        }
        setIsSwitchChartsActive((prev) => !prev);
    };

    return (
        <div className={`${isLargeScreen ? "background-class" : ""}`}>
            <header className="flex-center py-2 w-full sticky top-0 md:top-2 px-3 lg:px-48 z-[999]">
                <nav
                    id="navbar"
                    className="flex items-center justify-between text-sm p-3 w-full rounded-2xl bg-white max-md:shadow-md">
                    <div className="flex gap-3 items-center">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={40}
                            height={40}
                        />
                        <p id="logo-text" className="text-[1rem]">
                            Journal
                        </p>
                        <p className="text-[1rem] md:hidden">&</p>
                        <SiClaude
                            size={24}
                            className="text-[#da7756] md:hidden"
                        />
                    </div>
                    <div className="hidden md:flex justify-center md:mr-[35px]">
                        <div id="nav-buttons" className="flex gap-2 lg:gap-4">
                            <Link href="/sign-in">
                                <div className="nav-link">Calendar</div>
                            </Link>
                            {/* <Link href="/sign-in">
                                <div className="nav-link">
                                    History
                                </div>
                            </Link> */}
                            <Link href="/sign-in">
                                <div className="nav-link">Statistics</div>
                            </Link>
                            <Link href="/sign-in">
                                <div className="nav-link">TradeAI</div>
                            </Link>
                        </div>
                    </div>
                    <CustomButton isBlack={false}>
                        <SignUpButton>
                            <span className="max-md:text-[.75rem]">Log in</span>
                        </SignUpButton>
                    </CustomButton>
                </nav>
            </header>
            <HomePageStart />
            <div
                ref={sectionRef}
                className="max-xl:hidden h-screen gradient relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center justify-center gap-4">
                    <span className="border border-zinc-700 py-1 px-2 rounded-md text-[.9rem] shadow-md shadow-zinc-900">
                        Charts
                    </span>
                    <h1 className="text-[1rem] sm:text-[2rem] 2xl:text-[3rem] text-center font-semibold">
                        Trade like a professional.
                    </h1>
                    <p className="text-[1rem]">
                        Boost your performance with detailed charts.
                    </p>
                </div>
                {/* <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex-center gap-2">
                    <Image src="/logo.svg" alt="logo" width={50} height={50} />
                    <p className="font-semibold text-xl text-primary">
                        Journal
                    </p>
                </div> */}
                <div
                    ref={contentRef}
                    className="flex flex-col items-center justify-center gap-4 absolute w-full">
                    {/* top | right */}

                    <ParallaxScrollCard position="top-[150px] right-[8%]">
                        <Image
                            src="/scroll-parallax-1.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-1"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* Background | top | right */}

                    <BackgroundParallaxScrollCard position="top-[350px] right-[4%]">
                        <Image
                            src="/scroll-parallax-4.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-4"
                        />
                    </BackgroundParallaxScrollCard>
                    {/* top | left */}

                    <ParallaxScrollCard position="top-[200px] left-[8%]">
                        <Image
                            src="/scroll-parallax-2.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-2"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* Background | top | left */}

                    <BackgroundParallaxScrollCard position="top-[450px] left-[8%]">
                        <Image
                            src="/scroll-parallax-1.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-1"
                        />
                    </BackgroundParallaxScrollCard>
                    {/* center | right */}

                    <ParallaxScrollCard position="top-[650px] left-[70%]">
                        <Image
                            src="/scroll-parallax-3.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-3"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* Backgound | bottom | right */}
                    <BackgroundParallaxScrollCard position="top-[900px] right-[6%]">
                        <Image
                            src="/scroll-parallax-2.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-2"
                        />
                    </BackgroundParallaxScrollCard>
                    {/* center | left */}
                    <ParallaxScrollCard position="top-[700px] left-[13%]">
                        <Image
                            src="/scroll-parallax-4.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-4"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* Backgound | bottom | left */}
                    <BackgroundParallaxScrollCard position="top-[900px] left-[5%]">
                        <Image
                            src="/scroll-parallax-5.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-5"
                        />
                    </BackgroundParallaxScrollCard>
                    {/* bottom | right */}
                    <ParallaxScrollCard position="top-[1150px] right-[7%]">
                        <Image
                            src="/scroll-parallax-5.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-5"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* bottom | left */}
                    <ParallaxScrollCard position="top-[1200px] left-[10%]">
                        <Image
                            src="/scroll-parallax-6.png"
                            width={340}
                            height={375}
                            alt="scroll-parallax-image-6"
                            className="shadow-md"
                        />
                    </ParallaxScrollCard>
                    {/* Margin bottom */}
                    <div className="absolute top-[1600px] h-[100px] w-1"></div>
                </div>
            </div>

            <div className="flex-center py-8 px-3 md:px-12 2xl:px-48">
                <div className="py-10 md:bg-primary rounded-xl w-full flex flex-col items-center justify-center background-class">
                    <div className="flex flex-col items-center justify-center gap-4 pb-4">
                        <span className="border border-zinc-200 py-1 px-2 rounded-md text-[.7rem] md:text-[.9rem] shadow-md">
                            Summary
                        </span>
                        <h1 className="text-[2rem] md:text-[3rem] text-center font-semibold">
                            Your trading achievements, <br /> all in one place.
                        </h1>
                        <p className="max-md:px-2 text-[.9rem] md:text-[1rem] mb-4">
                            See your growth and success, and take pride in every
                            milestone.
                        </p>
                        <div className="flex-center gap-4">
                            <p>Details</p>

                            <div
                                ref={buttonRef}
                                onClick={handleSwitch}
                                className={`${
                                    isSwitchChartsActive
                                        ? "switch-button active"
                                        : "switch-button"
                                }`}
                            />
                            <p>Summary</p>
                        </div>

                        {/* <CustomButton isBlack text="Join for free" /> */}
                    </div>
                    <div className="max-md:hidden w-full">
                        {isSwitchChartsActive ? (
                            <StatsGridPageTwo
                                start={"20000"}
                                end={"27680"}
                                oterData={fakeDataChartTwo}
                            />
                        ) : (
                            <StatsGridPageOne
                                tradingData={tradingData}
                                otherData={otherData}
                            />
                        )}
                    </div>
                    <div className="md:hidden w-full mt-4 flex justify-center">
                        {isSwitchChartsActive ? (
                            <Image
                                src="/statistics-page-one-mobile.png"
                                width={400}
                                height={300}
                                alt="chart-with-summary"
                            />
                        ) : (
                            <Image
                                src="/statistics-page-two-mobile.png"
                                width={400}
                                height={300}
                                alt="chart-with-details"
                            />
                        )}
                    </div>
                </div>
            </div>
            <HomePageAi />
            <HomePageMobileAiPage />
            <HomePageCalendar />
            <HomePageJournal />
            <HomePageReviews />
            <HomePageFooter />
        </div>
    );
}

const ParallaxScrollCard = ({
    position,
    children,
}: {
    position: string;

    children: ReactNode;
}) => {
    return (
        <div
            className={`w-[340px] h-[390px] bg-secondary p-3 absolute ${position} z-20 rounded-lg overflow-hidden flex-center`}>
            {children}
        </div>
    );
};

const BackgroundParallaxScrollCard = ({
    position,
    dataSpeed = "1.5",
    children,
}: {
    position: string;
    dataSpeed?: string;
    children: ReactNode;
}) => {
    return (
        <div
            data-speed={dataSpeed}
            className={`parallax-item w-[290px] h-[340px] bg-secondary p-3 absolute ${position} rounded-lg overflow-hidden flex-center opacity-40`}>
            {children}
        </div>
    );
};
