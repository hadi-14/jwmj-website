import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const services = [
    { name: "HEALTHCARE", href: "/healthcare" },
    { name: "EDUCATION", href: "/education" },
    { name: "MICROFINANCE", href: "/microfinance" },
    { name: "HELPING HAND", href: "/helping-hand" },
    { name: "24/7 EMERGENCY SUPPORT", href: "/emergency-support" },
    { name: "HOME BUYING SUPPORT", href: "/home-buying" }
  ];

  return (
    <main className="w-full z-5">
      
      {/* ===== MOBILE VERSION ===== */}
      <div className="relative w-full md:hidden">
        {/* Background Image */}
        <div className="relative w-full h-[70vh]">
          <Image
            src="/building_front.jpeg"
            alt="Building Hero"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-b-[2rem]"
            priority
          />
          <div className="absolute inset-0 rounded-b-[2rem] bg-[#038DCD] opacity-55" />

          {/* Text in image */}
          <div className="absolute z-10 top-0 left-0 w-full flex flex-col items-center justify-center text-center h-full px-4">
            <h1
              className="text-white font-bold text-2xl leading-tight mb-3"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
            >
              “Together in serve<br />for better Tomorrow”
            </h1>
            <p className="text-white font-semibold text-sm mb-4">
              Jamnagar Wehvaria Memon Jamat
            </p>
            <button className="bg-white/80 text-[#038DCD] font-bold px-4 py-2 rounded-full shadow-md transition text-sm hover:bg-[#038DCD]/90 hover:text-white hover:scale-105 duration-200">
              BECOME A MEMBER
            </button>
          </div>
        </div>

        {/* Services Card - Overflow */}
        <div className="relative z-20 -mt-30 px-4">
          <div
            className="bg-white/80 rounded-2xl shadow-lg px-3 py-3 flex flex-col w-3/4 border border-[#038DCD]/10 justify-between mx-auto"
            style={{ boxShadow: "0 4px 18px 0 rgba(3,141,205,0.10)" }}
          >
            {services.map((service, idx, arr) => (
              <div key={service.name} className="w-full flex flex-col justify-center flex-1">
                <Link
                  href={service.href}
                  className="text-[#038DCD] font-bold text-sm text-center block py-2 tracking-wide hover:bg-[#038DCD]/10 rounded-md transition duration-200"
                >
                  {service.name}
                </Link>
                {idx < arr.length - 1 && (
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#038DCD]/15 via-[#038DCD]/30 to-[#038DCD]/15 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP / LAPTOP VERSION ===== */}
      <div className="hidden md:flex w-full items-start justify-center mt-0">
        <div className="relative w-full h-[90vh] flex items-center justify-between px-2 mx-10 pt-20">
          
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/building_front.jpeg"
              alt="Building Hero"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-b-[3rem]"
              priority
            />
            <div className="absolute inset-0 rounded-b-[3rem] bg-[#038DCD] opacity-55" />
          </div>

          {/* Left: Text */}
          <div className="relative z-10 flex flex-col items-start justify-center h-full pl-20 pt-16" style={{ maxWidth: "55%" }}>
            <h1
              className="text-white font-bold text-5xl leading-tight mb-4"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
            >
              Together in<br />serve for better<br />Tomorrow
            </h1>
            <p className="text-white font-semibold text-lg mb-8">
              Jamnagar Wehvaria Memon Jamat
            </p>
            <button
              className="bg-white/80 text-[#038DCD] font-bold px-5 py-3 rounded-full shadow-md transition mb-2 text-lg hover:bg-[#038DCD]/90 hover:text-white hover:scale-105 duration-200"
              style={{ boxShadow: "0 2px 8px rgba(3,141,205,0.12)" }}
            >
              BECOME A MEMBER
            </button>
          </div>

          {/* Right: Services Card */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full pr-20 pt-16">
            <div
              className="bg-white/80 rounded-2xl shadow-lg px-5 py-5 flex flex-col min-w-[240px] max-w-[260px] min-h-[370px] border border-[#038DCD]/10 justify-between"
              style={{ boxShadow: "0 4px 18px 0 rgba(3,141,205,0.10)" }}
            >
              {services.map((service, idx, arr) => (
                <div key={service.name} className="w-full flex flex-col justify-center flex-1">
                  <Link
                    href={service.href}
                    className="text-[#038DCD] font-bold text-base text-center block py-2 tracking-wide hover:bg-[#038DCD]/10 rounded-md transition duration-200"
                  >
                    {service.name}
                  </Link>
                  {idx < arr.length - 1 && (
                    <div className="w-full h-[1.5px] bg-gradient-to-r from-[#038DCD]/15 via-[#038DCD]/30 to-[#038DCD]/15 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="h-screen "></div>
    </main>
  );
}
