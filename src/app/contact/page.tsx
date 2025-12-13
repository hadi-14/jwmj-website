import Image from "next/image";

export default function SupportPage() {
    return (
        <main className="w-full min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="max-w-5xl mx-auto mt-10 mb-12 bg-gradient-to-br from-[#f3f6f9] to-[#fff6e6] rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">Support</h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-4">
                        We&apos;re here to help! If you have any questions, need assistance, or want to reach out for support, please use the contact form or the information below.
                    </p>
                    <ul className="text-base md:text-lg text-gray-700 space-y-2">
                        <li><span className="font-semibold">Email:</span> info@jwmj.org</li>
                        <li><span className="font-semibold">Phone:</span> +92 300 1234567</li>
                        <li><span className="font-semibold">Office:</span> Suite# G-2, Ground floor, Fatima Residency, near Meezan Bank, behind Meerut Kabab House, Gurumandir, Karachi</li>
                    </ul>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Image
                        src="/mission.png"
                        alt="Support"
                        width={180}
                        height={180}
                        className="w-32 h-32 md:w-44 md:h-44 opacity-80"
                        priority
                    />
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-[#038DCD]/10 p-8 mb-16">
                <h2 className="text-[#038DCD] font-bold text-2xl mb-6 text-center">Contact Us</h2>
                <form className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-gray-700 font-semibold mb-2">Name</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#038DCD]" placeholder="Your Name" required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#038DCD]" placeholder="you@email.com" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Message</label>
                        <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#038DCD]" placeholder="How can we help you?" required />
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" className="bg-[#038DCD] text-white font-bold px-8 py-3 rounded-full shadow-md transition hover:bg-[#026fa1] hover:scale-105 duration-200">
                            Send Message
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
