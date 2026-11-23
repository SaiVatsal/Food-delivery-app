export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-[8px] border border-[#E8E8E8] bg-[#FFFFFF] p-8 shadow-sm">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E23744]/10 text-[#E23744] font-bold text-xl">
          FD
        </div>
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Food Delivery App</h1>
        <p className="mt-2 text-sm text-[#696969]">
          Next.js 16 App Router, Tailwind CSS v4, MongoDB Atlas & Leaflet
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <span className="inline-block rounded-[8px] bg-[#2E7D32]/10 py-1.5 px-3 text-xs font-semibold text-[#2E7D32]">
            Ready for API Routes & Customer Components
          </span>
        </div>
      </div>
    </main>
  );
}
