'use client';
import Image from 'next/image';

// Type definitions
interface Member {
  name: string;
  designation: string;
  contact: string;
  photo?: string;
}

interface FlipCardProps {
  member: Member;
  isPresident?: boolean;
}

// Data structure for office bearers
const officeBearers = [
  { name: "Muhammad Yousuf Rangoonwala", designation: "President", contact: "0300-8223534", photo: "/Presidency/JWMJ/1.png" },
  { name: "Jawad Ahmed Farooq", designation: "Senior Vice President", contact: "0321-9215667", photo: "/Presidency/JWMJ/2.jpg" },
  { name: "Muhammad Asif Muhammad Ali", designation: "Vice President", contact: "0321-2027353", photo: "/Presidency/JWMJ/3.png" },
  { name: "Muhammad Imran Wehvaria", designation: "Honorary General Secretary", contact: "0321-9255899", photo: "/Presidency/JWMJ/4.png" },
  { name: "Mufti Muhammad Bilal Durvesh", designation: "Senior Joint Secretary", contact: "0321-2892532", photo: "/Presidency/JWMJ/5.jpg" },
  { name: "Shabbir Abdul Wahid", designation: "Joint Secretary", contact: "0322-2377366", photo: "/Presidency/JWMJ/6.jpg" },
  { name: "Shahzad Kamdar", designation: "Finance Secretary", contact: "0322-8667279", photo: "/Presidency/JWMJ/7.jpg" }
];

// Data structure for managing committee members
const managingCommittee = [
  { name: "Haji Ghulam Muhammad", designation: "Member", contact: "0320-9229221", photo: "/Presidency/JWMJ/8.jpg" },
  { name: "Abdul Majeed Rangoonwala", designation: "Member", contact: "0321-8203850", photo: "/Presidency/JWMJ/9.jpg" },
  { name: "Muhammad Saeed Mulla", designation: "Member", contact: "0321-8220996", photo: "/Presidency/JWMJ/10.jpg" },
  { name: "Muhammad Shahid Abdul Rasheed", designation: "Member", contact: "0321-3863533", photo: "/Presidency/JWMJ/11.jpeg" },
  { name: "Muhammad Imran Patel", designation: "Member", contact: "0321-9274868", photo: "/Presidency/JWMJ/12.jpg" },
  { name: "Abdul Sami Ahmed Surmawala", designation: "Member", contact: "0321-9246168", photo: "/Presidency/JWMJ/13.jpg" },
  { name: "Abdul Samad Dochki", designation: "Member", contact: "0333-3024651", photo: "/Presidency/JWMJ/14.jpg" },
  { name: "Adnan Muhammad Yaqoob", designation: "Member", contact: "0321-2193920", photo: "/Presidency/JWMJ/15.jpg" },
  { name: "Muhammad Imran Suleman", designation: "Member", contact: "0321-3787616", photo: "/Presidency/JWMJ/16.jpeg" },
  { name: "Obaidullah Durvesh", designation: "Member", contact: "0321-9235725", photo: "/Presidency/JWMJ/17.png" },
  { name: "Salman Muhammad Saleem", designation: "Member", contact: "0321-8263000", photo: "/Presidency/JWMJ/18.jpg" },
  { name: "Muhammad Ubaid Rehmani", designation: "Member", contact: "0322-2188688", photo: "/Presidency/JWMJ/19.jpeg" },
  { name: "Haji Muhammad Ibrahim", designation: "Member", contact: "0321-8226608", photo: "/Presidency/JWMJ/20.jpg" },
  { name: "Maqsood Ahmed Dochki", designation: "Member", contact: "0300-8204877", photo: "/Presidency/JWMJ/21.jpeg" },
  { name: "Khurram Abdul Rasheed Bangi", designation: "Member", contact: "0321-9251917", photo: "/Presidency/JWMJ/22.jpg" },
  { name: "Abdul Samad Jamal", designation: "Member", contact: "0300-2662701", photo: "/Presidency/JWMJ/23.jpeg" },
  { name: "Uzair Munawar", designation: "Member", contact: "0321-2918197", photo: "/Presidency/JWMJ/24.jpeg" },
  { name: "Saqib Yousuf Rangoonwala", designation: "Member", contact: "0321-8247615", photo: "/Presidency/JWMJ/25.jpg" }
];

// Data structure for advisors
const advisors = [
  { name: "Abdul Nasir Rangoonwala", designation: "Advisor", contact: "0300-8277910", photo: "/Presidency/JWMJ/26.jpg" },
  { name: "Muhammad Saleem Durvesh", designation: "Advisor", contact: "0321-8276693", photo: "/Presidency/JWMJ/27.jpeg" },
  { name: "Hafiz Muhammad Ilyas", designation: "Advisor", contact: "0300-9283144", photo: "/Presidency/JWMJ/28.jpg" },
  { name: "Muhammad Asif Patel", designation: "Advisor", contact: "0300-8257225", photo: "/Presidency/JWMJ/29.jpg" },
  { name: "Abdul Rahim Kamdar", designation: "Advisor", contact: "0321-8208878", photo: "/Presidency/JWMJ/30.jpeg" },
  { name: "Abdul Rauf Rangoonwala", designation: "Advisor", contact: "0300-8237805", photo: "/Presidency/JWMJ/31.jpg" }
];

// Flip Card Component
const FlipCard = ({ member, isPresident = false, yellow = false }: FlipCardProps & { yellow?: boolean }) => {
  return (
    <div className="group w-full h-64 [perspective:1000px]">
      <div className="relative w-full h-full duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front of card */}
        <div className={"absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-xl shadow-lg border p-4 flex flex-col justify-center items-center text-center bg-gradient-to-br from-white to-gray-50 border-gray-200"}>
          <div className="w-24 h-24 rounded-lg overflow-hidden border-4 mb-3 shadow-md border-gray-200">
            <Image
              src={member.photo || "https://placehold.co/96x96/e0e0e0/666?text=Photo"}
              alt={member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">
            {member.name}
          </h3>
          <p className={`text-sm font-medium ${isPresident ? (yellow ? 'text-yellow-700' : 'text-[#038DCD]') : 'text-gray-600'} mb-2`}>
            {member.designation}
          </p>
          <div className="mt-2 text-xs flex items-center gap-1 text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Hover for contact
          </div>
        </div>

        {/* Back of card */}
        <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl shadow-lg p-4 flex flex-col justify-center items-center text-center text-white ${yellow ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-[#038DCD] to-blue-700'}`}>
          <h4 className="font-bold text-lg mb-2 text-white">{member.name}</h4>
          <p className="text-blue-100 text-sm mb-4">{member.designation}</p>
          {/* Phone Number Display */}
          <div className="bg-white/20 px-4 py-3 rounded-lg mb-3 w-full max-w-[200px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-semibold text-white">Contact</span>
            </div>
            <p className="text-white font-mono text-lg">{member.contact}</p>
          </div>
          {/* Action Buttons */}
          <div className="space-y-2 w-full max-w-[200px]">
            <a
              href={`https://wa.me/92${member.contact.substring(1)}`}
              className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full text-white"
            >
              💬 WhatsApp
            </a>
          </div>
          <div className={`text-xs mt-3 opacity-80 ${yellow ? 'text-yellow-100' : 'text-blue-100'}`}>
            {isPresident ? (yellow ? "JWMYO President 2024-2026" : "JWMJ President 2024-2026") : "Committee Member"}
          </div>
        </div>
      </div>
    </div>
  );
}

// JWMYO Data
const jwmyoOfficeBearers: Member[] = [
  { name: "Uzair Munawar", designation: "President", contact: "0321-2918197", photo: "/Presidency/JWMYO/1.png" },
  { name: "Muhammad Umer Durvesh", designation: "Senior Vice President", contact: "0300-2010940", photo: "/Presidency/JWMYO/2.png" },
  { name: "Mohammad Arif Patel", designation: "Vice President", contact: "0321-2256579", photo: "/Presidency/JWMYO/3.png" },
  { name: "Saqib Yousuf Rangoonwala", designation: "General Secretary", contact: "0321-8247615", photo: "/Presidency/JWMYO/4.png" },
  { name: "Qaiser Ahmed Rangoonwala", designation: "Senior Joint Secretary", contact: "0321-2391660", photo: "/Presidency/JWMYO/5.jpg" },
  { name: "Shamoon Siddiq", designation: "Joint Secretary", contact: "0322-2281344", photo: "/Presidency/JWMYO/6.jpeg" },
  { name: "Abdul Samad Durvesh", designation: "Finance Secretary", contact: "0334-3931592", photo: "/Presidency/JWMYO/7.jpg" },
  { name: "Arsalan Abdullah", designation: "Press Secretary", contact: "0300-2590194", photo: "/Presidency/JWMYO/8.jpeg" },
];

const jwmyoManagingCommittee: Member[] = [
  { name: "Sanan Ilyas", designation: "Member", contact: "0344-2560203", photo: "/Presidency/JWMYO/9.jpeg" },
  { name: "Muhammad Hassan Wehvaria", designation: "Member", contact: "0331-3660330", photo: "/Presidency/JWMYO/10.jpeg" },
  { name: "Adnan Amin", designation: "Member", contact: "0323-3236828", photo: "/Presidency/JWMYO/11.jpeg" },
  { name: "Muhammad Owais Dinga", designation: "Member", contact: "0307-0203484", photo: "/Presidency/JWMYO/12.jpg" },
  { name: "Imran Hussain", designation: "Member", contact: "0333-0394690", photo: "/Presidency/JWMYO/13.jpg" },
  { name: "Muhammad Anas Rangoonwala", designation: "Member", contact: "0317-1186611", photo: "/Presidency/JWMYO/14.jpg" },
  { name: "Muhammad Hammad Rangoonwala", designation: "Member", contact: "0309-8886403", photo: "/Presidency/JWMYO/15.png" },
  { name: "Muhammad Faiq Imran", designation: "Member", contact: "0323-2850941", photo: "/Presidency/JWMYO/16.jpeg" },
  { name: "Muhammad Ahmed Patel", designation: "Member", contact: "0303-2701674", photo: "/Presidency/JWMYO/17.jpg" },
  { name: "Shayan Saleem", designation: "Member", contact: "0307-2884984", photo: "/Presidency/JWMYO/18.jpg" },
  { name: "Usama Kamdar", designation: "Member", contact: "0312-2464924", photo: "/Presidency/JWMYO/19.jpeg" },
  { name: "Rabi Ibrahim", designation: "Member", contact: "0324-2112122", photo: "/Presidency/JWMYO/20.jpeg" },
  { name: "Hammad Ibrahim", designation: "Member", contact: "0324-2111998", photo: "/Presidency/JWMYO/21.jpg" },
  { name: "Umair Amin Nakhuda", designation: "Member", contact: "0315-2053998", photo: "/Presidency/JWMYO/22.jpg" },
  { name: "Muhammad Memon", designation: "Member", contact: "0322-2100279", photo: "/Presidency/JWMYO/23.jpg" },
  { name: "Anfal Dadabhai", designation: "Member", contact: "0332-2170332", photo: "/Presidency/JWMYO/24.jpg" },
  { name: "Abubakar Nakhuda", designation: "Member", contact: "0336-2307281", photo: "/Presidency/JWMYO/25.jpg" },
  { name: "Uzair Yaqoob", designation: "Member", contact: "0343-2558633", photo: "/Presidency/JWMYO/26.jpg" },
  { name: "Safwan Abdul Samad", designation: "Member", contact: "0334-2105667", photo: "/Presidency/JWMYO/27.jpeg" },
  { name: "Raza Imran Bharambia", designation: "Member", contact: "0325-8986899", photo: "/Presidency/JWMYO/28.jpeg" },
  { name: "Emaaz Durvesh", designation: "Member", contact: "0307-0035584", photo: "/Presidency/JWMYO/29.jpeg" },
  { name: "Ahmed Abdul Sami", designation: "Member", contact: "0302-1251625", photo: "/Presidency/JWMYO/30.jpg" },
  { name: "Ahnaf Durvesh", designation: "Member", contact: "0304-1159066", photo: "/Presidency/JWMYO/31.jpg" },
  { name: "Hasin Munawar", designation: "Member", contact: "0317-2151401", photo: "/Presidency/JWMYO/32.jpeg" },
  { name: "Fayyaz Faisal", designation: "Member", contact: "0343-2560292", photo: "/Presidency/JWMYO/33.jpeg" },
];

const jwmyoAdvisors: Member[] = [
  { name: "Abdul Samad Dochki", designation: "Advisor", contact: "0333-3024651", photo: "/Presidency/JWMYO/34.jpg" },
  { name: "Haris Rangoonwala", designation: "Advisor", contact: "0321-8226754", photo: "/Presidency/JWMYO/35.jpg" },
  { name: "Tahir Rangoonwala", designation: "Advisor", contact: "0321-8833332", photo: "/Presidency/JWMYO/36.jpg" },
  { name: "Abdul Samad Jamal", designation: "Advisor", contact: "0300-2662701", photo: "/Presidency/JWMYO/37.jpeg" },
  { name: "Urwah Zubair", designation: "Advisor", contact: "0321-2610204", photo: "/Presidency/JWMYO/38.jpg" },
  { name: "Uzair Hussain", designation: "Advisor", contact: "0320-2559784", photo: "/Presidency/JWMYO/39.jpeg" },
];

export default function AboutPage() {
  const president = officeBearers[0]; // First office bearer is the president

  return (
    <div className="bg-white mb-10 mx-10 justify-items-center">
      {/* Hero Section */}
      <section className="max-w-7xl w-full p-16 grid md:grid-cols-2 gap-8 items-start bg-jwmj rounded-2xl pb-30">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-black">
            Presidency
          </h1>
          <h2 className="mt-6 text-gray-600 text-lg md:text-xl font-bold">
            {president.name}
          </h2>
          <h3 className="mt-6 text-gray-600 text-lg md:text-xl">
            {president.designation} - JWMJ<br />2024-2026
          </h3>
        </div>

        {/* Right Side Card */}
        <div className="bg-white border border-zinc-400 rounded-[40px] w-80 h-fit flex justify-center justify-self-center">
          <Image
            src={president.photo || "https://placehold.co/200x200/e0e0e0/666?text=Photo"}
            alt="President"
            width={200}
            height={200}
            className="rounded-xl object-cover justify-self-center"
          />
        </div>
      </section>
      <br />

      {/* President's Message */}
      <section className="max-w-5xl w-60pc mx-auto bg-white/60 rounded-2xl shadow-md border border-[#038DCD]/10 p-8 mb-10 -mt-30">
        <h2 className="text-[#038DCD] font-bold text-2xl mb-6">President&apos;s Message</h2>
        <p className="text-gray-700 leading-relaxed text-lg mb-2">
          As the President of Jamnagar Wehvaria Memon Jamat, I am very thankful to Almighty Allah for giving me and my team the opportunity to serve the members of Jamat.<br />
          Alhamdulillah our team is the first team of Jamat which has been selected to serve Jamat through elections with the help and cooperation of the members of Jamat and I and my entire team are very grateful to all the members of Jamat for this cooperation and belief.<br /><br />

          Our first priority in serving the members of the Jamat is to educate the children and youth of the Jamat and at the same time make them skilled and aware according to the present times so that our future generations can benefit from it.<br />
          Along with education, we are trying to provide maximum employment opportunities to our members so that unemployment can be eliminated from Jamat and in this regard, work has been started to provide interest free business loans to the members on easy installments.<br />
          Efforts are also being made to improve the medical treatment, monthly helps, housing, marriage and other matters of the members of Jamat.<br /><br />

          The current team will soon issue a health card for all the members of Jamat which will be used by members at any time as per their need.<br />
          At the same time, for the first time in the Jamat, a 24/7 Committee has been formed to serve the members through which the members of the Jamat can contact the representatives of committee in case of any sudden trouble and inform them about their medical, burial or any legal issue and InShaAllah every effort will be made by the committee to resolve the grievances of the members as soon as possible.<br /><br />

          In the end, we will try our best to promote the atmosphere of brotherhood and fraternity in the congregation.<br />
          Poverty should be eradicated from the Jamat and all members should be made independent and we need full support and cooperation of our members for this noble cause.<br /><br />

          <span className="font-semibold">{president.name}</span><br />
          {president.designation}<br />
          Jamnagar Wehvaria Memon Jamat
        </p>
      </section>

      {/* Office Bearers Section */}
      <section className="max-w-7xl w-full mb-12">
        <h2 className="text-[#038DCD] font-bold text-3xl mb-8 text-center">Office Bearers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {officeBearers.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard
                member={member}
                isPresident={member.designation === "President"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Managing Committee Section */}
      <section className="max-w-7xl w-full mb-12">
        <h2 className="text-[#038DCD] font-bold text-3xl mb-8 text-center">Members Managing Committee</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {managingCommittee.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard member={member} />
            </div>
          ))}
        </div>
      </section>

      {/* Advisors Section */}
      <section className="max-w-7xl w-full mb-12">
        <h2 className="text-[#038DCD] font-bold text-3xl mb-8 text-center">Advisors</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {advisors.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard member={member} />
            </div>
          ))}
        </div>
      </section>

      {/* JWMYO Section */}
      <section className="max-w-7xl w-full mb-12">
        <h2 className="text-yellow-600 font-bold text-4xl mb-8 text-center">JWMYO</h2>

        {/* JWMYO Office Bearers */}
        <h3 className="text-yellow-600 font-bold text-2xl mb-6 text-center">Office Bearers</h3>
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {jwmyoOfficeBearers.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard member={member} isPresident={member.designation === "President"} yellow />
            </div>
          ))}
        </div>

        {/* JWMYO Managing Committee */}
        <h3 className="text-yellow-600 font-bold text-2xl mb-6 text-center">Members Managing Committee</h3>
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {jwmyoManagingCommittee.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard member={member} yellow />
            </div>
          ))}
        </div>

        {/* JWMYO Advisors */}
        <h3 className="text-yellow-600 font-bold text-2xl mb-6 text-center">Advisors</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {jwmyoAdvisors.map((member, index) => (
            <div key={index} className="w-full sm:w-72 md:w-64 lg:w-72">
              <FlipCard member={member} yellow />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}