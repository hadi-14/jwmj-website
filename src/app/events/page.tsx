"use client";
import { useState, useEffect } from "react";
import Image from 'next/image';
import EventsHighlights from "@/components/eventsHighlights";

// Dummy event data with placeholder images
const categories = [
  "Family Events",
  "Jamat Teachings",
  "Bachat Bazar",
  "Islamic Gatherings",
];

export const dummyEvents = [
  {
    id: 1,
    title: "Family Picnic 2025",
    desc: "A fun-filled day for families with games, food, and activities.",
    date: "2025-08-22",
    category: "Family Events",
    img: "https://placehold.co/400x300/87CEEB/FFFFFF/jpg?text=Family+Picnic",
  },
  {
    id: 2,
    title: "Quran Class Graduation",
    desc: "Celebrating our students' achievements in Quran studies.",
    date: "2025-08-15",
    category: "Jamat Teachings",
    img: "https://placehold.co/400x300/98FB98/FFFFFF/jpg?text=Quran+Class",
  },
  {
    id: 3,
    title: "Bachat Bazar Summer",
    desc: "A community market for affordable shopping.",
    date: "2025-07-30",
    category: "Bachat Bazar",
    img: "https://placehold.co/400x300/FFB347/FFFFFF/jpg?text=Summer+Bazar",
  },
  {
    id: 4,
    title: "Eid Gathering",
    desc: "Celebrate Eid with prayers and community lunch.",
    date: "2025-07-20",
    category: "Islamic Gatherings",
    img: "https://placehold.co/400x300/DDA0DD/FFFFFF/jpg?text=Eid+Gathering",
  },
  {
    id: 5,
    title: "Family Movie Night",
    desc: "Watch a family-friendly movie under the stars.",
    date: "2025-06-18",
    category: "Family Events",
    img: "https://placehold.co/400x300/87CEEB/FFFFFF/jpg?text=Movie+Night",
  },
  {
    id: 6,
    title: "Ramadan Workshop",
    desc: "Learn about the significance of Ramadan.",
    date: "2025-06-10",
    category: "Jamat Teachings",
    img: "https://placehold.co/400x300/98FB98/FFFFFF/jpg?text=Ramadan+Workshop",
  },
  {
    id: 7,
    title: "Bachat Bazar Spring",
    desc: "Spring edition of our popular community market.",
    date: "2025-05-25",
    category: "Bachat Bazar",
    img: "https://placehold.co/400x300/FFB347/FFFFFF/jpg?text=Spring+Bazar",
  },
  {
    id: 8,
    title: "Friday Halaqa",
    desc: "Weekly gathering for spiritual discussion.",
    date: "2025-05-10",
    category: "Islamic Gatherings",
    img: "https://placehold.co/400x300/DDA0DD/FFFFFF/jpg?text=Friday+Halaqa",
  },
  {
    id: 9,
    title: "Family Sports Day",
    desc: "Sports competitions for all ages.",
    date: "2025-04-15",
    category: "Family Events",
    img: "https://placehold.co/400x300/87CEEB/FFFFFF/jpg?text=Sports+Day",
  },
  {
    id: 10,
    title: "Islamic Art Workshop",
    desc: "Explore Islamic art and calligraphy.",
    date: "2025-03-28",
    category: "Islamic Gatherings",
    img: "https://placehold.co/400x300/DDA0DD/FFFFFF/jpg?text=Art+Workshop",
  },
  {
    id: 11,
    title: "Bachat Bazar Winter",
    desc: "Winter deals and community fun.",
    date: "2025-02-12",
    category: "Bachat Bazar",
    img: "https://placehold.co/400x300/FFB347/FFFFFF/jpg?text=Winter+Bazar",
  },
  {
    id: 12,
    title: "Jamat Youth Seminar",
    desc: "Empowering youth with knowledge and skills.",
    date: "2025-01-20",
    category: "Jamat Teachings",
    img: "https://placehold.co/400x300/98FB98/FFFFFF/jpg?text=Youth+Seminar",
  },
];

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    year: date.getFullYear()
  };
};

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [visibleCards, setVisibleCards] = useState(new Set());

  // Sort only for categorized events
  const sortedEvents = [...dummyEvents].sort((a, b) =>
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
    <main className="w-full min-h-screen pb-20 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative flex justify-center items-center mt-10 mb-12">
        {/* Main box: smaller width, more height */}
        <div className="relative z-10 md:w-4xl w-lg h-24 md:h-30 bg-jwmj rounded-3xl shadow-lg border border-slate-300 flex items-center justify-center mx-auto" />
        {/* Translucent blue pill overlay */}
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-16 md:h-20 bg-sky-400/70 rounded-[30px] flex items-center justify-center shadow-md border border-blue-200">
          <h1 className="text-2xl md:text-5xl font-bold text-white text-center tracking-wide">Community Events</h1>
        </div>
      </section>

      <EventsHighlights />

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">Event Timeline</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent ml-4"></div>
          </div>

          <select
            className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 bg-white hover:border-sky-300 focus:border-sky-400 outline-none transition-colors shadow-sm"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'new' | 'old')}
          >
            <option value="new">Newest First</option>
            <option value="old">Oldest First</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-3 mb-12 flex-wrap justify-center">
          {categories.map((cat, index) => (
            <button
              key={cat}
              className={`px-6 py-3 rounded-full border-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === cat
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white border-sky-300 shadow-lg'
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
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-300 via-blue-400 to-sky-300 rounded-full transform -translate-x-1/2 shadow-sm"></div>

          {filteredCategoryEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-xl font-medium">No events in this category</p>
              <p className="text-sm mt-2">Check back later for updates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategoryEvents.map((event, index) => {
                const isEven = index % 2 === 0;
                const isVisible = visibleCards.has(event.id.toString());

                return (
                  <div
                    key={event.id}
                    className={`timeline-card relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'
                      } group ${index > 0 ? '-mt-8' : ''}`}
                    data-id={event.id.toString()}
                    style={{
                      zIndex: filteredCategoryEvents.length - index,
                    }}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-1/2 transform -translate-x-1/2 z-20 transition-all duration-700 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                      }`}>
                      <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute inset-0 w-6 h-6 bg-sky-300 rounded-full animate-ping opacity-30"></div>
                    </div>

                    {/* Event card */}
                    <div className={`w-5/12 ${isEven ? 'pr-8' : 'pl-8'}`}>
                      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform ${isVisible
                        ? `translate-x-0 opacity-100`
                        : isEven
                          ? `-translate-x-16 opacity-0`
                          : `translate-x-16 opacity-0`
                        } hover:scale-105 hover:z-50 relative`}
                        style={{ transitionDelay: `${index * 150}ms` }}>
                        <div className="relative h-40 overflow-hidden">
                          <Image
                            src={event.img}
                            alt={event.title}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                          {/* Date overlay */}
                          <div className={`absolute top-3 ${isEven ? 'right-3' : 'left-3'} bg-white/55 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg`}>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-800">{formatDate(event.date).day}</div>
                              <div className="text-xs text-gray-600 font-medium">{formatDate(event.date).month}</div>
                              <div className="text-xs text-gray-500">{formatDate(event.date).year}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-block px-2 py-1 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 text-xs font-semibold rounded-full">
                              {event.category}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-sky-600 transition-colors line-clamp-2">
                            {event.title}
                          </h3>

                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {event.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    <div className="w-5/12"></div>
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
  );
}