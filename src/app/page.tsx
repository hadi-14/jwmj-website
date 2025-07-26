import Image from "next/image";

export default function Home() {
  return (
    <main className="w-full z-5">
      {/* The Top Section */}
      <div className="flex justify-center">
        <Image
          src="/Union.png"
          alt="Union"
          width={3.5 * 770 / 5}
          height={3.5 * 695 / 5}
          className="absolute left-1/3 transform -translate-x-1/2 -mt-11"
        />
        <div className="absolute left-1/3 transform -translate-x-1/2 -p6 mt-35">
          <div className="bg-primary-yellow-400 rounded-lg shadow-lg w-122">
            <h1 className="text-4xl font-extrabold text-primary-black p-4 pb-0">
              “Together in service
              <br />for a better Tomorrow”
            </h1>
            <p className="text-primary-black font-bold p-4 pt-0">
              Jamnagar Wehvaria Memon Jamat
            </p>
          </div>
        </div>
        <div className="absolute left-1/3 transform -translate-x-1/2 -p6 mt-75 pl-100">
          <button className="bg-primary-blue rounded-tl-2xl rounded-br-2xl shadow-lg w-75 h-17 text-2xl font-bold text-primary-black hover:bg-primary-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-xl">
            BECOME A MEMBER
          </button>
        </div>

        <div className="w-full bg-primary-green-500 h-110">
          <div className="flex h-105">
            <Image
              src="/cotton.png"
              alt="Cotton"
              width={300}
              height={300}
              className="w-1/3 h-auto object-cover"
            />
            <Image
              src="/building_front.jpeg"
              alt="Building Front"
              width={1280}
              height={555}
              className="w-2/3 h-auto"
            />
          </div>

          <div className="w-full h-5 bg-primary-green-700">
            <div className="w-full h-2 bg-primary-green-900">
            </div>
          </div>

        </div>
      </div>

    <div className="w-full h-screen">

    </div>

    </main>
  );
}
