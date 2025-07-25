import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <main className="flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to JWMJ!</h1>
        <p className="text-lg mb-8">This is a placeholder page for the JWMJ website.</p>
        <Image src="/logo.png" alt="Logo" width={200} height={200} className="mb-4" />
        <p className="text-center">
          This website is currently under construction. Please check back later for updates!
        </p>
      </main>
    </div>
  );
}
