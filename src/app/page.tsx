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
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── Reset ── */
        html { scroll-behavior: smooth; }
        .landing *, .landing *::before, .landing *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'DM Sans', sans-serif; background: #F7F3EC; color: #1C1917; line-height: 1.6; overflow-x: hidden; }
        .landing a { text-decoration: none; }

        /* ── Tokens ── */
        :root {
          --green-900: #1B4332;
          --green-800: #2D6A4F;
          --green-700: #40916C;
          --green-100: #D8F3DC;
          --green-50:  #F0FDF4;
          --cream:     #F7F3EC;
          --cream-dark:#EDE8DF;
          --stone-900: #1C1917;
          --stone-800: #292524;
          --stone-600: #57534E;
          --stone-400: #A8A29E;
          --stone-200: #E7E5E4;
          --stone-100: #F5F5F4;
          --orange:    #C2410C;
        }

        /* ── Typography ── */
        .serif { font-family: 'Lora', serif; }
        .serif-italic { font-family: 'Lora', serif; font-style: italic; }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-1 { animation: fadeUp 0.7s ease both; }
        .anim-2 { animation: fadeUp 0.7s 0.1s ease both; }
        .anim-3 { animation: fadeUp 0.7s 0.2s ease both; }
        .anim-4 { animation: fadeUp 0.7s 0.3s ease both; }

        /* ── Nav ── */
        .nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(247, 243, 236, 0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          transition: box-shadow 0.3s;
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 32px;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: var(--green-900); }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-link { font-size: 14px; color: var(--stone-600); font-weight: 500; transition: color 0.2s; letter-spacing: 0.01em; }
        .nav-link:hover { color: var(--green-800); }
        .nav-cta {
          background: var(--green-800); color: #fff;
          font-size: 14px; font-weight: 600; padding: 10px 24px;
          border-radius: 10px; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(45,106,79,0.25);
        }
        .nav-cta:hover { background: var(--green-900); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(45,106,79,0.35); }

        /* ── Hero ── */
        .hero {
          max-width: 900px; margin: 0 auto;
          padding: 110px 32px 90px;
          text-align: center;
          position: relative;
        }
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(216,243,220,0.5) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid var(--stone-200);
          color: var(--green-800); font-size: 13px; font-weight: 600;
          padding: 8px 18px; border-radius: 100px; margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          letter-spacing: 0.01em;
        }
        .hero-pill-dot { width: 7px; height: 7px; background: var(--green-700); border-radius: 50%; }
        .hero-h1 {
          font-size: 66px; line-height: 1.08; letter-spacing: -0.03em;
          margin-bottom: 24px; color: var(--stone-900);
        }
        .hero-h1 em { font-style: italic; color: var(--green-800); font-weight: 500; }
        .hero-sub {
          font-size: 19px; color: var(--stone-600); line-height: 1.65;
          max-width: 560px; margin: 0 auto 40px;
        }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          background: var(--green-800); color: #fff;
          font-size: 15px; font-weight: 600; padding: 14px 32px;
          border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 4px 14px rgba(45,106,79,0.25);
        }
        .btn-primary:hover { background: var(--green-900); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(45,106,79,0.3); }
        .btn-ghost {
          background: transparent; color: var(--stone-600);
          font-size: 15px; font-weight: 500; padding: 14px 24px;
          border-radius: 12px; display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .btn-ghost:hover { color: var(--green-800); background: var(--green-50); }
        .hero-note { margin-top: 28px; font-size: 13px; color: var(--stone-400); display: flex; align-items: center; justify-content: center; gap: 16px; }
        .hero-note span { display: flex; align-items: center; gap: 5px; }
        .hero-note-check { color: var(--green-700); font-weight: 600; }

        /* ── Divider ── */
        .divider { height: 1px; background: linear-gradient(90deg, transparent, var(--stone-200) 20%, var(--stone-200) 80%, transparent); margin: 0 32px; }

        /* ── Stats ── */
        .stats-strip { background: var(--stone-900); padding: 64px 32px; }
        .stats-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .stat-item { padding: 32px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); }
        .stat-item:last-child { border-right: none; }
        .stat-val { font-size: 44px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 10px; letter-spacing: -0.02em; }
        .stat-lbl { font-size: 13px; color: var(--stone-400); line-height: 1.5; max-width: 140px; margin: 0 auto; }

        /* ── Section ── */
        .section { max-width: 1200px; margin: 0 auto; padding: 96px 32px; }
        .section-eyebrow {
          font-size: 12px; font-weight: 700; color: var(--green-800);
          letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-eyebrow::before { content: ''; width: 24px; height: 2px; background: var(--green-700); border-radius: 2px; display: inline-block; }
        .section-h2 { font-size: 44px; margin-bottom: 20px; line-height: 1.15; letter-spacing: -0.02em; color: var(--stone-900); }
        .section-sub { font-size: 17px; color: var(--stone-600); max-width: 520px; line-height: 1.7; margin-bottom: 56px; }

        /* ── Problem cards ── */
        .problem-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .problem-card { background: #fff; border-radius: 20px; padding: 36px 32px; border: 1px solid var(--stone-200); position: relative; overflow: hidden; }
        .problem-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--orange), #fb923c); border-radius: 20px 20px 0 0; }
        .problem-tag { font-size: 11px; font-weight: 700; color: var(--orange); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .problem-h3 { font-size: 22px; margin-bottom: 12px; color: var(--stone-900); }
        .problem-p { font-size: 14px; color: var(--stone-600); line-height: 1.7; }

        /* ── Features ── */
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .feat-card {
          background: #fff; border-radius: 20px; padding: 32px 28px;
          border: 1px solid var(--stone-200);
          transition: all 0.25s ease;
          position: relative;
        }
        .feat-card:hover { border-color: var(--green-100); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); }
        .feat-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--green-50); border: 1px solid var(--green-100); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .feat-h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--stone-900); }
        .feat-p { font-size: 14px; color: var(--stone-600); line-height: 1.65; }

        /* ── How it works ── */
        .hiw-bg { background: var(--stone-900); }
        .hiw-inner { max-width: 1200px; margin: 0 auto; padding: 96px 32px; }
        .hiw-eyebrow { font-size: 12px; font-weight: 700; color: var(--green-100); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .hiw-eyebrow::before { content: ''; width: 24px; height: 2px; background: var(--green-700); border-radius: 2px; }
        .hiw-h2 { font-size: 44px; color: #fff; margin-bottom: 20px; line-height: 1.15; letter-spacing: -0.02em; }
        .hiw-sub { font-size: 17px; color: var(--stone-400); max-width: 480px; line-height: 1.7; margin-bottom: 56px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .step-card { background: rgba(255,255,255,0.04); border-radius: 20px; padding: 36px 32px; border: 1px solid rgba(255,255,255,0.07); transition: border-color 0.2s; }
        .step-card:hover { border-color: rgba(255,255,255,0.15); }
        .step-num { font-size: 13px; font-weight: 700; color: var(--green-100); margin-bottom: 24px; width: 36px; height: 36px; border-radius: 50%; background: rgba(167,243,208,0.08); border: 1px solid rgba(167,243,208,0.2); display: flex; align-items: center; justify-content: center; letter-spacing: 0.05em; }
        .step-icon { font-size: 32px; margin-bottom: 20px; }
        .step-h3 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 10px; }
        .step-p { font-size: 14px; color: var(--stone-400); line-height: 1.7; }

        /* ── CTA ── */
        .cta-wrap {
          background: var(--green-900);
          position: relative; overflow: hidden;
        }
        .cta-wrap::before {
          content: '';
          position: absolute;
          top: -50%; left: -10%;
          width: 60%; height: 200%;
          background: radial-gradient(ellipse, rgba(64,145,108,0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-inner { max-width: 760px; margin: 0 auto; padding: 120px 32px; text-align: center; position: relative; }
        .cta-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: var(--green-100); font-size: 13px; font-weight: 600; padding: 8px 18px; border-radius: 100px; margin-bottom: 32px; }
        .cta-h2 { font-size: 52px; color: #fff; margin-bottom: 24px; line-height: 1.1; letter-spacing: -0.02em; }
        .cta-h2 em { font-style: italic; color: var(--green-100); font-weight: 500; }
        .cta-sub { font-size: 18px; color: rgba(255,255,255,0.65); max-width: 480px; margin: 0 auto 48px; line-height: 1.65; }
        .cta-btn { background: #fff; color: var(--green-900); font-size: 16px; font-weight: 700; padding: 16px 40px; border-radius: 12px; display: inline-block; transition: all 0.2s; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
        .cta-note { margin-top: 24px; font-size: 14px; color: rgba(255,255,255,0.4); }

        /* ── Footer ── */
        .footer { background: #111; padding: 48px 32px; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .footer-logo { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
        .footer-note { font-size: 13px; color: #444; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .hero { padding: 72px 20px 60px; }
          .hero-h1 { font-size: 40px; }
          .hero-sub { font-size: 16px; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.06); }
          .stat-val { font-size: 34px; }
          .section { padding: 64px 20px; }
          .section-h2, .hiw-h2 { font-size: 32px; }
          .problem-grid, .features-grid, .steps-grid { grid-template-columns: 1fr; }
          .hiw-inner { padding: 64px 20px; }
          .cta-inner { padding: 80px 20px; }
          .cta-h2 { font-size: 36px; }
          .nav-links { display: none; }
          .footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="landing">

        {/* ── Nav ── */}
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-logo serif">🌿 EcoPantry</div>
            <div className="nav-links">
              <a href="#problem"      className="nav-link">Why it matters</a>
              <a href="#features"     className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it works</a>
            </div>
            <Link href="/login" className="nav-cta">Get started free</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-pill anim-1">
            <span className="hero-pill-dot" />
            AI-powered food waste reduction
          </div>
          <h1 className="hero-h1 serif anim-2">
            Your pantry.<br />
            <em>Zero waste.</em>
          </h1>
          <p className="hero-sub anim-3">
            EcoPantry tracks expiry dates, plans meals with AI, connects you with neighbours for donations, and shows your real environmental impact.
          </p>
          <div className="hero-actions anim-4">
            <Link href="/login" className="btn-primary">
              Start for free →
            </Link>
            <a href="#how-it-works" className="btn-ghost">
              See how it works ↓
            </a>
          </div>
          <div className="hero-note anim-4">
            <span><span className="hero-note-check">✓</span> Always free</span>
            <span><span className="hero-note-check">✓</span> No credit card</span>
            <span><span className="hero-note-check">✓</span> 2-minute setup</span>
          </div>
        </section>

        <div className="divider" />

        {/* ── Stats ── */}
        <div className="stats-strip">
          <div className="stats-grid">
            {[
              { val: "1/3",    lbl: "of all food produced globally is wasted every year"    },
              { val: "$1,500", lbl: "average household loss to food waste annually"          },
              { val: "8%",     lbl: "of global greenhouse gas emissions from food waste"     },
              { val: "Free",   lbl: "EcoPantry is completely free — no hidden costs ever"    },
            ].map(({ val, lbl }) => (
              <div key={val} className="stat-item">
                <div className="stat-val serif">{val}</div>
                <div className="stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Problem ── */}
        <section id="problem" className="section">
          <div className="section-eyebrow">The problem</div>
          <h2 className="section-h2 serif">Food waste starts<br />at home</h2>
          <p className="section-sub">
            Most household waste happens because we simply lose visibility over what we own. EcoPantry restores that visibility.
          </p>
          <div className="problem-grid">
            {[
              { tag: "Out of sight", title: "Hidden at the back", desc: "Items get pushed to the back of the fridge and forgotten until they're already expired and unusable." },
              { tag: "Overbuying",   title: "Double purchasing",  desc: "Without a clear inventory, we buy things we already have, leading to inevitable spoilage and waste." },
              { tag: "No plan",      title: "Dinner time panic",  desc: "Staring at random ingredients without knowing how to combine them before they go bad costs time and food." },
            ].map(({ tag, title, desc }) => (
              <div key={tag} className="problem-card">
                <div className="problem-tag">{tag}</div>
                <h3 className="problem-h3 serif">{title}</h3>
                <p className="problem-p">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="section" style={{ paddingTop: 0 }}>
          <div className="section-eyebrow">Features</div>
          <h2 className="section-h2 serif">Everything your<br />pantry needs</h2>
          <p className="section-sub">
            From intelligent expiry tracking to AI meal generation, EcoPantry ensures nothing goes in the bin.
          </p>
          <div className="features-grid">
            {[
              { icon: "📦", title: "Smart inventory",      desc: "Add items with expiry dates, quantities, and categories. Color-coded alerts tell you what needs attention." },
              { icon: "✨", title: "AI meal planner",       desc: "Gemini AI analyzes your pantry and generates personalized meal ideas prioritizing items closest to expiry." },
              { icon: "🤝", title: "Community donations",  desc: "List surplus food for donation and let neighbours claim it — full pickup flow with notifications." },
              { icon: "📊", title: "Impact analytics",     desc: "Track your save rate, waste rate, and food categories over time. Visualize your real contribution." },
              { icon: "🔔", title: "Smart notifications",  desc: "Configure your own expiry alert threshold from 1 to 14 days. Get notified instantly." },
              { icon: "🔐", title: "Secure by design",     desc: "Two-factor authentication, encrypted secrets, and per-user settings keep your data safe." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feat-card">
                <div className="feat-icon">{icon}</div>
                <h3 className="feat-h3">{title}</h3>
                <p className="feat-p">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <div id="how-it-works" className="hiw-bg">
          <div className="hiw-inner">
            <div className="hiw-eyebrow">How it works</div>
            <h2 className="hiw-h2 serif">Three steps to<br />zero waste</h2>
            <p className="hiw-sub">
              Designed to be effortless enough for daily use and smart enough to make a measurable difference.
            </p>
            <div className="steps-grid">
              {[
                { num: "01", icon: "📝", title: "Log your groceries",   desc: "Add food items with expiry dates and quantities after you shop. The whole pantry in one clean view." },
                { num: "02", icon: "🍳", title: "Cook the suggestions", desc: "Our AI chef reviews your pantry daily and generates meals that use up expiring items first." },
                { num: "03", icon: "🌍", title: "Share the surplus",    desc: "Donate what you won't use to neighbours, track your analytics, and watch your waste drop to zero." },
              ].map(({ num, icon, title, desc }) => (
                <div key={num} className="step-card">
                  <div className="step-num serif">{num}</div>
                  <div className="step-icon">{icon}</div>
                  <h3 className="step-h3">{title}</h3>
                  <p className="step-p">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cta-wrap">
          <div className="cta-inner">
            <div className="cta-tag">🌱 Join the movement</div>
            <h2 className="cta-h2 serif">
              Ready to stop throwing<br />
              <em>away good food?</em>
            </h2>
            <p className="cta-sub">
              Create your free account in under 2 minutes and start making a real difference — for your wallet, your community, and the planet.
            </p>
            <Link href="/login" className="cta-btn">
              Create your free account →
            </Link>
            <div className="cta-note">Free forever · No credit card required · Open source</div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo serif">🌿 EcoPantry</div>
            <div className="footer-note">Built with 💚 to reduce food waste · © {new Date().getFullYear()} EcoPantry</div>
          </div>
        </footer>

      </div>
    </>
  );
}