import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EcoPantry — Reduce Waste. Eat Smart. Live Sustainably.",
  description:
    "EcoPantry helps you track pantry items, plan meals around expiring food, donate surplus to your community, and measure your environmental impact.",
};

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'DM Sans', sans-serif; background: #F5F0E8; color: #292524; line-height: 1.6; }
      `}</style>

      <div className="landing">

        {/* ── Navbar ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(245,240,232,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E7E5E4",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600 }}>
              🌿 EcoPantry
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <a href="#features" style={{ fontSize: 14, color: "#57534E", fontWeight: 500 }}>Features</a>
              <a href="#how-it-works" style={{ fontSize: 14, color: "#57534E", fontWeight: 500 }}>How it works</a>
              <a href="#problem" style={{ fontSize: 14, color: "#57534E", fontWeight: 500 }}>Why it matters</a>
            </div>
            <Link href="/login" style={{
              background: "#2D6A4F", color: "#fff", fontSize: 13, fontWeight: 600,
              padding: "8px 20px", borderRadius: 10,
            }}>
              Get started free →
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#D8F3DC", color: "#2D6A4F",
              fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100,
              marginBottom: 24, letterSpacing: "0.02em",
            }}>
              🌱 Sustainable food management
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 52, lineHeight: 1.15, marginBottom: 20 }}>
              Stop wasting food.<br />
              <span style={{ color: "#2D6A4F" }}>Start living smarter.</span>
            </h1>
            <p style={{ fontSize: 17, color: "#57534E", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              EcoPantry helps you track what's in your pantry, plan meals around expiring items, donate surplus food, and measure your environmental impact — all in one place.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/login" style={{
                background: "#2D6A4F", color: "#fff", fontSize: 14, fontWeight: 600,
                padding: "12px 28px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                Start for free →
              </Link>
              <a href="#how-it-works" style={{
                background: "#fff", color: "#57534E", fontSize: 14, fontWeight: 600,
                padding: "12px 28px", borderRadius: 12, border: "1px solid #E7E5E4",
              }}>
                See how it works
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, fontSize: 13, color: "#A8A29E" }}>
              <span style={{ color: "#2D6A4F", fontWeight: 600 }}>✓ Free to use</span> · No credit card required · Built for sustainability
            </div>
          </div>

          {/* Mockup */}
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E7E5E4", padding: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 18 }}>Good morning, Tami.</div>
                <div style={{ fontSize: 12, color: "#A8A29E", marginTop: 2 }}>3 items expiring this week — use them up!</div>
              </div>
              <span style={{ fontSize: 20 }}>🔔</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total", value: "12", bg: "#F5F0E8", color: "#292524" },
                { label: "Expiring", value: "3", bg: "#FFF7ED", color: "#C2410C" },
                { label: "Expired", value: "1", bg: "#FFF1F2", color: "#E11D48" },
                { label: "Fresh", value: "8", bg: "#F0FDF4", color: "#2D6A4F" },
              ].map(({ label, value, bg, color }) => (
                <div key={label} style={{ padding: 14, borderRadius: 14, background: bg, border: "1px solid #E7E5E4" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { emoji: "🥛", name: "Organic Milk", meta: "1 L · Fridge", badge: "⚠ 1d left", badgeBg: "#FFF7ED", badgeColor: "#C2410C", badgeBorder: "#FED7AA" },
                { emoji: "🥦", name: "Broccoli", meta: "2 pcs · Fridge", badge: "3d left", badgeBg: "#FEFCE8", badgeColor: "#A16207", badgeBorder: "#FEF08A" },
                { emoji: "🍞", name: "Sourdough Bread", meta: "1 loaf · Pantry", badge: "🤝 Listed", badgeBg: "#F5F3FF", badgeColor: "#7C3AED", badgeBorder: "#DDD6FE" },
                { emoji: "🌾", name: "Brown Rice", meta: "2 kg · Cupboard", badge: "Fresh", badgeBg: "#F0FDF4", badgeColor: "#2D6A4F", badgeBorder: "#D8F3DC" },
              ].map(({ emoji, name, meta, badge, badgeBg, badgeColor, badgeBorder }) => (
                <div key={name} style={{ background: "#F5F5F4", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #E7E5E4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#A8A29E" }}>{meta}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}` }}>
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <div style={{ background: "#292524", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
            {[
              { value: "1/3", label: "of all food produced globally is wasted every year" },
              { value: "$1T+", label: "in economic losses from food waste annually" },
              { value: "8%", label: "of global greenhouse gas emissions from food waste" },
              { value: "Free", label: "EcoPantry is completely free to use — always" },
            ].map(({ value, label }) => (
              <div key={value}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Problem ── */}
        <section id="problem" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2D6A4F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>The problem</div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 38, marginBottom: 16, lineHeight: 1.25 }}>Food waste starts at home</h2>
          <p style={{ fontSize: 16, color: "#57534E", maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>
            Most household food waste happens because we lose track of what we have, forget expiry dates, or overbuy. EcoPantry fixes this.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              { stat: "$1,500", title: "Per household, per year", desc: "The average family throws away up to $1,500 worth of food annually — money that could stay in your pocket with better pantry management." },
              { stat: "40%", title: "Of food never gets eaten", desc: "Nearly 40% of food in developed countries is discarded at the consumer level — most of it perfectly edible and simply forgotten." },
              { stat: "10min", title: "To set up your pantry", desc: "It takes less than 10 minutes to add your items to EcoPantry. After that, smart alerts and AI meal planning do the work for you." },
            ].map(({ stat, title, desc }) => (
              <div key={stat} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E7E5E4" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 700, color: "#C2410C", marginBottom: 4 }}>{stat}</div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#57534E", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2D6A4F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Features</div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 38, marginBottom: 16, lineHeight: 1.25 }}>Everything your pantry needs</h2>
          <p style={{ fontSize: 16, color: "#57534E", maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>
            From expiry tracking to AI meal planning, EcoPantry covers the full journey from buying food to reducing waste.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { icon: "📦", title: "Smart inventory tracking", desc: "Add items with expiry dates, quantities, categories and storage locations. Get color-coded alerts before things go bad." },
              { icon: "✨", title: "AI meal planner", desc: "Gemini AI analyses your pantry and suggests meals that use up the items closest to expiry — reducing waste while inspiring cooking." },
              { icon: "🤝", title: "Community donations", desc: "List surplus food for donation and let neighbours claim it before it expires. Build a local food-sharing community." },
              { icon: "📊", title: "Impact analytics", desc: "Track your save rate, waste rate, and top food categories over time. See your real environmental contribution." },
              { icon: "🔔", title: "Smart notifications", desc: "Configurable expiry alerts — set your own threshold from 1 to 14 days. Get notified when donations are claimed or confirmed." },
              { icon: "⚙️", title: "Personalised settings", desc: "Control your notification preferences, donation visibility, and alert thresholds. EcoPantry works the way you want it to." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E7E5E4" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#D8F3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#57534E", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <div id="how-it-works" style={{ background: "#292524", padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#D8F3DC", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 38, color: "#fff", marginBottom: 16, lineHeight: 1.25 }}>Three steps to zero waste</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>
              EcoPantry is designed to be simple enough to use daily, and smart enough to make a real difference.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
              {[
                { num: "01", icon: "📝", title: "Add your items", desc: "Manually add food items with their expiry dates, quantities, and storage locations. Takes seconds per item." },
                { num: "02", icon: "🍳", title: "Get smart suggestions", desc: "Our AI chef reviews your pantry and suggests meals that use up expiring items first — so nothing goes to waste." },
                { num: "03", icon: "🌍", title: "Track your impact", desc: "Watch your waste rate drop and your save rate climb. Share surplus food with neighbours and see your community contribution grow." },
              ].map(({ num, icon, title, desc }) => (
                <div key={num} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 14, fontWeight: 600, color: "#D8F3DC", marginBottom: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(64,145,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {num}
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 40, color: "#fff", marginBottom: 16, lineHeight: 1.25 }}>
              Ready to reduce your food waste?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 32, lineHeight: 1.7 }}>
              Join EcoPantry today and start making a difference — for your wallet, your community, and the planet.
            </p>
            <Link href="/login" style={{
              background: "#fff", color: "#2D6A4F", fontSize: 15, fontWeight: 700,
              padding: "14px 36px", borderRadius: 14, display: "inline-block",
            }}>
              Create your free account →
            </Link>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 16 }}>
              Free forever · No credit card · Takes 2 minutes
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ background: "#292524", padding: "40px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              🌿 EcoPantry
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Built with 💚 to reduce food waste · © 2026 EcoPantry
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}