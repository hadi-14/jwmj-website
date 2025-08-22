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

  const presidencyMembers = [
    { name: "Ahmed Hassan", role: "President", image: "/president.jpg" },
    { name: "Fatima Ali", role: "Vice President", image: "/vice-president.jpg" },
    { name: "Omar Malik", role: "General Secretary", image: "/secretary.jpg" },
    { name: "Zara Khan", role: "Treasurer", image: "/treasurer.jpg" }
  ];

  // Assign president, generalSecretary, and others for the management team section
  const president = presidencyMembers.find(m => m.role === "President");
  const generalSecretary = presidencyMembers.find(m => m.role === "General Secretary");
  const others = presidencyMembers.filter(m => m.role !== "President" && m.role !== "General Secretary");

  // const recentUpdates = [];

  return (
    <main className="w-full z-5 -mt-24">

      {/* Header Section */}
      <div>
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
            <div className="absolute inset-0 rounded-b-[2rem]" style={{
              background: 'linear-gradient(120deg, #03BDCD 8%, #F9D98F 99%)',
              opacity: 0.55,
            }} />

            {/* Text in image */}
            <div className="absolute z-10 top-0 left-0 w-full flex flex-col items-center justify-center text-center h-full px-4">
              <h1
                className="text-white font-bold italic leading-tight mb-3"
                style={{
                  fontSize: '2.2rem',
                  textAlign: 'left',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  lineHeight: 1.1,
                }}
              >
                &ldquo;Together in<br />serve for better<br />Tomorrow&rdquo;
              </h1>
              <p
                className="text-white font-semibold italic mb-4"
                style={{ textAlign: 'left', fontSize: '1.1rem' }}
              >
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
              <div className="absolute inset-0 rounded-b-[3rem]" style={{
                background: 'linear-gradient(120deg, #03BDCD 8%, #F9D98F 99%)',
                opacity: 0.55,
              }} />
            </div>

            {/* Left: Text */}
            <div className="relative z-10 flex flex-col items-start justify-center h-full pl-20 pt-16" style={{ maxWidth: "55%" }}>
              <h1
                className="text-white font-bold italic leading-tight mb-4"
                style={{
                  fontSize: '4rem',
                  textAlign: 'left',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  lineHeight: 1.1,
                }}
              >
                &ldquo;Together in<br />serve for better<br />Tomorrow&rdquo;
              </h1>
              <p
                className="text-white font-semibold italic mb-8"
                style={{ textAlign: 'left', fontSize: '1.5rem' }}
              >
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
      </div>


      {/* Desktop Sections Below Hero */}
      <div className="top-[90vh] w-full px-12 py-16 bg-gray-50">

        {/* About Overview & Annual Report - Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* About Overview */}
          <section className="bg-white rounded-4xl shadow-md p-8 border border-[#038DCD]/10">
            <h2 className="text-[#038DCD] font-bold text-2xl mb-6">About Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Jamnagar Wehvaria Memon Jamat has been serving our community for over five decades,
              providing essential services and fostering unity among our members. Our commitment
              to excellence in healthcare, education, and social welfare has made us a cornerstone
              of the community.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our mission is to create a supportive environment where every member can thrive
              through comprehensive healthcare services, quality education support, financial assistance,
              and 24/7 emergency support systems.
            </p>
            <Link href="/about" className="inline-flex items-center text-[#038DCD] font-semibold hover:underline">
              Read More About Us →
            </Link>
          </section>

          {/* Annual Report */}
          <section className="bg-white rounded-4xl shadow-md p-8 border border-[#038DCD]/10">
            <h2 className="text-[#038DCD] font-bold text-2xl mb-6">Annual Report 2024</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#038DCD]/5 rounded-lg">
                <span className="font-semibold">Families Served</span>
                <span className="text-[#038DCD] font-bold text-xl">2,450</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#038DCD]/5 rounded-lg">
                <span className="font-semibold">Healthcare Services</span>
                <span className="text-[#038DCD] font-bold text-xl">15,200</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#038DCD]/5 rounded-lg">
                <span className="font-semibold">Educational Support</span>
                <span className="text-[#038DCD] font-bold text-xl">850</span>
              </div>
            </div>
            <Link href="/annual-report" className="inline-flex items-center mt-6 text-[#038DCD] font-semibold hover:underline">
              View Full Report →
            </Link>
          </section>

        </div>

        {/* Faculty Members (Presidency) - Desktop */}
        <section className="bg-gradient-to-br from-[#fdfaf5] via-[#f4faff] to-[#fefaf5] p-8 rounded-3xl border border-gray-200 shadow-lg">
          {/* Title */}
          <h2 className="text-center text-[#038DCD] font-bold text-2xl mb-8">
            MANAGEMENT TEAM
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

            {/* President */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-64">
              {president && president.image ? (
                <Image
                  src={president.image}
                  alt={president.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover mb-4"
                />
              ) : null}
              <p className="text-lg font-bold text-gray-800 text-center">
                President <br />{president ? president.name : "Name"}
              </p>
            </div>

            {/* Middle Section - Other Team */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-500">
              {others && others.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  {others.map((member) => (
                    <div
                      key={member.name}
                      className="p-3 bg-gradient-to-br from-[#f4faff] to-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                      {member.image && (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={60}
                          height={60}
                          className="rounded-full object-cover mx-auto mb-2"
                        />
                      )}
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-[#038DCD]">{member.role}</p>
                    </div>
                  ))}
                </div>
              ) : (
                "Other leadership members"
              )}
            </div>

            {/* General Secretary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-64">
              {generalSecretary && generalSecretary.image ? (
                <Image
                  src={generalSecretary.image}
                  alt={generalSecretary.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover mb-4"
                />
              ) : null}
              <p className="text-lg font-bold text-gray-800 text-center">
                General Secretary <br />{generalSecretary ? generalSecretary.name : "Name"}
              </p>
            </div>

          </div>
        </section>

        {/* Patron Zakat & Donations */}
        <section className="bg-white rounded-4xl shadow-md p-8 border border-[#038DCD]/10">
          <h2 className="text-[#038DCD] font-bold text-2xl mb-6">Patron Zakat & Donations</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Your contributions make a significant difference in our community. Through Zakat
            and generous donations, we&apos;ve been able to expand our services and reach more
            families in need.
          </p>
          <div className="space-y-4 mb-6">
            <div className="bg-[#038DCD]/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Zakat Collection 2024</h4>
              <p className="text-sm text-gray-600">Distributed to 180 eligible families</p>
            </div>
            <div className="bg-[#038DCD]/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Emergency Fund</h4>
              <p className="text-sm text-gray-600">Available for urgent community needs</p>
            </div>
            <div className="bg-[#038DCD]/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Development Projects</h4>
              <p className="text-sm text-gray-600">Infrastructure and facility improvements</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/zakat" className="flex-1 bg-[#038DCD] text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-[#038DCD]/90 transition">
              Pay Zakat
            </Link>
            <Link href="/donations" className="flex-1 border-2 border-[#038DCD] text-[#038DCD] text-center py-3 px-4 rounded-lg font-semibold hover:bg-[#038DCD]/5 transition">
              Donate Now
            </Link>
          </div>
        </section>

      </div>
    </main >
  );
}