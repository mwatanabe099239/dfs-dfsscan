"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/src/components/SearchBar";
import Image from "next/image";

const ROTATING_TEXTS = [
  { 
    text: "Explorer", 
    color: "#21f201", // green
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  { 
    text: "Portfolio", 
    color: "#21f201", // green
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
      </svg>
    )
  },
  { 
    text: "Analytics", 
    color: "#A855F7", // purple/pink
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 16v5" />
        <path d="M16 14v7" />
        <path d="M20 10v11" />
        <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
        <path d="M4 18v3" />
        <path d="M8 14v7" />
      </svg>
    )
  },
];

export default function AnimatedHeader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dotColor, setDotColor] = useState(ROTATING_TEXTS[0].color);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDotColor(ROTATING_TEXTS[currentIndex].color);
  }, [currentIndex]);

  const currentText = ROTATING_TEXTS[currentIndex];

  // Generate SVG pattern with dynamic color
  const generateDotsPattern = (color: string) => {
    const circles = [
      { cx: 5, cy: 5, opacity: 0.4 }, { cx: 15, cy: 5, opacity: 0.38 }, { cx: 5, cy: 15, opacity: 0.35 }, { cx: 15, cy: 15, opacity: 0.4 },
      { cx: 25, cy: 5, opacity: 0.15 }, { cx: 35, cy: 5, opacity: 0.18 }, { cx: 25, cy: 15, opacity: 0.12 }, { cx: 35, cy: 15, opacity: 0.15 },
      { cx: 45, cy: 5, opacity: 0.28 }, { cx: 55, cy: 5, opacity: 0.3 }, { cx: 45, cy: 15, opacity: 0.25 }, { cx: 55, cy: 15, opacity: 0.28 },
      { cx: 65, cy: 5, opacity: 0.45 }, { cx: 75, cy: 5, opacity: 0.42 }, { cx: 65, cy: 15, opacity: 0.38 }, { cx: 75, cy: 15, opacity: 0.42 },
      { cx: 85, cy: 5, opacity: 0.18 }, { cx: 95, cy: 5, opacity: 0.15 }, { cx: 85, cy: 15, opacity: 0.12 }, { cx: 95, cy: 15, opacity: 0.18 },
      { cx: 5, cy: 25, opacity: 0.18 }, { cx: 15, cy: 25, opacity: 0.15 }, { cx: 5, cy: 35, opacity: 0.12 }, { cx: 15, cy: 35, opacity: 0.18 },
      { cx: 25, cy: 25, opacity: 0.35 }, { cx: 35, cy: 25, opacity: 0.38 }, { cx: 25, cy: 35, opacity: 0.4 }, { cx: 35, cy: 35, opacity: 0.35 },
      { cx: 45, cy: 25, opacity: 0.15 }, { cx: 55, cy: 25, opacity: 0.18 }, { cx: 45, cy: 35, opacity: 0.12 }, { cx: 55, cy: 35, opacity: 0.15 },
      { cx: 65, cy: 25, opacity: 0.28 }, { cx: 75, cy: 25, opacity: 0.3 }, { cx: 65, cy: 35, opacity: 0.25 }, { cx: 75, cy: 35, opacity: 0.28 },
      { cx: 85, cy: 25, opacity: 0.4 }, { cx: 95, cy: 25, opacity: 0.38 }, { cx: 85, cy: 35, opacity: 0.35 }, { cx: 95, cy: 35, opacity: 0.4 },
      { cx: 5, cy: 45, opacity: 0.3 }, { cx: 15, cy: 45, opacity: 0.28 }, { cx: 5, cy: 55, opacity: 0.25 }, { cx: 15, cy: 55, opacity: 0.3 },
      { cx: 25, cy: 45, opacity: 0.15 }, { cx: 35, cy: 45, opacity: 0.12 }, { cx: 25, cy: 55, opacity: 0.18 }, { cx: 35, cy: 55, opacity: 0.15 },
      { cx: 45, cy: 45, opacity: 0.42 }, { cx: 55, cy: 45, opacity: 0.45 }, { cx: 45, cy: 55, opacity: 0.38 }, { cx: 55, cy: 55, opacity: 0.42 },
      { cx: 65, cy: 45, opacity: 0.15 }, { cx: 75, cy: 45, opacity: 0.18 }, { cx: 65, cy: 55, opacity: 0.12 }, { cx: 75, cy: 55, opacity: 0.15 },
      { cx: 85, cy: 45, opacity: 0.28 }, { cx: 95, cy: 45, opacity: 0.3 }, { cx: 85, cy: 55, opacity: 0.25 }, { cx: 95, cy: 55, opacity: 0.28 },
      { cx: 5, cy: 65, opacity: 0.12 }, { cx: 15, cy: 65, opacity: 0.15 }, { cx: 5, cy: 75, opacity: 0.18 }, { cx: 15, cy: 75, opacity: 0.12 },
      { cx: 25, cy: 65, opacity: 0.42 }, { cx: 35, cy: 65, opacity: 0.38 }, { cx: 25, cy: 75, opacity: 0.35 }, { cx: 35, cy: 75, opacity: 0.42 },
      { cx: 45, cy: 65, opacity: 0.28 }, { cx: 55, cy: 65, opacity: 0.25 }, { cx: 45, cy: 75, opacity: 0.3 }, { cx: 55, cy: 75, opacity: 0.28 },
      { cx: 65, cy: 65, opacity: 0.15 }, { cx: 75, cy: 65, opacity: 0.12 }, { cx: 65, cy: 75, opacity: 0.18 }, { cx: 75, cy: 75, opacity: 0.15 },
      { cx: 85, cy: 65, opacity: 0.35 }, { cx: 95, cy: 65, opacity: 0.38 }, { cx: 85, cy: 75, opacity: 0.4 }, { cx: 95, cy: 75, opacity: 0.35 },
      { cx: 5, cy: 85, opacity: 0.38 }, { cx: 15, cy: 85, opacity: 0.4 }, { cx: 5, cy: 95, opacity: 0.35 }, { cx: 15, cy: 95, opacity: 0.38 },
      { cx: 25, cy: 85, opacity: 0.25 }, { cx: 35, cy: 85, opacity: 0.28 }, { cx: 25, cy: 95, opacity: 0.3 }, { cx: 35, cy: 95, opacity: 0.25 },
      { cx: 45, cy: 85, opacity: 0.15 }, { cx: 55, cy: 85, opacity: 0.12 }, { cx: 45, cy: 95, opacity: 0.18 }, { cx: 55, cy: 95, opacity: 0.15 },
      { cx: 65, cy: 85, opacity: 0.42 }, { cx: 75, cy: 85, opacity: 0.45 }, { cx: 65, cy: 95, opacity: 0.38 }, { cx: 75, cy: 95, opacity: 0.42 },
      { cx: 85, cy: 85, opacity: 0.18 }, { cx: 95, cy: 85, opacity: 0.15 }, { cx: 85, cy: 95, opacity: 0.12 }, { cx: 95, cy: 95, opacity: 0.18 },
    ];

    return circles.map((circle, idx) => (
      <circle
        key={idx}
        cx={circle.cx}
        cy={circle.cy}
        r="1.7"
        fill={color}
        opacity={circle.opacity}
      />
    ));
  };

  return (
    <>
      <div className="relative py-8 pt-24 w-full  overflow-hidden bg-[#1a1a1a]">
        {/* Animated Dots Background SVG */}
        <svg
          key={dotColor}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 transition-colors duration-1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMaxYMid slice"
        >
          <defs>
            <pattern
              id={`dotsCluster-${dotColor.replace('#', '')}`}
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              {generateDotsPattern(dotColor)}
            </pattern>
            <linearGradient id={`curveGradient-${dotColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="20%" stopColor="white" stopOpacity="0" />
              <stop offset="30%" stopColor="white" stopOpacity="0.3" />
              <stop offset="40%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor="white" stopOpacity="0.85" />
              <stop offset="60%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`topFadeGradient-${dotColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="25%" stopColor="white" stopOpacity="0.4" />
              <stop offset="40%" stopColor="white" stopOpacity="0.8" />
              <stop offset="55%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <mask id={`curveMask-${dotColor.replace('#', '')}`}>
              <ellipse cx="75%" cy="50%" rx="50%" ry="120%" fill={`url(#curveGradient-${dotColor.replace('#', '')})`} />
            </mask>
            <mask id={`topFadeMask-${dotColor.replace('#', '')}`}>
              <rect width="100%" height="100%" fill={`url(#topFadeGradient-${dotColor.replace('#', '')})`} />
            </mask>
          </defs>
          <g mask={`url(#curveMask-${dotColor.replace('#', '')})`}>
            <g mask={`url(#topFadeMask-${dotColor.replace('#', '')})`}>
              <rect width="100%" height="100%" fill={`url(#dotsCluster-${dotColor.replace('#', '')})`} />
            </g>
          </g>
        </svg>
        
        <div className="container mx-auto px-4 flex justify-between relative z-10">
          <div className="w-full md:w-2/3">
            <div className="text-left mb-2">
              <h1 className="text-xl mb-1 font-bold text-white flex items-center gap-2">
                <span className="text-2xl">DFS Chain</span>
                <span 
                  className="transition-all duration-500 ease-in-out flex items-center gap-1 text-2xl"
                  style={{ color: currentText.color }}
                >
                  {currentText.icon}
                  {currentText.text}
                </span>
              </h1>
            </div>
            <SearchBar />
            <div className="text-base mt-3 text-gray-300">
              <span className="font-semibold">Sponsored: </span>
              Advertise across our explorers and boost your visibility.{" "}
              <span className="text-white cursor-pointer hover:underline">
                Book your slot here!
              </span>
            </div>
          </div>
          <div className="w-1/3 md:block hidden">
            <div className="flex items-center justify-start">
              <div className="w-fit relative md:block hidden">
                <div className="absolute -top-2 right-5 bg-gray-800 text-gray-300 px-2 py-1 text-xs rounded-md">
                  Ad
                </div>
                <Image
                  src="/images/ads.png"
                  alt="DFS Logo"
                  className="h-auto object-contain rounded-lg cursor-pointer"
                  width={350}
                  height={100}
                  priority
                  onClick={() => {
                    window.open("https://quickido.com", "_blank");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

