"use client";
import { useState, useEffect } from "react";
import Image from 'next/image';
import Head from 'next/head';
import EventsHighlights from "@/components/eventsHighlights";
import { formatDate } from "@/utils/general";

export default function EventsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [Events, setEvents] = useState<{
    id: number;
    title: string;
    desc: string;
    date: string;
    time?: string;
    islamicDate?: string;
    venue?: string;
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
    const cats = Array.from(new Set(data.map((e: { category: string }) => e.category))) as string[];
    console.log(data, cats);
    setCategories(cats);
    setActiveTab(cats[0]);
    setEvents(data);
  };

  useEffect(() => {
    getEvents();
  }, []);

  // Sort only for categorized events
  const sortedEvents = [...Events].sort((a, b) =>
    sortOrder === 'new'
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime()
  );


  // Events for selected category
  const filteredCategoryEvents = sortedEvents.filter(e => e.category === activeTab);

  // Intersection Observer for timeline animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) {
              setVisibleCards(prev => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.timeline-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredCategoryEvents]);

  return (
    <>
      <Head>
        <title>Events - Jamnagar Wehvaria Memon Jamat</title>
        <meta name="description" content="Stay updated with the latest community events, programs, and activities organized by Jamnagar Wehvaria Memon Jamat." />
        <meta name="keywords" content="events, community events, Jamnagar Wehvaria Memon Jamat, programs, activities" />
        <meta property="og:title" content="Events - Jamnagar Wehvaria Memon Jamat" />
        <meta property="og:description" content="Stay updated with the latest community events and activities." />
        <meta property="og:type" content="website" />
      </Head>
      <main className="w-full min-h-screen pb-20 bg-linear-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative flex justify-center items-center mt-6 md:mt-10 mb-8 md:mb-12 px-4">
          {/* Main box: smaller width, more height */}
          <div className="relative z-10 w-full md:w-4xl h-16 md:h-24 md:h-30 bg-jwmj rounded-2xl md:rounded-3xl shadow-lg border border-slate-300 flex items-center justify-center mx-auto" />
          {/* Translucent blue pill overlay */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-14 md:h-16 md:h-20 bg-sky-400/70 rounded-xl md:rounded-[30px] flex items-center justify-center shadow-md border border-blue-200 px-4">
            <h1 className="text-xl md:text-3xl lg:text-5xl font-bold text-white text-center tracking-wide">Community Events</h1>
          </div>
        </section>

        <EventsHighlights />

        {/* Timeline Section */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-1 h-6 md:h-8 bg-linear-to-b from-sky-400 to-blue-500 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Events</h2>
              <div className="hidden md:flex flex-1 h-px bg-linear-to-r from-gray-300 to-transparent ml-4"></div>
            </div>

            <select
              className="w-full md:w-auto border-2 border-gray-200 rounded-xl px-3 md:px-4 py-2 text-sm text-gray-700 bg-white hover:border-sky-300 focus:border-sky-400 outline-none transition-colors shadow-sm"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'new' | 'old')}
            >
              <option value="new">Newest First</option>
              <option value="old">Oldest First</option>
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 md:gap-3 mb-8 md:mb-12 flex-wrap justify-start md:justify-center overflow-x-auto pb-2">
            {categories.map((cat, index) => (
              <button
                key={cat}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full border-2 text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${activeTab === cat
                  ? 'bg-linear-to-r from-sky-400 to-blue-500 text-white border-sky-300 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300 hover:text-sky-600 shadow-sm'
                  }`}
                onClick={() => setActiveTab(cat)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">

            {filteredCategoryEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-xl font-medium">No events in this category</p>
                <p className="text-sm mt-2">Check back later for updates!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline line - hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-sky-300 via-blue-400 to-sky-300 rounded-full transform -translate-x-1/2 shadow-sm"></div>
                {/* Mobile timeline line - left side only */}
                <div className="md:hidden absolute left-3 top-0 bottom-0 w-1 bg-linear-to-b from-sky-300 via-blue-400 to-sky-300 rounded-full shadow-sm"></div>

                {filteredCategoryEvents.map((event, index) => {
                  const isEven = index % 2 === 0;
                  const isVisible = visibleCards.has(event.id.toString());

                  return (
                    <div
                      key={event.id}
                      onClick={() => event.fb && window.open(event.fb, '_blank')}
                      className={`timeline-card relative flex flex-col md:flex-row items-stretch md:items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                        } group ${index > 0 ? '-mt-8' : ''}`}
                      data-id={event.id.toString()}
                      style={{
                        zIndex: filteredCategoryEvents.length - index,
                      }}
                    >
                      {/* Timeline dot - positioned differently for mobile */}
                      <div className={`absolute transform transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        } hidden md:flex md:left-1/2 md:-translate-x-1/2 md:z-20`}>
                        <div className="w-6 h-6 bg-linear-to-br from-sky-400 to-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute inset-0 w-6 h-6 bg-sky-300 rounded-full animate-ping opacity-30"></div>
                      </div>

                      {/* Mobile timeline dot */}
                      <div className={`md:hidden absolute left-0 transform -translate-x-1/2 transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}>
                        <div className="w-6 h-6 bg-linear-to-br from-sky-400 to-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute inset-0 w-6 h-6 bg-sky-300 rounded-full animate-ping opacity-30"></div>
                      </div>

                      {/* Event card */}
                      <div className={`w-full md:w-5/12 md:${isEven ? 'pr-8' : 'pl-8'} pl-12 md:pl-0`}>
                        <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform ${isVisible
                          ? `translate-x-0 opacity-100`
                          : 'md:' + (isEven ? `-translate-x-16` : `translate-x-16`) + ' opacity-0'
                          } hover:scale-105 hover:z-50 relative`}
                          style={{ transitionDelay: `${index * 150}ms` }}>
                          <div className="relative h-32 md:h-40 overflow-hidden">
                            <Image
                              src={event.img}
                              alt={event.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

                            {/* Date overlay */}
                            <div className={`absolute top-3 ${isEven ? 'right-3' : 'left-3'} bg-white/55 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg`}>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{formatDate(event.date).day}</div>
                                <div className="text-xs text-gray-600 font-medium">{formatDate(event.date).month}</div>
                                <div className="text-xs text-gray-500">{formatDate(event.date).year}</div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 md:p-5">
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-block px-2 py-1 bg-linear-to-r from-sky-100 to-blue-100 text-sky-800 text-xs font-semibold rounded-full">
                                  {event.category}
                                </span>
                                {new Date(event.date) >= new Date() && (
                                  <span className="inline-block px-2 py-1 bg-linear-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs font-semibold rounded-full">
                                    🚀 Upcoming
                                  </span>
                                )}
                              </div>
                            </div>

                            {event.time && (
                              <div className="flex items-center gap-2 mb-2 text-xs md:text-sm text-gray-700 flex-wrap">
                                <span>⏰ {event.time}</span>
                                {event.venue && <span>📍 {event.venue}</span>}
                              </div>
                            )}
                            {event.islamicDate && (
                              <div className="text-xs text-gray-500 mb-2">☪️ {event.islamicDate}</div>
                            )}

                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors line-clamp-2">
                              {event.title}
                            </h3>

                            <p className="text-gray-600 text-xs md:text-sm leading-relaxed line-clamp-2">
                              {event.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Empty space for alternating layout - hidden on mobile */}
                      <div className="hidden md:block w-5/12"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      </main>
    </>
  );
}