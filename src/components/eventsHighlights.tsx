import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { formatDate } from '@/utils/general';

export default function EventsHighlights() {
    const sliderRef = useRef<HTMLDivElement>(null);
      const [Events, setEvents] = useState<{
        id: number;
        title: string;
        desc: string;
        date: string;
        category: string;
        img: string;
        fb?: string;
      }[]>([]);
    
      const getEvents = async () => {
        const res = await fetch("/api/events", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setEvents(data);
      };
    
      useEffect(() => {
        getEvents();
      }, []);
    

    // Latest 8 events for slider (always newest)
    const latestEvents = [...Events]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8);


    // Scroll slider left/right
    const scrollSlider = (dir: 'left' | 'right') => {
        if (!sliderRef.current) return;
        const card = sliderRef.current.querySelector('.event-slider-card');
        if (!card) return;
        const cardWidth = (card as HTMLElement).offsetWidth + 32;
        sliderRef.current.scrollBy({
            left: dir === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth'
        });
    };

    return (
        <section className="max-w-7xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-800">Latest Events</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent ml-4"></div>
            </div>

            <div className="relative rounded-3xl border border-gray-200 bg-jwmj-400 shadow-xl px-6 py-12 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-sky-100 rounded-full blur-xl opacity-60"></div>
                    <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-40"></div>
                </div>

                {/* Navigation arrows */}
                <button
                    className="absolute -left-0 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent rounded-none w-auto h-auto flex items-center justify-center z-30 group hover:scale-110 transition-transform duration-300 ml-2 opacity-60 hover:opacity-100"
                    onClick={() => scrollSlider('left')}
                    aria-label="Scroll left"
                    style={{ boxShadow: 'none', border: 'none' }}
                >
                    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 4L8 24L24 44" stroke="#171717" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    className="absolute -right-0 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent rounded-none w-auto h-auto flex items-center justify-center z-30 group hover:scale-110 transition-transform duration-300 mr-2 opacity-60 hover:opacity-100"
                    onClick={() => scrollSlider('right')}
                    aria-label="Scroll right"
                    style={{ boxShadow: 'none', border: 'none' }}
                >
                    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                        <path d="M24 4L8 24L24 44" stroke="#171717" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Fade gradients */}
                <div className="absolute left-0 top-0 h-full w-16 z-20 bg-gradient-to-r from-[#e7eadc] via-[#e7eadc]/20 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 h-full w-16 z-20 bg-gradient-to-l from-[#cce4ec] via-[#cce4ec]/80 to-transparent pointer-events-none"></div>

                {/* Cards container */}
                <div
                    ref={sliderRef}
                    className="flex gap-6 mx-8 overflow-x-auto scrollbar-none scroll-smooth py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {latestEvents.map((event, index) => (
                        <div
                            key={event.id}
                            onClick={() => event.fb && window.open(event.fb, '_blank')}
                            className="group event-slider-card flex-shrink-0 w-72 bg-white/40 rounded-2xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-3 transition-all duration-500 relative"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'slideInUp 0.6s ease-out forwards'
                            }}
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={event.img}
                                    alt={event.title}
                                    width={400}
                                    height={300}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Date badge */}
                                <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-primary-black/10">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-800">{formatDate(event.date).day}</div>
                                        <div className="text-xs text-gray-600 font-medium">{formatDate(event.date).month}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors line-clamp-2">
                                    {event.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {event.desc}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="inline-block px-3 py-1 bg-sky-100/50 border border-primary-blue/40 text-sky-800 text-xs font-medium rounded-full">
                                        {event.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(event.date).year}
                                    </span>
                                </div>
                            </div>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-sky-100/10 via-transparent to-blue-100/10 pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    );
}