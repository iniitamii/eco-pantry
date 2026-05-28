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
        
        /* Base Reset */
        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'DM Sans', sans-serif; background: #F5F0E8; color: #292524; line-height: 1.6; overflow-x: hidden; }
        
        /* Typography */
        .font-serif { font-family: 'Lora', serif; }
        .hero-title { font-size: 52px; line-height: 1.15; margin-bottom: 20px; }
        .hero-desc { font-size: 17px; color: #57534E; line-height: 1.7; margin-bottom: 32px; max-width: 460px; }
        .section-title { font-size: 38px; margin-bottom: 16px; line-height: 1.25; }
        .card-title { font-size: 18px; margin-bottom: 8px; }
        .card-desc { font-size: 14px; color: #57534E; line-height: 1.65; }
        
        /* Layout & Grids */
        .section-container { max-width: 1100px; margin: 0 auto; padding: 80px 24px; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 80px 24px 60px; max-width: 1100px; margin: 0 auto; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        
        /* Components */
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .hero-mockup { display: block; background: #fff; border-radius: 24px; border: 1px solid #E7E5E4; padding: 24px; box-shadow: 0 4px 40px rgba(0,0,0,0.06); }
        .btn-group { display: flex; items-center; gap: 16px; flex-wrap: wrap; }
        .btn-primary { background: #2D6A4F; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; transition: background 0.2s; }
        .btn-primary:hover { background: #1B4332; }
        .btn-secondary { background: #fff; color: #57534E; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; border: 1px solid #E7E5E4; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; transition: background 0.2s; }
        .btn-secondary:hover { background: #F5F5F4; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .section-container { padding: 56px 20px; }
          
          /* Hero Adjustments */
          .hero-grid { grid-template-columns: 1fr; gap: 40px; padding: 48px 20px 40px; text-align: center; }
          .hero-desc { margin: 0 auto 32px; }
          .hero-title { font-size: 38px; line-height: 1.2; }
          .hero-mockup { display: none; } /* Hidden on mobile to save space */
          .btn-group { flex-direction: column; width: 100%; gap: 12px; }
          .btn-primary, .btn-secondary { width: 100%; }
          .hero-badges { justify-content: center; }
          
          /* Grid Collapses */
          .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 24px 16px; }
          .grid-3 { grid-template-columns: 1fr; gap: 16px; }
          
          /* Typography Scaling */
          .section-title { font-size: 32px; }
          
          /* Nav & Footer */
          .nav-links { display: none; }
          .footer-inner { flex-direction: column; gap: 16px; text-align: center; }
        }
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
            <div className="font-serif" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 600 }}>
              🌿 EcoPantry
            </div>
            <div className="nav-links">
              <a href="#features" style={{ fontSize: 14, color: "#57534E", fontWeight: 500, textDecoration: "none" }}>Features</a>
              <a href="#how-it-works" style={{ fontSize: 14, color: "#57534E", fontWeight: 500, textDecoration: "none" }}>How it works</a>
              <a href="#problem" style={{ fontSize: 14, color: "#57534E", fontWeight: 500, textDecoration: "none" }}>Why it matters</a>
            </div>
            <Link href="/login" style={{
              background: "#2D6A4F", color: "#fff", fontSize: 13, fontWeight: 600,
              padding: "8px 20px", borderRadius: 10, textDecoration: "none"
            }}>
              Get started →
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero-grid">
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#D8F3DC", color: "#2D6A4F",
              fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100,
              marginBottom: 24, letterSpacing: "0.02em",
            }}>
              🌱 Sustainable food management
            </div>
            <h1 className="hero-title font-serif">
              Stop wasting food.<br />
              <span style={{ color: "#2D6A4F" }}>Start living smarter.</span>
            </h1>
            <p className="hero-desc">
              EcoPantry helps you track what's in your pantry, plan meals around expiring items, donate surplus food, and measure your environmental impact — all in one place.
            </p>
            <div className="btn-group">
              <Link href="/login" className="btn-primary">
                Start for free →
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>
            <div className="hero-badges" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, fontSize: 13, color: "#A8A29E" }}>
              <span style={{ color: "#2D6A4F", fontWeight: 600 }}>✓ Free to use</span> · No credit card
            </div>
          </div>

          {/* Mockup (Hidden on Mobile) */}
          <div className="hero-mockup">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div className="font-serif" style={{ fontSize: 18 }}>Good morning, Tami.</div>
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
                  <div className="font-serif" style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
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
        <div style={{ background: "#292524", padding: "40px 24px" }}>
          <div className="grid-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
            {[
              { value: "1/3", label: "of all food produced globally is wasted" },
              { value: "$1T+", label: "in economic losses from food waste annually" },
              { value: "8%", label: "of global greenhouse gas emissions" },
              { value: "Free", label: "EcoPantry is completely free to use — always" },
            ].map(({ value, label }) => (
              <div key={value}>
                <div className="font-serif" style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Problem ── */}
        <section id="problem" className="section-container">
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2D6A4F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>The problem</div>
          <h2 className="section-title font-serif">Food waste starts at home</h2>
          <p className="card-desc" style={{ maxWidth: 520, marginBottom: 48, fontSize: 16 }}>
            Most household food waste happens because we lose track of what we have, forget expiry dates, or overbuy. EcoPantry fixes this.
          </p>
          <div className="grid-3">
            {[
              { stat: "$1,500", title: "Per household, per year", desc: "The average family throws away up to $1,500 worth of food annually — money that could stay in your pocket." },
              { stat: "40%", title: "Of food never gets eaten", desc: "Nearly 40% of food in developed countries is discarded at the consumer level — most of it perfectly edible." },
              { stat: "10min", title: "To set up your pantry", desc: "It takes less than 10 minutes to add your items. After that, smart alerts and AI meal planning do the work." },
            ].map(({ stat, title, desc }) => (
              <div key={stat} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E7E5E4" }}>
                <div className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: "#C2410C", marginBottom: 8 }}>{stat}</div>
                <h3 className="card-title font-serif">{title}</h3>
                <p className="card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="section-container" style={{ paddingTop: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2D6A4F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Features</div>
          <h2 className="section-title font-serif">Everything your pantry needs</h2>
          <p className="card-desc" style={{ maxWidth: 520, marginBottom: 48, fontSize: 16 }}>
            From expiry tracking to AI meal planning, EcoPantry covers the full journey from buying food to reducing waste.
          </p>
          <div className="grid-3">
            {[
              { icon: "📦", title: "Smart inventory tracking", desc: "Add items with expiry dates, quantities, and categories. Get color-coded alerts before things go bad." },
              { icon: "✨", title: "AI meal planner", desc: "Gemini AI analyses your pantry and suggests meals that use up the items closest to expiry." },
              { icon: "🤝", title: "Community donations", desc: "List surplus food for donation and let neighbours claim it before it expires. Build a sharing community." },
              { icon: "📊", title: "Impact analytics", desc: "Track your save rate, waste rate, and top food categories over time. See your real contribution." },
              { icon: "🔔", title: "Smart notifications", desc: "Configurable expiry alerts — set your own threshold from 1 to 14 days. Get notified instantly." },
              { icon: "⚙️", title: "Personalised settings", desc: "Control your notification preferences, donation visibility, and alert thresholds easily." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #E7E5E4" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#D8F3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p className="card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <div id="how-it-works" style={{ background: "#292524" }}>
          <div className="section-container">
            <div style={{ fontSize: 12, fontWeight: 600, color: "#D8F3DC", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
            <h2 className="section-title font-serif" style={{ color: "#fff" }}>Three steps to zero waste</h2>
            <p className="card-desc" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 520, marginBottom: 48, fontSize: 16 }}>
              EcoPantry is designed to be simple enough to use daily, and smart enough to make a real difference.
            </p>
            <div className="grid-3">
              {[
                { num: "01", icon: "📝", title: "Add your items", desc: "Manually add food items with their expiry dates, quantities, and storage locations. Takes seconds per item." },
                { num: "02", icon: "🍳", title: "Get smart suggestions", desc: "Our AI chef reviews your pantry and suggests meals that use up expiring items first." },
                { num: "03", icon: "🌍", title: "Track your impact", desc: "Watch your waste rate drop and your save rate climb. Share surplus food with neighbours." },
              ].map(({ num, icon, title, desc }) => (
                <div key={num} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: "#D8F3DC", marginBottom: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(64,145,108,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {num}
                  </div>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)", textAlign: "center" }}>
          <div className="section-container" style={{ maxWidth: 600 }}>
            <h2 className="section-title font-serif" style={{ color: "#fff" }}>
              Ready to reduce your food waste?
            </h2>
            <p className="card-desc" style={{ color: "rgba(255,255,255,0.8)", marginBottom: 32, fontSize: 16 }}>
              Join EcoPantry today and start making a difference — for your wallet, your community, and the planet.
            </p>
            <Link href="/login" style={{
              background: "#fff", color: "#2D6A4F", fontSize: 15, fontWeight: 700,
              padding: "14px 36px", borderRadius: 14, display: "inline-block", textDecoration: "none"
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
          <div className="footer-inner" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="font-serif" style={{ fontSize: 16, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
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