import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen pb-20">
      {/* Header Section */}
      <section className="max-w-6xl mx-auto rounded-3xl mt-10 mb-12 relative bg-jwmj-100">
        <div className="flex items-center rounded-3xl border border-slate-300 shadow-sm bg-jwmj px-10 py-6 relative">
          {/* Translucent Pill Overlap */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-sky-400/70 px-10 py-4 rounded-3xl font-extrabold text-yellow-300 text-3xl shadow-md border border-blue-300">
            JWMYO
          </div>
          {/* Full Name */}
          <h1 className="ml-28 text-xl md:text-2xl font-bold text-sky-600 pl-10">
            Jamnagar Wehvaria Memon Youth Organization
          </h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto mb-16 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Left side: heading + text */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Mission & Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              The primary aims of JWMYO are the development of youth with strong
              religious belief and positive approach towards the modern world,
              organization of a healthcare system to arrange blood donation camps
              and free of cost medical camps for the members of community to
              facilitate a healthy lifestyle. Providing the educational
              opportunities to the students in the community with an intention
              to promote and encourage the positive approach towards higher and
              professional qualifications in order to achieve better jobs and
              work opportunities in the market. Moreover, arranging extra
              curricular activities for the children of jamat to develop
              critical thinking, channelling the skills and building
              self-confidence for a bright future. Prize Distribution ceremony
              is held annually to appreciate the high achievers in academics in
              order to encourage all the students to perform better in their
              respective institutions. Also, career guidance and skill
              development programs are arranged time to time to provide
              appropriate advice by the successful professionals sharing their
              experiences in the areas of entrepreneurship and leadership to
              motivate the youth in the correct direction. Sports events are
              organized for the recreational and entertainment purpose for youth
              and to promote sports and physical activities in the community.
              Jamnagar Wehvaria Memon Youth Organisation works parallel to
              Jamnagar Wehvaria Memon Jamat for the welfare of community and
              contribute their highest efforts for building a healthy community.
            </p>
          </div>

          {/* Right side: logo with border box */}
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 shadow-md p-6">
            <Image
              src="/logo_jwmyo.jpg" // place this file in the public/ folder
              alt="JWMYO Logo"
              width={300}
              height={300}
              className="w-full h-full max-h-80 object-contain"
            />
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="max-w-6xl mx-auto rounded-3xl border border-slate-200 shadow-md bg-jwmj-500  p-8">
        <h2 className="text-2xl font-bold mb-4">History</h2>
        <p className="text-gray-700 leading-relaxed mb-8">
          The Jamnagar Wehvaria Memon Youth Organization is one of the esteemed
          social organization of the Memon communities serving since 1982 under
          the patronage of Jamnagar Wehvaria Memon Jamat.The strong foundation
          of Jamnagar Wehvaria Memon Youth Organization was laid by Mr. A.K
          Jamal, Mr. Abdul Nasir Rangoonwala, Mr Muhammad Saleem Durvesh, and Mr
          Muhammad Yousuf Rangoonwala under of leadership of then President of
          the Jamnagar Wehvaria Memon Jamat, Mr.Ahmed Abdul Ghaffar Rangoonwala.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-6">
            <h3 className="text-lg font-semibold text-center mb-4">
              Ex-Presidents
            </h3>
            <ul className="text-gray-600 text-left list-disc list-inside">
              <li>Mr. Abdul Karim Jamal</li>
              <li>Mr. Yousuf Surmawala</li>
              <li>Mr. Muhammad Ali Wehvaria</li>
              <li>Mr. Muhammad Saleem Ahmed Durvesh</li>
              <li>Mr. Muhammad Asif Muhammad Arif</li>
              <li>Mr. Mansoor Jamal Wehvaria</li>
              <li>Mr. Faisal Abdul Baqi</li>
              <li>Mr. Abdul Majeed Rangoonwala</li>
              <li>Mr. Muhammad Imran Suleman</li>
              <li>Mr. Faisal Abdul Baqi</li>
              <li>Mr. Muhammad Imran Wehvaria</li>
              <li>Mr. Muhammad Asif M. Ali</li>
              <li>Mr. Haris Rangoonwala</li>
              <li>Mr. Adnan Yaqoob</li>
              <li>Mr. Salman Saleem</li>
              <li>Mr. Muhammad Fayyaz Rangoonwala</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/70 p-6">
            <h3 className="text-lg font-semibold text-center mb-4">
              Ex-General Secretary
            </h3>
            <ul className="text-gray-600 text-left list-disc list-inside">
              <li>Mr. Abdul Nasir Rangoonwala</li>
              <li>Mr. Faisal Abdul Baqi</li>
              <li>Mr. Muhammad Saleem Ahmed Durvesh</li>
              <li>Mr. Muhammad Imran Suleman</li>
              <li>Mr. A Hannan Saleem Golden</li>
              <li>Mr. Muhammad Imran Wehvaria</li>
              <li>Mr. A Hannan Saleem Golden</li>
              <li>Mr. Muhammad Asif Muhammad Ali</li>
              <li>Mr. Muhammad Imran Suleman Arif</li>
              <li>Mr. Haris Rangoonwala</li>
              <li>Mr. Adnan Yaqoob</li>
              <li>Mr. Salman Saleem</li>
              <li>Mr. Danish Ashraf</li>
              <li>Mr. Muhammad Umer Durvesh</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
