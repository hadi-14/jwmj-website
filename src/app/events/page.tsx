import Image from "next/image";

export default function EventsPage() {
    return (
        <main className="w-full min-h-screen bg-gradient-to-br from-[#f9f6ff] via-[#f4faff] to-[#fefaf5] pb-20">
            {/* Hero Section */}
            <section className="max-w-6xl mx-auto mt-10 mb-12 rounded-2xl border border-slate-200 shadow-lg p-8 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-tr from-[#fffde7] to-[#e0f7fa]">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#F9A825] mb-4 tracking-tight">Events</h1>
                    <p className="text-lg md:text-xl text-gray-700 mb-4">
                        Celebrate, connect, and create memories! Discover upcoming and past events, from community festivals to workshops and family days.
                    </p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="Events"
                        width={180}
                        height={180}
                        className="w-32 h-32 md:w-44 md:h-44 opacity-90 drop-shadow-lg"
                        priority
                    />
                </div>
            </section>

            {/* Events Timeline */}
            <section className="max-w-4xl mx-auto px-4">
                <div className="relative border-l-4 border-[#F9A825]/30 pl-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="mb-12 relative group">
                            <div className="absolute -left-6 top-2 w-6 h-6 bg-[#F9A825] rounded-full border-4 border-white group-hover:scale-110 transition" />
                            <div className="bg-white rounded-xl shadow-md border border-[#F9A825]/10 p-6 ml-2">
                                <h3 className="text-lg font-bold text-[#F9A825] mb-1">Event Title {i}</h3>
                                <p className="text-gray-600 mb-2">A creative, engaging description of the event, its highlights, and why it matters to the community. Make it sound exciting!</p>
                                <span className="text-xs text-gray-400">{2024 - i} • Karachi</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
