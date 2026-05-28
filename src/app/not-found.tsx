import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div
        className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-sm border border-stone-100 mb-6">
            <span className="text-4xl">🌿</span>
          </div>

          <h1
            style={{ fontFamily: "'Lora', serif" }}
            className="text-4xl font-semibold text-stone-800 mb-2"
          >
            404
          </h1>
          <p className="text-stone-500 text-sm mb-6">
            Looks like this page composted itself. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Go to Pantry
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}