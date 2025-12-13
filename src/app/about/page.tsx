
"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="bg-white mb-10 mx-10 justify-items-center">
      {/* Hero Section */}
      <section className="max-w-7xl p-16 grid md:grid-cols-2 gap-8 items-start bg-jwmj rounded-2xl">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-black">
            Jamnagar Wehvaria Memon Jamat
          </h1>
          <p className="mt-6 text-gray-600 text-lg md:text-xl">
            Jamnagar Wehvaria Memon Jamat was established in 1949 in Karachi
            Pakistan. It is a non-profit organization working to provide
            facilities to its members and to strengthen brotherhood in the
            community.
          </p>
          <div
            className={`overflow-hidden transition-all duration-500 ${showMore ? 'max-h-none' : 'max-h-0'} mt-2`}
            aria-expanded={showMore}
          >
            <p className="text-gray-600 text-base md:text-lg pt-2">
              Jamnagar Wehvaria Memon Jamat has its own Constitution and this community is working for its people in the light of its Constitution. There are different committees who are working on their projects to provide their best facilities to the members of community.

              Our first priority is to provide quality education to our children. We are providing education to the children of our members from Nursery to higher studies. We have our own Employment Bureau in which we are providing employment to our members.

              We are providing housing facilities to our members who don’t have their own place to live or those who are living on monthly rent etc. We are also providing health facilities to our members in which we have discounted panels in different hospitals of Karachi city. We are also giving 100% medical help to those who are needy and unable to bear their medical expenses.

              Jamnagar Wehvaria Memon Jamat has its Youth Organisation which is working under the supervision of Jamnagar Wehvaria Memon Jamat. The young generation is serving people of the community from this platform.

              Hence, Jamnagar Wehvaria Memon Jamat is providing facilities to its members in every field and trying to improve its services to serve people of the community.
            </p>
          </div>
          <button
            onClick={() => setShowMore((v) => !v)}
            className="mt-6 inline-block text-sky-600 font-semibold text-lg focus:outline-none"
            aria-controls="about-readmore"
            aria-expanded={showMore}
          >
            {showMore ? 'Show less ↑' : 'Read more →'}
          </button>
        </div>
        <div className="flex justify-">
          <div className="w-4/5 flex justify-end">
            <Image
              src="/logo.png"
              alt="JWMJ"
              width={215}
              height={215}
              priority
            />
          </div>
        </div>
      </section>

        {/* Aims & Objectives */}
  <section id="aims" className="max-w-7xl px-4 py-16 place-items-center ">
    <h2 className="text-2xl md:text-4xl font-semibold mb-12">
      Aims & Objectives
    </h2>
    <div className="text-center w-full flex flex-row flex-wrap gap-6 justify-center">
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-centerw-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Promote unity, brotherhood, and friendship among Jamat members, working for their betterment and uplift.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Extend all possible help and cooperation to Jamat members, striving to improve their educational and religious conditions. Arrange proper measures for providing coffin and burial facilities.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Raise funds through subscriptions, donations, contributions, grants, aids, loans, and advances (in cash, cheque, or other forms) to be utilized in the best interest of Jamat.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Establish and run Jamat Khana, decoration services, or other measures to strengthen the social and economic condition of Jamat. Acquire, purchase, or exchange movable and immovable properties for association use, and maintain, repair, renovate, demolish, or construct them for offices, coaching classes, cutting classes, libraries, and more.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Amalgamate Madrassas, schools, boarding houses, libraries, reading rooms, industrial homes, meeting rooms, function halls, educational/instructional/vocational training centres, dispensaries, hospitals, maternity homes, child welfare centres, sanatoriums, orphanages, Musafir Khanas, and similar institutions whenever feasible within community means.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Maintain close contact with the entire Memon community of Pakistan, extending cooperation and assistance for social uplift and unity. Cooperate or affiliate with other Memon institutions or organizations having similar aims and objectives.
        </p>
      </div>
      <div className="p-6 rounded-2xl border-1 border-gray-400 bg-jwmj flex items-center justify-center w-64 md:w-72">
        <p className="text-sky-600 text-lg">
          Abstain from participating in the politics of the country.
        </p>
      </div>
    </div>

  </section>

      <br />

      {/* Vision */}
      <section id="vision" className="max-w-7xl p-8 rounded-2xl border-gray-400 border-1 bg-jwmj">
        <div className="flex items-center gap-6">
          <Image
            src="/mission.png"
            alt="Vision"
            width={208}
            height={208}
            className="w-32 h-32 md:w-52 md:h-52 opacity-70"
            priority
          />
          <p className="text-gray-600 text-lg md:text-2xl">
            Our mission is to provide each and every facility to the members of
            Jamat and fulfill every basic need of needy people of Jamat.
          </p>
        </div>
        <ul className="mt-8 space-y-4 text-gray-700 text-base md:text-lg list-disc list-inside">
          <li>
            Enable Wehvaria Education Board to freely support students with
            higher studies.
          </li>
          <li>Organize educational seminars and workshops.</li>
          <li>Offer interest-free business loans up to Rs. 300,000.</li>
          <li>
            Provide Islamic Takaful Health Card with Rs. 500,000 coverage per
            year.
          </li>
          <li>Offer Hajj/Umrah opportunities via balloting.</li>
          <li>Assist underprivileged members in acquiring homes.</li>
          <li>
            Increase Zakat & Welfare fund assistance by 100% with efficient
            distribution.
          </li>
        </ul>
      </section>
    </div>
  );
}
