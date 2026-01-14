export default function AboutPage() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-[#f4faff] via-[#fdfaf5] to-[#fefaf5] pb-20">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto mt-10 mb-12 relative">
        <div className="flex items-center rounded-3xl border border-slate-300 shadow-sm bg-gradient-to-r from-[#fef9e7] to-[#e6f7fb] px-10 py-6 relative">
          {/* Translucent Pill Overlap */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-sky-400/70 px-10 py-4 rounded-3xl font-extrabold text-yellow-300 text-3xl shadow-md border border-slate-30">
            JWMYO
          </div>
          {/* Full Name */}
          <h1 className="ml-28 text-xl md:text-2xl font-bold text-sky-600 pl-10">
            Jamnagar Wehvaria Memon Youth Organization
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto mb-16 px-4 md:px-0">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-700 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
          pulvinar ipsum. Quisque finibus rhoncus lectus eget sollicitudin. Cras
          in maximus nibh. Fusce bibendum lorem neque, at congue magna eleifend
          sed. Nullam rhoncus ipsum nec magna molestie, ut tincidunt ipsum
          volutpat. Quisque sit amet dapibus elit...
        </p>
      </section>

      {/* History Section */}
      <section className="max-w-6xl mx-auto rounded-2xl border border-slate-200 shadow-md bg-gradient-to-tr from-[#fffde7] to-[#e0f7fa] p-8">
        <h2 className="text-2xl font-bold mb-4">History</h2>
        <p className="text-gray-700 leading-relaxed mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
          pulvinar ipsum. Quisque finibus rhoncus lectus eget sollicitudin.
          Cras in maximus nibh. Fusce bibendum lorem neque, at congue magna
          eleifend sed...
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-center mb-4">
              Ex-Presidents
            </h3>
            <p className="text-gray-600 text-center">
              (List or profiles of ex-presidents go here)
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-center mb-4">
              Ex-General Secretary
            </h3>
            <p className="text-gray-600 text-center">
              (List or profiles of ex-general secretaries go here)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
