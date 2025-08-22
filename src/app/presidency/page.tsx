'use client';
import Image from 'next/image';

// Type definitions
interface Member {
  name: string;
  designation: string;
  contact: string;
}

interface FlipCardProps {
  member: Member;
  isPresident?: boolean;
}

// Data structure for office bearers
const officeBearers = [
  { name: "Muhammad Yousuf Rangoonwala", designation: "President", contact: "0300-8223534" },
  { name: "Jawad Ahmed Farooq", designation: "Senior Vice President", contact: "0321-9215667" },
  { name: "Muhammad Asif Muhammad Ali", designation: "Vice President", contact: "0321-2027353" },
  { name: "Muhammad Imran Wehvaria", designation: "Honorary General Secretary", contact: "0321-9255899" },
  { name: "Mufti Muhammad Bilal Durvesh", designation: "Senior Joint Secretary", contact: "0321-2892532" },
  { name: "Shabbir Abdul Wahid", designation: "Joint Secretary", contact: "0322-2377366" },
  { name: "Shahzad Kamdar", designation: "Finance Secretary", contact: "0322-8667279" }
];

// Data structure for managing committee members
const managingCommittee = [
  { name: "Haji Ghulam Muhammad", designation: "Member", contact: "0320-9229221" },
  { name: "Abdul Majeed Rangoonwala", designation: "Member", contact: "0321-8203850" },
  { name: "Muhammad Saeed Mulla", designation: "Member", contact: "0321-8220996" },
  { name: "Muhammad Shahid Abdul Rasheed", designation: "Member", contact: "0321-3863533" },
  { name: "Muhammad Imran Patel", designation: "Member", contact: "0321-9274868" },
  { name: "Abdul Sami Ahmed Surmawala", designation: "Member", contact: "0321-9246168" },
  { name: "Abdul Samad Dochki", designation: "Member", contact: "0333-3024651" },
  { name: "Adnan Muhammad Yaqoob", designation: "Member", contact: "0321-2193920" },
  { name: "Muhammad Imran Suleman", designation: "Member", contact: "0321-3787616" },
  { name: "Obaidullah Durvesh", designation: "Member", contact: "0321-9235725" },
  { name: "Salman Muhammad Saleem", designation: "Member", contact: "0321-8263000" },
  { name: "Muhammad Ubaid Rehmani", designation: "Member", contact: "0322-2188688" },
  { name: "Haji Muhammad Ibrahim", designation: "Member", contact: "0321-8226608" },
  { name: "Maqsood Ahmed Dochki", designation: "Member", contact: "0300-8204877" },
  { name: "Khurram Abdul Rasheed Bangi", designation: "Member", contact: "0321-9251917" },
  { name: "Abdul Samad Jamal", designation: "Member", contact: "0300-2662701" },
  { name: "Uzair Munawar", designation: "Member", contact: "0321-2918197" },
  { name: "Saqib Yousuf Rangoonwala", designation: "Member", contact: "0321-8247615" }
];

// Data structure for advisors
const advisors = [
  { name: "Abdul Nasir Rangoonwala", designation: "Advisor", contact: "0300-8277910" },
  { name: "Muhammad Saleem Durvesh", designation: "Advisor", contact: "0321-8276693" },
  { name: "Hafiz Muhammad Ilyas", designation: "Advisor", contact: "0300-9283144" },
  { name: "Muhammad Asif Patel", designation: "Advisor", contact: "0300-8257225" },
  { name: "Abdul Rahim Kamdar", designation: "Advisor", contact: "0321-8208878" },
  { name: "Abdul Rauf Rangoonwala", designation: "Advisor", contact: "0300-8237805" }
];

// Flip Card Component
const FlipCard = ({ member, isPresident = false }: FlipCardProps) => {
  return (
    <div className="group w-full h-64 [perspective:1000px]">
      <div className="relative w-full h-full duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-gray-200 mb-3 shadow-md">
            <Image
              src="https://placehold.co/96x96/e0e0e0/666?text=Photo"
              alt={member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">
            {member.name}
          </h3>
          <p className={`text-sm font-medium ${isPresident ? 'text-[#038DCD]' : 'text-gray-600'} mb-2`}>
            {member.designation}
          </p>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Hover for contact
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#038DCD] to-blue-700 rounded-xl shadow-lg p-4 flex flex-col justify-center items-center text-center text-white">
          <div className="w-20 h-20 rounded-lg overflow-hidden border-3 border-white/30 mb-4">
            <Image
              src="https://placehold.co/80x80/ffffff/038DCD?text=Photo"
              alt={member.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          
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
              href={`tel:${member.contact}`} 
              className="bg-white/30 hover:bg-white/40 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full text-white border border-white/20"
            >
              📞 Call Now
            </a>
            
            <a 
              href={`https://wa.me/92${member.contact.substring(1)}`} 
              className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 w-full text-white"
            >
              💬 WhatsApp
            </a>
          </div>
          
          <div className="text-xs text-blue-100 mt-3 opacity-80">
            {isPresident ? "JWMJ President 2024-2026" : "Committee Member"}
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <div className="bg-neutral-50 opacity-40 border border-zinc-400 rounded-[40px] w-80 h-fit flex justify-center justify-self-center">
          <Image
            src="https://placehold.co/200x200/jpg"
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

    </div>
  );
}