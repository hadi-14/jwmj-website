'use client';

import { getBusinesses } from "@/actions/business";
import EventsHighlights from "@/components/eventsHighlights";
import { Business } from "@/types/businessAds";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [allCommunityBusinesses, setAllCommunityBusinesses] = useState<Business[]>([]);
  const services = [
    { name: "HEALTHCARE", href: "/#" },
    { name: "EDUCATION", href: "/#" },
    { name: "MICROFINANCE", href: "/#" },
    { name: "HELPING HAND", href: "/#" },
    { name: "24/7 EMERGENCY SUPPORT", href: "/#" },
    { name: "HOME BUYING SUPPORT", href: "/#" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBusinesses();
      setAllCommunityBusinesses(data);
    };
    fetchData();
  }, []);

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


      <div className="top-[90vh] w-full py-16 bg-gray-50">

        {/* Faculty Members (Presidency) - Desktop */}
        <section className="bg-jwmj p-8 max-w-7xl rounded-3xl border border-gray-200 shadow-lg mx-auto">

          <div className="flex flex-row gap-6 items-center">

            {/* President */}
            <div className="bg-white/30 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-80 w-1/4">

              <Image
                src="/Presidency/JWMJ/1.png"
                alt="President"
                width={200}
                height={200}
                className="object-cover mb-4 transition-transform duration-300 ease-in-out hover:scale-105 rounded-xl"
              />
              <p className="text-lg font-bold text-gray-800 text-center">
                President <br />Muhammad Yousuf Rangoonwala
              </p>
            </div>

            <div className="w-1/2">
              {/* Title */}
              <h2 className="text-center text-[#038DCD] font-bold text-2xl mb-8">
                MANAGEMENT TEAM
              </h2>
              {/* Middle Section - Other Team */}
              <div className="bg-white/30 rounded-2xl p-6 shadow-sm border border-gray-100 h-64 flex items-center justify-center">
                <Image
                  src="/Presidency/JWMJ group.jpg"
                  alt="Group Photo"
                  width={500}
                  height={200}
                  className="object-contain rounded-2xl transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </div>

            </div>

            {/* Honorary General Secretary */}
            <div className="bg-white/30 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-80 w-1/4">
              <Image
                src="/Presidency/JWMJ/4.png"
                alt="Honorary General Secretary"
                width={200}
                height={200}
                className="object-cover mb-4 transition-transform duration-300 ease-in-out hover:scale-105 rounded-xl"
              />
              <p className="text-lg font-bold text-gray-800 text-center">
                Honorary General Secretary <br />Muhammad Imran Wehvaria
              </p>
            </div>

          </div>
        </section>

        {/* Faculty Members (Presidency) JWMYO - Desktop */}
        <section className="mt-10 mb-10 bg-jwmj p-8 rounded-3xl border border-gray-200 shadow-lg mx-auto max-w-7xl">

          <div className="flex flex-row  gap-6 items-center">

            {/* President */}
            <div className="bg-primary-yellow/30 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-80 w-1/4">

              <Image
                src="/Presidency/JWMYO/1.png"
                alt="President"
                width={200}
                height={200}
                className="object-cover mb-4 transition-transform duration-300 ease-in-out hover:scale-105 rounded-xl"
              />
              <p className="text-lg font-bold text-gray-800 text-center">
                President <br />Uzair Munawar
              </p>
            </div>

            <div className="w-1/2">
              {/* Title */}
              <h2 className="text-center text-[#F9C856] font-bold text-2xl mb-8">
                JWMYO MANAGEMENT TEAM
              </h2>
              {/* Middle Section - Other Team */}
              <div className="bg-primary-yellow/30 rounded-2xl p-6 shadow-sm border border-gray-100 h-64 text-gray-500 flex items-center justify-center">
                <Image
                  src="/Presidency/JWMYO group.jpg"
                  alt="Group Photo"
                  width={500}
                  height={200}
                  className="object-contain rounded-2xl transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </div>
            </div>

            {/* General Secretary */}
            <div className="bg-primary-yellow/30 rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-center h-80 w-1/4">
              <Image
                src="/Presidency/JWMYO/4.png"
                alt="General Secretary"
                width={200}
                height={200}
                className="object-cover mb-4 transition-transform duration-300 ease-in-out hover:scale-105 rounded-xl"
              />
              <p className="text-lg font-bold text-gray-800 text-center">
                General Secretary <br />Saqib Yousuf Rangoonwala
              </p>
            </div>

          </div>

        </section>
        {/* Centered Button Below JWMYO Section */}
        <div className="flex justify-center mt-10 mb-10">
          <Link
            href="/presidency"
            className="px-8 py-3 rounded-full font-semibold text-lg bg-gray-200/70 text-gray-700 border-2 border-gray-400 shadow-md backdrop-blur-md transition hover:bg-gray-400 hover:text-white hover:border-gray-600 hover:scale-105 duration-200"
            style={{ boxShadow: '0 2px 8px rgba(120,120,120,0.10)' }}
          >
            See all teams
          </Link>
        </div>


        <div className="bg-gradient-to-b from-zinc-300/0 to-yellow-500/25 backdrop-blur-sm">
          {/* Hero Section with Three Cards */}
          <section className="relative px-3 py-4 md:px-6 lg:px-10">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {/* About Us Card */}
              <div className="bg-zinc-300/40 rounded-2xl border border-neutral-400 p-6 min-h-[280px] flex flex-col">
                <h2 className="text-sky-600 text-xl lg:text-2xl font-bold mb-4">About Us</h2>
                <div className="text-black/60 text-xs lg:text-sm font-medium leading-relaxed flex-grow">
                  Jamnagar Wehvaria Memon Jamat (JWMJ), established in 1949 in Karachi, is a non-profit community organization dedicated to fostering unity, brotherhood, and welfare among its members. Guided by its constitution, JWMJ actively supports education, healthcare, housing, employment, and social services while ensuring dignity and upliftment for all. Through various committees and initiatives, it continues to strengthen the community, provide essential facilities, and work for the collective progress of its members.
                </div>
                <Link href="/about" className="mt-4 self-center bg-sky-600/95 hover:bg-sky-700 text-black font-bold text-sm px-4 py-2 rounded-full border border-sky-700 transition-colors">
                  See All
                </Link>
              </div>

              {/* Aims & Objectives Card */}
              <div className="bg-zinc-300/40 rounded-2xl border border-neutral-400 p-6 min-h-[280px] flex flex-col">
                <h2 className="text-emerald-400 text-xl lg:text-2xl font-bold mb-4">Aims & Objectives</h2>
                <div className="text-black/60 text-xs lg:text-sm font-medium leading-relaxed flex-grow">
                  Jamnagar Wehvaria Memon Jamat, established in 1949 as a non-profit organization, aims to foster unity, brotherhood, and welfare among its members by supporting their educational, religious, social, and economic needs. The community raises funds through donations and contributions to provide essential services such as burial facilities, Jamat Khana, libraries, training centers, healthcare, and welfare institutions. It also works to strengthen social bonds, promote collective progress, and collaborate with other Memon organizations across Pakistan, while remaining strictly non-political.
                </div>
                <Link href="/about#aims" className="mt-4 self-center bg-emerald-400/75 hover:bg-emerald-500 text-black font-bold text-sm px-4 py-2 rounded-full border border-emerald-800 transition-colors">
                  See All
                </Link>
              </div>

              {/* Vision Card */}
              <div className="bg-zinc-300/40 rounded-2xl border border-neutral-400 p-6 min-h-[280px] flex flex-col">
                <h2 className="text-amber-300 text-xl lg:text-2xl font-bold mb-4">Vision</h2>
                <div className="text-black/60 text-xs lg:text-sm font-medium leading-relaxed flex-grow">
                  The vision of Jamat is to holistically support its members by promoting education, reducing unemployment through training, providing interest-free business loans, ensuring healthcare with Islamic Takaful, offering 24/7 emergency services, facilitating Hajj/Umrah for the needy, assisting in housing, expanding and transparently distributing zakat and welfare funds, empowering sub-committees, granting voting rights to overseas members, maintaining updated member data with digital tools, updating the constitution, seeking guidance from senior members, and ensuring transparency through annual financial and performance reports.
                </div>
                <Link href="/about#vision" className="mt-4 self-center bg-amber-300/60 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-full border border-orange-400 transition-colors">
                  See All
                </Link>
              </div>
            </div>
          </section>

          {/* Our Community Businesses Section - Redesigned */}
          <section className="relative px-3 py-8 md:px-6 lg:px-10">
            <div className="max-w-7xl mx-auto">
              {/* Section Background Card */}
              <div className="bg-zinc-300/40 rounded-2xl border border-neutral-400 p-6 lg:p-8">

                {/* Section Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
                    Our Community Businesses
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base max-w-2xl mx-auto">
                    Supporting our community members by showcasing their businesses and services.
                  </p>
                </div>

                {/* Business Logos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  {allCommunityBusinesses.slice(0, 5).map((business) => (
                    <div
                      key={business.id}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white/60 rounded-xl border border-gray-300 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-white/80">
                        {/* Business Logo */}
                        <div className="flex items-center justify-center mb-3">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#038DCD] to-[#F9C856] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm lg:text-lg">
                              {business.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        </div>

                        {/* Business Name */}
                        <div className="text-center">
                          <h3 className="font-semibold text-sm lg:text-base text-gray-800 line-clamp-2 group-hover:text-[#038DCD] transition-colors">
                            {business.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Section with CTA */}
                <div className="bg-white/50 rounded-xl border border-gray-300 p-6 text-center">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-3">
                    Discover More Community Businesses
                  </h3>
                  <p className="text-gray-600 text-sm lg:text-base mb-4 max-w-xl mx-auto">
                    Get special member discounts and support local entrepreneurs in our community.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Link
                      href="/business"
                      className="bg-[#038DCD] hover:bg-[#038DCD]/90 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 hover:scale-105 text-sm lg:text-base"
                    >
                      View All Businesses
                    </Link>
                    <button className="bg-white hover:bg-gray-50 text-[#038DCD] font-semibold px-6 py-2 rounded-full border-2 border-[#038DCD] transition-all duration-200 hover:scale-105 text-sm lg:text-base">
                      List Your Business
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* President's Message Section */}
          <section className="px-3 py-6 md:px-6 lg:px-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* President's Image Placeholder */}
                <div className="flex-1">
                  <div className="relative">
                    <Image
                      src="/Presidency/JWMJ/1.png"
                      alt="President"
                      width={400}
                      height={400}
                      className="object-cover mb-4 rounded-2xl"
                    />

                  </div>
                </div>

                {/* President's Message Content */}
                <div className="flex-1 md:flex-2">
                  <h2 className="text-neutral-900 text-2xl lg:text-3xl font-bold mb-4">President&apos;s Message</h2>
                  <div className="text-black text-sm lg:text-base leading-relaxed mb-6">
                    As the President of Jamnagar Wehvaria Memon Jamat, I am very thankful to Almighty Allah for giving me and my team the opportunity to serve the members of Jamat. Alhamdulillah our team is the first team of Jamat which has been selected to serve Jamat through elections with the help and cooperation of the members of Jamat and I and my entire team are very grateful to all the members of Jamat for this cooperation and belief.
                    Our first priority in serving the members of the Jamat is to educate the children and youth of the Jamat and at the same time make them skilled and aware according to the present times so that our future generations can benefit from it. Along with education, we are trying to provide maximum employment opportunities to our members so that unemployment can be eliminated from Jamat and in this regard, work has been started to provide interest free business loans to the members on easy installments. Efforts are also being made to improve the medical treatment, monthly helps, housing, marriage and other matters of the members of Jamat.
                    The current team will soon issue a health card for all the members of Jamat which will be used by members at any time as per their need. At the same time, for the first time in the Jamat, a 24/7 Committee has been formed to serve the members through which the members of the Jamat can contact the representatives of committee in case of any sudden trouble and inform them about their medical, burial or any legal issue and InShaAllah every effort will be made by the committee to resolve the grievances of the members as soon as possible.
                    In the end, we will try our best to promote the atmosphere of brotherhood and fraternity in the congregation. Poverty should be eradicated from the Jamat and all members should be made independent and we need full support and cooperation of our members for this noble cause.

                  </div>
                  <Link href="/presidency" className="bg-stone-300/75 hover:bg-stone-400 text-black font-bold text-xl px-12 py-6 rounded-full border border-neutral-500 transition-colors">
                    Full Message
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About JWMYO and History Section - Compact Version */}
          <section className="relative px-4 py-8 md:px-8 lg:px-12">
            <div className="relative z-10 max-w-7xl mx-auto">
              <div className="bg-stone-300/25 rounded-2xl border border-blue-900 p-6 lg:p-10">
                <Link href="/about-jwmyo" className="block cursor-pointer hover:bg-blue-900/10 rounded-2xl transition duration-200">
                  {/* About JWMYO */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <h2 className="text-sky-600 text-2xl lg:text-3xl font-bold">About JWMYO</h2>
                    <div className="text-sky-600 text-3xl lg:text-5xl font-black -mt-3">→</div>
                  </div>
                  <p className="text-black text-base lg:text-lg leading-relaxed mt-2">
                    The primary aims of JWMYO are the development of youth with strong religious belief and positive approach towards the modern world, organization of a healthcare system to arrange blood donation camps and free of cost medical camps for the members of community to facilitate a healthy lifestyle. Providing the educational opportunities to the students in the community with an intention to promote and encourage the positive approach towards higher and professional qualifications in order to achieve better jobs and work opportunities in the market.
                  </p>
                  <div className="bg-blue-900 max-w-6xl -mx-6 lg:-mx-10 my-8 h-[1px]"></div>
                  {/* History */}
                  <div>
                    <h2 className="text-neutral-900 text-2xl lg:text-3xl font-bold mb-4">History</h2>
                    <p className="text-black text-base lg:text-lg leading-relaxed">
                      The Jamnagar Wehvaria Memon Youth Organization is one of the esteemed social organization of the Memon communities serving since 1982 under the patronage of Jamnagar Wehvaria Memon Jamat.The strong foundation of Jamnagar Wehvaria Memon Youth Organization was laid by Mr. A.K Jamal, Mr. Abdul Nasir Rangoonwala, Mr Muhammad Saleem Durvesh, and Mr Muhammad Yousuf Rangoonwala under of leadership of then President of the Jamnagar Wehvaria Memon Jamat, Mr.Ahmed Abdul Ghaffar Rangoonwala.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="relative w-full max-w-7xl mx-auto py-8">

          <EventsHighlights />

          {/* See All Button */}
          <div className="flex justify-center mt-2 lg:mt-4">
            <button className="w-32 sm:w-36 lg:w-40 h-10 sm:h-12 lg:h-14 opacity-60 bg-stone-300/75 rounded-[25px] sm:rounded-[30px] border border-neutral-500 hover:opacity-80 transition-opacity duration-200">
              <span className="text-black text-sm sm:text-base lg:text-lg font-bold font-inter">
                See All
              </span>
            </button>
          </div>
        </div>


      </div>
    </main >
  );
}