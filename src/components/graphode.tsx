import Image from "next/image";

export default function Graphode() {
    return (
        <div className="w-full h-10 bg-blue-950 flex items-center justify-center gap-2">
            <Image
                src="/graphode-logo.png"
                alt="Graphode Logo"
                width={30}
                height={13}
            />
            <p className="text-center text-white text-sm py-2">
                Powered by Graphode
            </p>
        </div>
    );
};