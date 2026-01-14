import Link from "next/link";

export default function AnnouncementsPage() {
    return (
        <main className="w-full min-h-screen bg-gradient-to-br from-[#f4faff] via-[#fdfaf5] to-[#fefaf5] pb-20">
            {/* Hero Section */}
            <section className="max-w-6xl mx-auto mt-10 mb-12 rounded-2xl border border-slate-200 shadow-lg p-8 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-tr from-[#e0f7fa] to-[#fffde7]">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#038DCD] mb-4 tracking-tight">Announcements</h1>
                    <p className="text-lg md:text-xl text-gray-700 mb-4">
                        Stay up to date with the latest news, updates, and important information from JWMJ. Never miss an announcement!
                    </p>
                </div>
            </section>

            {/* Blog/Announcement Grid */}
            <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md border border-[#038DCD]/10 p-6 flex flex-col hover:scale-105 hover:shadow-xl transition-all duration-200">
                        <h3 className="text-xl font-bold text-[#038DCD] mb-2">Announcement Title {i}</h3>
                        <p className="text-gray-600 text-sm mb-3">A short, clear summary of the announcement, update, or news item. Make it engaging and informative!</p>
                        <Link href={`/announcements/${i}`} className="mt-auto text-[#038DCD] font-semibold hover:underline">Read More →</Link>
                    </div>
                ))}
            </section>
        </main>
    );
}
