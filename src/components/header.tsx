import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full">
            {/* Blue Ribbon */}
            <div className="h-8 bg-gradient-to-r from-primary-blue to-accent-navy relative overflow-hidden justify-between">
                {/* First animated text */}
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                    style={{
                        animation: "marquee 16s linear infinite",
                        animationDelay: "0s"
                    }}
                >
                    Welcome to JWMJ! • Website Under Construction!
                </span>

                {/* Second animated text - offset by half the animation duration */}
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                    style={{
                        animation: "marquee 16s linear infinite",
                        animationDelay: "-8s"
                    }}
                >
                    Welcome to JWMJ! • Website Under Construction!
                </span>
            </div>

            <div className="w-full relative flex items-center justify-between shadow-lg shadow-primary-black">
                {/* Circle */}
                <div className="bg-primary-silver h-30 w-30 rounded-full absolute left-5 top-1 p-2 shadow-lg shadow-primary-black z-10">
                </div>
                <Link className="flex items-center gap-2 z-50 absolute left-7.5 top-4" href={"/"}>
                    <Image src="/logo.png" alt="Logo" width={100} height={100} />
                </Link>

                {/* Background Grey Box */}
                <div className="w-full bg-primary-silver h-15 flex items-center justify-end z-40">
                    <nav className="flex items-center mx-10">
                        <ul className="flex gap-6 text-primary-black/60 text-lg font-semibold">
                            <li><Link href="/#" className="hover:text-primary-blue">About US</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Announcements</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Events</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Youth Programs</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Support</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Contact</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}