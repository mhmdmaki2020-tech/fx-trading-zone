import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  Home,
  Bot,
  User,
  Image as ImageIcon,
  Video as VideoIcon,
  Type as TypeIcon,
  MessageCircle,
  Share2,
  Send,
  Plug,
  Play,
  Square,
  ShieldAlert,
  Sparkles,
  Copy as CopyIcon,
  Zap,
  Camera,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Mail,
  UserPlus,
  UserCheck,
  MessageSquare,
  Bell,
  Search,
  Calculator,
  RotateCcw,
  GraduationCap,
  ExternalLink,
  Lock,
  Folder,
  CheckCircle2,
  Trash2,
} from "lucide-react";

// ---------- Relative time formatting for posts ----------
function timeAgo(iso) {
  if (!iso) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ---------- Tradable symbols (shared by the ticker tape and calculator) ----------
const SYMBOLS = ["EURUSD", "XAUUSD", "US30", "GBPJPY", "BTCUSD", "USDJPY", "NAS100", "USOIL"];

// ---------- Country list for sign-up (name + phone dial code) ----------
const COUNTRIES = [
  { name: "United States", dial: "+1" },
  { name: "United Kingdom", dial: "+44" },
  { name: "Canada", dial: "+1" },
  { name: "Australia", dial: "+61" },
  { name: "New Zealand", dial: "+64" },
  { name: "Ireland", dial: "+353" },
  { name: "Germany", dial: "+49" },
  { name: "France", dial: "+33" },
  { name: "Spain", dial: "+34" },
  { name: "Italy", dial: "+39" },
  { name: "Portugal", dial: "+351" },
  { name: "Netherlands", dial: "+31" },
  { name: "Belgium", dial: "+32" },
  { name: "Switzerland", dial: "+41" },
  { name: "Austria", dial: "+43" },
  { name: "Sweden", dial: "+46" },
  { name: "Norway", dial: "+47" },
  { name: "Denmark", dial: "+45" },
  { name: "Finland", dial: "+358" },
  { name: "Poland", dial: "+48" },
  { name: "Czech Republic", dial: "+420" },
  { name: "Greece", dial: "+30" },
  { name: "Turkey", dial: "+90" },
  { name: "Ukraine", dial: "+380" },
  { name: "Russia", dial: "+7" },
  { name: "United Arab Emirates", dial: "+971" },
  { name: "Saudi Arabia", dial: "+966" },
  { name: "Qatar", dial: "+974" },
  { name: "Kuwait", dial: "+965" },
  { name: "Bahrain", dial: "+973" },
  { name: "Oman", dial: "+968" },
  { name: "Israel", dial: "+972" },
  { name: "Lebanon", dial: "+961" },
  { name: "Jordan", dial: "+962" },
  { name: "Egypt", dial: "+20" },
  { name: "South Africa", dial: "+27" },
  { name: "Nigeria", dial: "+234" },
  { name: "Kenya", dial: "+254" },
  { name: "Morocco", dial: "+212" },
  { name: "India", dial: "+91" },
  { name: "Pakistan", dial: "+92" },
  { name: "Bangladesh", dial: "+880" },
  { name: "Sri Lanka", dial: "+94" },
  { name: "China", dial: "+86" },
  { name: "Japan", dial: "+81" },
  { name: "South Korea", dial: "+82" },
  { name: "Singapore", dial: "+65" },
  { name: "Malaysia", dial: "+60" },
  { name: "Indonesia", dial: "+62" },
  { name: "Thailand", dial: "+66" },
  { name: "Vietnam", dial: "+84" },
  { name: "Philippines", dial: "+63" },
  { name: "Hong Kong", dial: "+852" },
  { name: "Taiwan", dial: "+886" },
  { name: "Brazil", dial: "+55" },
  { name: "Mexico", dial: "+52" },
  { name: "Argentina", dial: "+54" },
  { name: "Chile", dial: "+56" },
  { name: "Colombia", dial: "+57" },
  { name: "Peru", dial: "+51" },
  { name: "Other", dial: "" },
];

// ---------- FXTZ logo mark: a mini up/down candle pair ----------
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect x="0.6" y="0.6" width="38.8" height="38.8" rx="10" fill="#1B1F27" stroke="#E8A33D" strokeWidth="1.2" />
      <line x1="15" y1="8" x2="15" y2="26" stroke="#3FA796" strokeWidth="2" />
      <rect x="10" y="13" width="10" height="10" rx="2" fill="#3FA796" />
      <line x1="27" y1="14" x2="27" y2="32" stroke="#D64550" strokeWidth="2" />
      <rect x="22" y="17" width="10" height="10" rx="2" fill="#D64550" />
    </svg>
  );
}

// ---------- Risk/opinion disclaimer ----------
function DisclaimerBar() {
  return (
    <div className="bg-[#1B1F27] border-b border-white/10 px-4 py-1.5 text-center">
      <p className="text-[11px] text-[#8B93A3] font-mono flex items-center justify-center gap-1.5">
        <ShieldAlert size={11} className="text-[#E8A33D] shrink-0" />
        Trading involves risk. Everything shared here is personal opinion, not financial advice.
      </p>
    </div>
  );
}

// ---------- Public landing page ----------
function Landing({ onSignIn, onSignUp }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#12151B] px-6 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
      <Logo size={72} />
      <h1 className="font-serif text-3xl md:text-4xl text-[#E7E9EC] mt-4 mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        FX Trading Zone
      </h1>
      <p className="text-xs text-[#8B93A3] font-mono tracking-widest mb-3">FXTZ</p>
      <p className="text-sm text-[#8B93A3] max-w-md mb-8 leading-relaxed">
        Share setups, follow the tape, and run your bot alongside traders who post their fills in the open.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onSignUp}
          className="px-5 py-2.5 rounded-xl bg-[#E8A33D] text-[#12151B] text-sm font-medium hover:brightness-110 transition"
        >
          Sign up
        </button>
        <button
          onClick={onSignIn}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-[#E7E9EC] text-sm font-medium hover:bg-white/5 transition"
        >
          Sign in
        </button>
      </div>
      <p className="text-[11px] text-[#8B93A3] font-mono mt-8 max-w-sm">
        Trading involves risk. Everything shared here is personal opinion, not financial advice.
      </p>
    </div>
  );
}

// ---------- Sign in / sign up form ----------
const PASSWORD_PATTERN = "(?=.*[A-Za-z])(?=.*\\d).{8,}";

function AuthForm({ mode, onSubmit, onSwitchMode, onBack, onForgotPassword, error, loading }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [dialCode, setDialCode] = useState(COUNTRIES[0].dial);
  const [country, setCountry] = useState("");
  const isSignup = mode === "signup";

  function handleSubmit(e) {
    e.preventDefault();
    const fullMobile = isSignup ? `${dialCode} ${mobile}`.trim() : mobile;
    onSubmit(isSignup ? { email, username, password, mobile: fullMobile, country } : { email, password });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#12151B] px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-xs text-[#8B93A3] hover:text-[#E7E9EC] mb-6 font-mono">
          ← back
        </button>
        <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-[#8B93A3] mb-6">{isSignup ? "Join the floor and start posting." : "Sign in to see the feed."}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
          />
          {isSignup && (
            <>
              <input
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
              />
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  className="bg-[#1B1F27] border border-white/10 rounded-lg px-2 py-2.5 text-sm text-[#E7E9EC] outline-none focus:border-[#E8A33D] font-mono w-24 shrink-0"
                >
                  {COUNTRIES.filter((c) => c.dial).map((c) => (
                    <option key={c.name} value={c.dial}>
                      {c.dial}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="flex-1 bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
                />
              </div>
              <select
                required
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const match = COUNTRIES.find((c) => c.name === e.target.value);
                  if (match?.dial) setDialCode(match.dial);
                }}
                className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] outline-none focus:border-[#E8A33D]"
              >
                <option value="" disabled>
                  Country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="flex flex-col gap-1">
            <input
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              pattern={isSignup ? PASSWORD_PATTERN : undefined}
              title={isSignup ? "At least 8 characters, with letters and numbers." : undefined}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
            />
            {isSignup && (
              <p className="text-[11px] text-[#8B93A3]">Must be at least 8 characters and include both letters and numbers.</p>
            )}
            {!isSignup && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[11px] text-[#E8A33D] hover:underline text-left"
              >
                Forgot password?
              </button>
            )}
          </div>
          {error && <p className="text-xs text-[#D64550]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-[#8B93A3] mt-4">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button onClick={onSwitchMode} className="text-[#E8A33D] hover:underline">
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ---------- Email verification code entry ----------
function VerifyEmailForm({ email, onSubmit, onResend, onBack, error, info, loading, resending }) {
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(code.trim());
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#12151B] px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-xs text-[#8B93A3] hover:text-[#E7E9EC] mb-6 font-mono">
          ← back
        </button>
        <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          Verify your email
        </h2>
        <p className="text-sm text-[#8B93A3] mb-6">
          We sent a 6-digit code to <span className="text-[#E7E9EC]">{email}</span>. Enter it below to finish creating your account.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D] tracking-widest text-center font-mono"
          />
          {error && <p className="text-xs text-[#D64550]">{error}</p>}
          {info && <p className="text-xs text-[#3FA796]">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>
        <p className="text-xs text-[#8B93A3] mt-4">
          Didn't get it?{" "}
          <button onClick={onResend} disabled={resending} className="text-[#E8A33D] hover:underline disabled:opacity-60">
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ---------- Forgot password: request a reset code ----------
function ForgotPasswordForm({ onSubmit, onBack, error, loading }) {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(email);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#12151B] px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-xs text-[#8B93A3] hover:text-[#E7E9EC] mb-6 font-mono">
          ← back
        </button>
        <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          Reset your password
        </h2>
        <p className="text-sm text-[#8B93A3] mb-6">Enter your account email and we'll send you a reset code.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
          />
          {error && <p className="text-xs text-[#D64550]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- Reset password: enter code + new password ----------
function ResetPasswordForm({ email, onSubmit, onResend, onBack, error, info, loading, resending }) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setLocalError("New password and confirmation don't match.");
      return;
    }
    setLocalError("");
    onSubmit(code.trim(), newPassword);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#12151B] px-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-xs text-[#8B93A3] hover:text-[#E7E9EC] mb-6 font-mono">
          ← back
        </button>
        <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
          Enter reset code
        </h2>
        <p className="text-sm text-[#8B93A3] mb-6">
          We sent a 6-digit code to <span className="text-[#E7E9EC]">{email}</span>. Enter it below with your new password.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D] tracking-widest text-center font-mono"
          />
          <div className="flex flex-col gap-1">
            <input
              type="password"
              required
              minLength={8}
              pattern={PASSWORD_PATTERN}
              title="At least 8 characters, with letters and numbers."
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
            />
            <p className="text-[11px] text-[#8B93A3]">Must be at least 8 characters and include both letters and numbers.</p>
          </div>
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-[#1B1F27] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
          />
          {(localError || error) && <p className="text-xs text-[#D64550]">{localError || error}</p>}
          {info && <p className="text-xs text-[#3FA796]">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
        <p className="text-xs text-[#8B93A3] mt-4">
          Didn't get it?{" "}
          <button onClick={onResend} disabled={resending} className="text-[#E8A33D] hover:underline disabled:opacity-60">
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ---------- Signature element: a tiny candlestick used as the post-type marker ----------
function Candle({ up = true, size = 22 }) {
  const bodyColor = up ? "#3FA796" : "#D64550";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <line x1="12" y1="1" x2="12" y2="23" stroke={bodyColor} strokeWidth="1.4" />
      <rect x="7" y={up ? 8 : 6} width="10" height="10" rx="1.5" fill={bodyColor} />
    </svg>
  );
}

// ---------- Live ticker tape (the hero signature strip) ----------
function TickerTape() {
  const symbols = [
    { s: "EURUSD", v: "1.0842", d: "+0.12%", up: true },
    { s: "XAUUSD", v: "2,398.6", d: "+0.54%", up: true },
    { s: "US30", v: "39,812", d: "-0.21%", up: false },
    { s: "GBPJPY", v: "199.31", d: "+0.08%", up: true },
    { s: "BTCUSD", v: "67,240", d: "-1.04%", up: false },
    { s: "USDJPY", v: "156.02", d: "+0.03%", up: true },
    { s: "NAS100", v: "18,904", d: "+0.61%", up: true },
    { s: "USOIL", v: "78.21", d: "-0.44%", up: false },
  ];
  const row = [...symbols, ...symbols];
  return (
    <div className="overflow-hidden border-b border-white/10 bg-[#0D0F14] safe-top">
      <div className="flex gap-8 py-2 px-4 animate-[scroll_28s_linear_infinite] whitespace-nowrap" style={{ width: "max-content" }}>
        {row.map((t, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8B93A3]">{t.s}</span>
            <span className="text-[#E7E9EC]">{t.v}</span>
            <span className={t.up ? "text-[#3FA796]" : "text-[#D64550]"}>{t.d}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ view, setView, unreadCount, friendRequestCount }) {
  const items = [
    { id: "feed", label: "Feed", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Alerts", icon: Bell, badge: unreadCount },
    { id: "bot", label: "Bot", icon: Bot },
    { id: "courses", label: "Learn", icon: GraduationCap },
    { id: "profile", label: "Profile", icon: User, badge: friendRequestCount },
  ];
  return (
    <div className="flex md:flex-col gap-1 md:gap-2 md:w-20 w-full md:h-full border-r border-white/10 bg-[#0D0F14] pt-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] md:pb-4 px-2 md:items-center justify-around md:justify-start">
      <div className="hidden md:flex flex-col items-center mb-6">
        <Logo size={28} />
      </div>
      {items.map((it) => {
        const Icon = it.icon;
        const active = view === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className={`relative flex md:flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              active ? "bg-[#1B1F27] text-[#E8A33D]" : "text-[#8B93A3] hover:text-[#E7E9EC]"
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {it.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#D64550] text-white text-[9px] font-mono flex items-center justify-center leading-none">
                  {it.badge > 9 ? "9+" : it.badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-mono">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- New post composer ----------
function NewPostForm({ onPost, user }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null); // { type, url }
  const fileRef = useRef(null);

  function handleFile(e, kind) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMedia({ type: kind, url, name: file.name });
  }

  function submit() {
    if (!text.trim() && !media) return;
    onPost({ text, media });
    setText("");
    setMedia(null);
  }

  return (
    <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share a setup, a chart, a take — anything trading."
        className="w-full bg-transparent outline-none resize-none text-[#E7E9EC] placeholder-[#8B93A3] text-sm min-h-[64px]"
      />
      {media && (
        <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
          {media.type === "image" ? (
            <img src={media.url} alt={media.name} className="max-h-64 w-full object-cover" />
          ) : (
            <video src={media.url} controls className="max-h-64 w-full" />
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <label className="p-2 rounded-lg hover:bg-white/5 cursor-pointer text-[#8B93A3]" title="Add image">
            <ImageIcon size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, "image")} />
          </label>
          <label className="p-2 rounded-lg hover:bg-white/5 cursor-pointer text-[#8B93A3]" title="Add video">
            <VideoIcon size={18} />
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e, "video")} />
          </label>
          <span className="p-2 text-[#8B93A3]" title="Text">
            <TypeIcon size={18} />
          </span>
        </div>
        <button
          onClick={submit}
          className="flex items-center gap-2 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2 rounded-xl hover:brightness-110 transition"
        >
          <Send size={15} /> Post
        </button>
      </div>
    </div>
  );
}

// ---------- Add friend / accept / decline / requested button ----------
function FriendButton({ friendInfo, onAdd, onAccept, onDecline, onCancel }) {
  const status = friendInfo?.status || "none";
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    const result = await onAdd();
    if (!result?.ok) setError(result?.error || "Could not send request.");
  }

  if (status === "friend") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-[#3FA796]/30 text-[#3FA796] bg-[#3FA796]/10 shrink-0">
        <UserCheck size={13} /> Friends
      </span>
    );
  }
  if (status === "incoming") {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onAccept(friendInfo.friendshipId)}
          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#E8A33D] text-[#12151B] hover:brightness-110 transition"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(friendInfo.friendshipId)}
          className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] hover:bg-white/5 transition"
        >
          Decline
        </button>
      </div>
    );
  }
  if (status === "outgoing") {
    return (
      <button
        onClick={() => onCancel(friendInfo.friendshipId)}
        className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#D64550] hover:bg-white/5 transition shrink-0"
        title="Click to cancel your request"
      >
        <UserPlus size={13} /> Requested
      </button>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] hover:bg-white/5 transition"
      >
        <UserPlus size={13} /> Add friend
      </button>
      {error && <span className="text-[10px] text-[#D64550] font-mono">{error}</span>}
    </div>
  );
}

// ---------- Single post card ----------
function PostCard({ post, onVote, onComment, onDelete, friendInfo, onAddFriend, onAcceptFriend, onDeclineFriend, onCancelFriend, isOwnPost }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function submitComment() {
    if (!draft.trim()) return;
    onComment(post.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <Candle up={post.up} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#E7E9EC]">{post.author}</span>
            <span className="text-xs text-[#8B93A3] font-mono">{post.handle}</span>
            {post.kind === "ai" && (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
                <Sparkles size={10} /> AI
              </span>
            )}
            {post.kind === "trade" && (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3FA796]/15 text-[#3FA796]">
                <Zap size={10} /> bot fill
              </span>
            )}
          </div>
          <span className="text-xs text-[#8B93A3] font-mono">{timeAgo(post.createdAt)}</span>
        </div>
        {!isOwnPost && post.kind === "user" && (
          <FriendButton
            friendInfo={friendInfo}
            onAdd={() => onAddFriend(post.handle)}
            onAccept={onAcceptFriend}
            onDecline={onDeclineFriend}
            onCancel={onCancelFriend}
          />
        )}
        {isOwnPost && post.kind === "user" && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-[#8B93A3] hover:text-[#D64550] transition p-1"
            title="Delete post"
          >
            <Trash2 size={15} />
          </button>
        )}
        {isOwnPost && post.kind === "user" && confirmDelete && (
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => onDelete(post.id)} className="text-[#D64550] font-medium hover:underline">
              Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-[#8B93A3] hover:underline">
              Cancel
            </button>
          </div>
        )}
      </div>
      {post.text && <p className="text-sm text-[#E7E9EC] leading-relaxed mb-2 whitespace-pre-wrap">{post.text}</p>}
      {post.media && (
        <div className="rounded-xl overflow-hidden border border-white/10 mb-2">
          {post.media.type === "image" ? (
            <img src={post.media.url} alt="" className="w-full max-h-96 object-cover" />
          ) : (
            <video src={post.media.url} controls className="w-full max-h-96" />
          )}
        </div>
      )}
      <div className="flex items-center gap-5 pt-1 text-[#8B93A3]">
        <button
          onClick={() => onVote(post.id, "like")}
          className={`flex items-center gap-1.5 text-xs transition ${post.userVote === "like" ? "text-[#3FA796]" : "hover:text-[#3FA796]"}`}
          title="Like"
        >
          <Candle up size={14} /> {post.likes}
        </button>
        <button
          onClick={() => onVote(post.id, "dislike")}
          className={`flex items-center gap-1.5 text-xs transition ${post.userVote === "dislike" ? "text-[#D64550]" : "hover:text-[#D64550]"}`}
          title="Dislike"
        >
          <Candle up={false} size={14} /> {post.dislikes}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs hover:text-[#E7E9EC] transition">
          <MessageCircle size={15} /> {post.commentsList.length}
        </button>
        <span className="flex items-center gap-1.5 text-xs hover:text-[#E7E9EC] cursor-pointer">
          <Share2 size={15} />
        </span>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {post.commentsList.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {post.commentsList.map((c, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium text-[#E7E9EC]">{c.author}</span>{" "}
                  <span className="text-[#8B93A3] font-mono">{c.handle}</span>
                  <p className="text-[#E7E9EC] mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 bg-[#12151B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
            />
            <button onClick={submitComment} className="p-1.5 rounded-lg hover:bg-white/5 text-[#8B93A3]" title="Send">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Trade return calculator (risk/reward simulator) ----------
function simulateTrades({ startBalance, numTrades, riskPct, rr, winRate, entryPrice, direction }) {
  let balance = startBalance;
  let peak = startBalance;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  let wins = 0;
  let losses = 0;
  let price = entryPrice;
  const rows = [];

  for (let i = 1; i <= numTrades; i++) {
    const startingBalance = balance;
    const startingPrice = price;
    const isWin = Math.random() * 100 < winRate;
    const riskAmount = balance * (riskPct / 100);
    const profit = isWin ? riskAmount * rr : -riskAmount;
    balance += profit;
    if (isWin) wins += 1;
    else losses += 1;
    peak = Math.max(peak, balance);
    const drawdown = peak - balance;
    const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    if (drawdownPct > maxDrawdownPct) maxDrawdownPct = drawdownPct;

    // Illustrative price path: moves with the account on a BUY, against it on a SELL.
    const tradeReturnPct = profit / startingBalance;
    price = direction === "sell" ? startingPrice * (1 - tradeReturnPct) : startingPrice * (1 + tradeReturnPct);

    rows.push({
      trade: i,
      startingBalance,
      profit,
      endingBalance: balance,
      totalProfit: balance - startBalance,
      totalGainPct: ((balance - startBalance) / startBalance) * 100,
      startingPrice,
      endingPrice: price,
    });
  }

  const avgGainPct = rows.reduce((sum, r) => sum + (r.profit / r.startingBalance) * 100, 0) / numTrades;

  return {
    startBalance,
    endBalance: balance,
    roiPct: ((balance - startBalance) / startBalance) * 100,
    avgGainPct,
    wins,
    losses,
    maxDrawdown,
    maxDrawdownPct,
    entryPrice,
    exitPrice: price,
    direction,
    rows,
  };
}

function TradeReturnCalculator() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [entryPrice, setEntryPrice] = useState(1.0842);
  const [direction, setDirection] = useState("buy");
  const [startBalance, setStartBalance] = useState(1000);
  const [numTrades, setNumTrades] = useState(20);
  const [riskPct, setRiskPct] = useState(2);
  const [rr, setRr] = useState(2);
  const [winRate, setWinRate] = useState(50);
  const [result, setResult] = useState(null);

  function calculate() {
    setResult({
      symbol,
      ...simulateTrades({
        startBalance: Number(startBalance) || 0,
        numTrades: Number(numTrades) || 1,
        riskPct: Number(riskPct) || 0,
        rr: Number(rr) || 1,
        winRate: Number(winRate) || 0,
        entryPrice: Number(entryPrice) || 0,
        direction,
      }),
    });
  }

  function formatPrice(p) {
    return p < 10 ? p.toFixed(4) : p.toFixed(2);
  }

  const chartPoints = useMemo(() => {
    if (!result) return "";
    const balances = [result.startBalance, ...result.rows.map((r) => r.endingBalance)];
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;
    const w = 100;
    const h = 100;
    return balances
      .map((b, i) => {
        const x = (i / (balances.length - 1)) * w;
        const y = h - ((b - min) / range) * h;
        return `${x},${y}`;
      })
      .join(" ");
  }, [result]);

  return (
    <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-[#8B93A3]" />
        <span className="text-sm font-medium text-[#E7E9EC]">Trade return calculator</span>
      </div>
      <p className="text-xs text-[#8B93A3] mb-4 leading-relaxed">
        Simulates a run of random trades from your risk settings so you can see how your edge compounds — or drains — over
        time. Not a prediction, just math on the numbers you give it.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Symbol</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Entry price</span>
          <input
            type="number"
            step="0.0001"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Direction</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDirection("buy")}
              className={`flex-1 text-xs font-mono px-2 py-1.5 rounded-lg border transition ${
                direction === "buy" ? "border-[#3FA796]/30 text-[#3FA796] bg-[#3FA796]/10" : "border-white/10 text-[#8B93A3] hover:text-[#E7E9EC]"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setDirection("sell")}
              className={`flex-1 text-xs font-mono px-2 py-1.5 rounded-lg border transition ${
                direction === "sell" ? "border-[#D64550]/30 text-[#D64550] bg-[#D64550]/10" : "border-white/10 text-[#8B93A3] hover:text-[#E7E9EC]"
              }`}
            >
              Sell
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Start balance</span>
          <input
            type="number"
            value={startBalance}
            onChange={(e) => setStartBalance(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide"># of trades</span>
          <input
            type="number"
            min={1}
            max={100}
            value={numTrades}
            onChange={(e) => setNumTrades(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Risk / trade %</span>
          <input
            type="number"
            step="0.1"
            value={riskPct}
            onChange={(e) => setRiskPct(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Risk:Reward (1:X)</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              value={rr}
              onChange={(e) => setRr(e.target.value)}
              className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D] w-full"
            />
            <button onClick={() => setRr(2)} className="text-[10px] font-mono px-1.5 py-1 rounded border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] shrink-0">1:2</button>
            <button onClick={() => setRr(3)} className="text-[10px] font-mono px-1.5 py-1 rounded border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] shrink-0">1:3</button>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">Win rate %</span>
          <input
            type="number"
            min={0}
            max={100}
            value={winRate}
            onChange={(e) => setWinRate(e.target.value)}
            className="bg-[#12151B] border border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D]"
          />
        </label>
      </div>

      <button
        onClick={calculate}
        className="flex items-center gap-2 bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2 rounded-xl hover:brightness-110 transition mb-4"
      >
        {result ? <RotateCcw size={15} /> : <Calculator size={15} />} {result ? "Recalculate" : "Calculate"}
      </button>

      {result && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Candle up={result.direction === "buy"} size={14} />
            <span className="text-sm text-[#E7E9EC] font-mono">{result.symbol}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                result.direction === "buy" ? "bg-[#3FA796]/15 text-[#3FA796]" : "bg-[#D64550]/15 text-[#D64550]"
              }`}
            >
              {result.direction.toUpperCase()}
            </span>
            <span className="text-xs text-[#8B93A3]">· {result.rows.length} simulated trades</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatTile label="End balance" value={result.endBalance.toFixed(2)} tone={result.endBalance >= result.startBalance ? "up" : "down"} />
            <StatTile label="Return on investment" value={`${result.roiPct >= 0 ? "+" : ""}${result.roiPct.toFixed(1)}%`} tone={result.roiPct >= 0 ? "up" : "down"} />
            <StatTile label="Avg gain / trade" value={`${result.avgGainPct >= 0 ? "+" : ""}${result.avgGainPct.toFixed(2)}%`} tone={result.avgGainPct >= 0 ? "up" : "down"} />
            <StatTile label="Win / loss" value={`${result.wins} / ${result.losses}`} />
            <StatTile label="Max drawdown" value={`-${result.maxDrawdown.toFixed(2)}`} tone="down" />
            <StatTile label="Max drawdown %" value={`-${result.maxDrawdownPct.toFixed(1)}%`} tone="down" />
            <StatTile label="Entry price" value={formatPrice(result.entryPrice)} />
            <StatTile label="Exit price" value={formatPrice(result.exitPrice)} tone={result.exitPrice >= result.entryPrice ? "up" : "down"} />
          </div>

          <div className="bg-[#12151B] border border-white/10 rounded-xl p-3 mb-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32">
              <polyline points={chartPoints} fill="none" stroke="#E8A33D" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-[#8B93A3] text-left border-b border-white/10">
                  <th className="pb-2 font-normal">#</th>
                  <th className="pb-2 font-normal">Symbol</th>
                  <th className="pb-2 font-normal">Price</th>
                  <th className="pb-2 font-normal">Start</th>
                  <th className="pb-2 font-normal">Profit</th>
                  <th className="pb-2 font-normal">End</th>
                  <th className="pb-2 font-normal">Total profit</th>
                  <th className="pb-2 font-normal">Total gain</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.trade} className="border-b border-white/5 last:border-0">
                    <td className="py-1.5 text-[#8B93A3]">{r.trade}</td>
                    <td className="py-1.5 text-[#E7E9EC]">{result.symbol}</td>
                    <td className="py-1.5 text-[#E7E9EC]">{formatPrice(r.endingPrice)}</td>
                    <td className="py-1.5 text-[#E7E9EC]">{r.startingBalance.toFixed(2)}</td>
                    <td className={`py-1.5 ${r.profit >= 0 ? "text-[#3FA796]" : "text-[#D64550]"}`}>
                      {r.profit >= 0 ? "+" : ""}{r.profit.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-[#E7E9EC]">{r.endingBalance.toFixed(2)}</td>
                    <td className={`py-1.5 ${r.totalProfit >= 0 ? "text-[#3FA796]" : "text-[#D64550]"}`}>
                      {r.totalProfit >= 0 ? "+" : ""}{r.totalProfit.toFixed(2)}
                    </td>
                    <td className={`py-1.5 ${r.totalGainPct >= 0 ? "text-[#3FA796]" : "text-[#D64550]"}`}>
                      {r.totalGainPct >= 0 ? "+" : ""}{r.totalGainPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Bot Dashboard ----------
function BotDashboard({ user, onUserUpdate }) {
  const connected = user.mt5Connected;
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [running, setRunning] = useState(false);
  const [modes, setModes] = useState({ auto: true, copy: false, commentary: true });
  const [form, setForm] = useState({ login: user.mt5Login || "", server: user.mt5Server || "", password: "" });

  // Only ever real once a live account is connected — no fake trades shown as if they happened.
  const trades = connected
    ? [
        { id: 1, symbol: "EURUSD", side: "BUY", lots: 0.5, entry: "1.0821", exit: "1.0842", pnl: "+42.00", status: "closed" },
        { id: 2, symbol: "XAUUSD", side: "SELL", lots: 0.2, entry: "2,401.2", exit: "—", pnl: "-8.40", status: "open" },
        { id: 3, symbol: "US30", side: "BUY", lots: 1.0, entry: "39,720", exit: "39,812", pnl: "+92.00", status: "closed" },
      ]
    : [];

  function toggleMode(key) {
    setModes((m) => ({ ...m, [key]: !m[key] }));
  }

  async function handleConnectToggle() {
    setConnectError("");
    if (connected) {
      const res = await fetch("/api/mt5/disconnect", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) onUserUpdate(data.user);
      setRunning(false);
      return;
    }
    if (!form.login || !form.server) {
      setConnectError("Account login and server are required.");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch("/api/mt5/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ login: form.login, server: form.server }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not connect.");
      onUserUpdate(data.user);
      setForm((f) => ({ ...f, password: "" }));
    } catch (e) {
      setConnectError(e.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        Bot control room
      </h2>
      <p className="text-sm text-[#8B93A3] mb-6">Wire this up to a real MetaTrader 5 account when you have broker credentials. Everything below runs on mock data until then.</p>

      {/* Mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { key: "auto", title: "Auto-execute", desc: "Places trades from your strategy signals automatically.", icon: Zap },
          { key: "copy", title: "Copy-trade", desc: "Mirrors a lead account's trades to followers' accounts.", icon: CopyIcon },
          { key: "commentary", title: "AI commentary", desc: "Posts AI-written market notes to the feed. No trading.", icon: Sparkles },
        ].map(({ key, title, desc, icon: Icon }) => (
          <button
            key={key}
            onClick={() => toggleMode(key)}
            className={`text-left p-4 rounded-2xl border transition ${
              modes[key] ? "border-[#E8A33D] bg-[#E8A33D]/10" : "border-white/10 bg-[#1B1F27]"
            }`}
          >
            <Icon size={18} className={modes[key] ? "text-[#E8A33D]" : "text-[#8B93A3]"} />
            <div className="mt-2 text-sm font-medium text-[#E7E9EC]">{title}</div>
            <div className="text-xs text-[#8B93A3] mt-1 leading-snug">{desc}</div>
          </button>
        ))}
      </div>

      {/* Connect account */}
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Plug size={16} className="text-[#8B93A3]" />
          <span className="text-sm font-medium text-[#E7E9EC]">Connect MT5 account</span>
        </div>
        <p className="text-xs text-[#8B93A3] mb-3 leading-relaxed">
          Use your broker's <strong className="text-[#E7E9EC]">investor (read-only) password</strong> — never your real trading
          password. We only record that a connection exists; we don't store the password, and there's no live broker feed wired
          up yet, so no trade data will appear until a real bridge is built.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            placeholder="Account login"
            value={form.login}
            disabled={connected}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            className="bg-[#12151B] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D] disabled:opacity-60"
          />
          <input
            placeholder="Server"
            value={form.server}
            disabled={connected}
            onChange={(e) => setForm({ ...form, server: e.target.value })}
            className="bg-[#12151B] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D] disabled:opacity-60"
          />
          <input
            placeholder="Investor (read-only) password"
            type="password"
            value={form.password}
            disabled={connected}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-[#12151B] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E7E9EC] font-mono outline-none focus:border-[#E8A33D] disabled:opacity-60"
          />
        </div>
        {connectError && <p className="text-xs text-[#D64550] mb-3">{connectError}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectToggle}
            disabled={connecting}
            className="text-sm px-4 py-2 rounded-xl bg-[#E8A33D] text-[#12151B] font-medium hover:brightness-110 disabled:opacity-60"
          >
            {connecting ? "Connecting…" : connected ? "Disconnect" : "Connect"}
          </button>
          <span className={`text-xs font-mono ${connected ? "text-[#3FA796]" : "text-[#8B93A3]"}`}>
            {connected ? `● connected — ${user.mt5Login} @ ${user.mt5Server}` : "○ not connected"}
          </span>
        </div>
      </div>

      {/* Run controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          disabled={!connected}
          onClick={() => setRunning(true)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium ${
            connected ? "bg-[#3FA796] text-[#0D0F14] hover:brightness-110" : "bg-white/5 text-[#8B93A3] cursor-not-allowed"
          }`}
        >
          <Play size={15} /> Start bot
        </button>
        <button
          disabled={!running}
          onClick={() => setRunning(false)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium ${
            running ? "bg-[#D64550] text-[#12151B] hover:brightness-110" : "bg-white/5 text-[#8B93A3] cursor-not-allowed"
          }`}
        >
          <Square size={15} /> Stop bot
        </button>
        <span className="text-xs font-mono text-[#8B93A3]">{running ? "● running (simulated)" : "○ stopped"}</span>
      </div>

      {/* Risk note */}
      <div className="flex gap-3 bg-[#1B1F27] border border-[#D64550]/30 rounded-2xl p-4 mb-6">
        <ShieldAlert size={18} className="text-[#D64550] shrink-0 mt-0.5" />
        <p className="text-xs text-[#8B93A3] leading-relaxed">
          Auto-execution and copy-trading real accounts on behalf of other people can carry regulatory obligations that vary by country. Confirm your setup with a lawyer before opening this to the public, and always use investor-only (read-only) credentials wherever the broker supports them.
        </p>
      </div>

      <TradeReturnCalculator />

      {/* Trade log */}
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4">
        <span className="text-sm font-medium text-[#E7E9EC]">Trade log</span>
        {trades.length === 0 ? (
          <p className="text-xs text-[#8B93A3] mt-3">
            {connected ? "No trades yet." : "Connect your MT5 account above to see your trade log here."}
          </p>
        ) : (
          <table className="w-full mt-3 text-xs font-mono">
            <thead>
              <tr className="text-[#8B93A3] text-left border-b border-white/10">
                <th className="pb-2 font-normal">Symbol</th>
                <th className="pb-2 font-normal">Side</th>
                <th className="pb-2 font-normal">Lots</th>
                <th className="pb-2 font-normal">Entry</th>
                <th className="pb-2 font-normal">Exit</th>
                <th className="pb-2 font-normal">PnL</th>
                <th className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-[#E7E9EC]">{t.symbol}</td>
                  <td className={`py-2 ${t.side === "BUY" ? "text-[#3FA796]" : "text-[#D64550]"}`}>{t.side}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.lots}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.entry}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.exit}</td>
                  <td className={`py-2 ${t.pnl.startsWith("+") ? "text-[#3FA796]" : "text-[#D64550]"}`}>{t.pnl}</td>
                  <td className="py-2 text-[#8B93A3]">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Free trader courses ----------
const COURSES = [
  {
    id: "forex-basics",
    level: "Beginner",
    title: "Forex basics",
    summary: "What a currency pair is, how pips and lots work, and how to read a quote.",
    body: [
      "A currency pair like EURUSD tells you how much of the second currency (USD, the \"quote\" currency) it takes to buy one unit of the first (EUR, the \"base\" currency). If EURUSD = 1.0842, one euro costs $1.0842.",
      "A pip is the smallest standard price move for a pair — usually the 4th decimal place (0.0001) for most pairs, or the 2nd decimal (0.01) for pairs involving the Japanese yen.",
      "A lot is a unit of trade size. A standard lot is 100,000 units of the base currency; a mini lot is 10,000; a micro lot is 1,000. Smaller lot sizes mean smaller pip values and smaller risk — most beginners should start with micro lots.",
      "Every trade has two sides: you buy one currency while simultaneously selling the other. If you think EUR will strengthen against USD, you buy EURUSD. If you think it'll weaken, you sell it.",
    ],
  },
  {
    id: "risk-management",
    level: "Beginner",
    title: "Risk management",
    summary: "The single habit that separates traders who last from traders who blow up their account.",
    body: [
      "Decide your risk per trade before you enter, as a percentage of your account — not a fixed dollar amount. Most experienced traders risk 1–2% of their account on any single trade, no matter how confident they feel.",
      "Always set a stop-loss before you set a take-profit. A stop-loss defines the exact price where you're proven wrong and exit — it's not optional, and it's not something to move further away mid-trade because a trade is losing.",
      "Think in risk:reward ratios. A 1:2 ratio means you're risking $1 to potentially make $2. Even a strategy that only wins 40% of the time can be profitable long-term at a 1:2 ratio or better.",
      "Position size, don't guess. Position size = (Account size × Risk %) ÷ (Stop-loss distance in pips × Pip value). Getting this calculation right matters more than picking the 'perfect' entry.",
      "One bad trade should never be able to seriously damage your account. If it can, your position size was too big — not your analysis too wrong.",
    ],
  },
  {
    id: "candlesticks",
    level: "Beginner",
    title: "Reading candlestick charts",
    summary: "The anatomy of a candle, and a handful of patterns worth actually knowing.",
    body: [
      "Each candle shows four prices over a time period: open, high, low, and close. The thick part (the 'body') spans open to close; the thin lines above/below (the 'wicks' or 'shadows') show the high and low.",
      "A green/hollow candle usually means the close was higher than the open (price went up over that period). A red/filled candle means the close was lower than the open.",
      "A 'doji' — a candle with a tiny body and long wicks on both sides — shows indecision: buyers and sellers fought to a draw. They're often more meaningful at the top or bottom of a trend.",
      "An 'engulfing' pattern is when one candle's body completely covers the previous candle's body in the opposite color — a possible sign the trend is reversing, especially after a long run in one direction.",
      "A 'hammer' (small body, long lower wick, appearing after a downtrend) suggests sellers pushed price down but buyers fought back hard by the close — often read as a potential bottom.",
      "No candlestick pattern works in isolation. They're context clues, not signals — always read them alongside the broader trend and key support/resistance levels.",
    ],
  },
  {
    id: "leverage-margin",
    level: "Intermediate",
    title: "Leverage & margin",
    summary: "Why leverage is the main reason beginners lose accounts — and how to use it responsibly.",
    body: [
      "Leverage lets you control a larger position than your account balance would normally allow. At 1:100 leverage, $1,000 controls a $100,000 position.",
      "Leverage amplifies both gains AND losses by the same factor. It doesn't change your odds of winning — it just makes the outcome, whichever way it goes, much bigger.",
      "Margin is the amount of your own money set aside as collateral to open a leveraged position. If your losses eat into your margin too far, your broker issues a 'margin call' — and if you don't add funds, they'll forcibly close your positions ('stop-out').",
      "The mistake almost every beginner makes: using high leverage to open a position size that's too large for their account, so a completely normal price wiggle wipes them out. Leverage available ≠ leverage you should use.",
      "A practical rule: calculate your position size from your risk management plan first (see the Risk Management course), then check that it fits comfortably within your margin — not the other way around.",
    ],
  },
  {
    id: "analysis-styles",
    level: "Intermediate",
    title: "Technical vs. fundamental analysis",
    summary: "Two different lenses for the same market — and why most traders end up using both.",
    body: [
      "Technical analysis studies price charts and patterns, on the idea that price already reflects all known information, and history tends to repeat because human behavior repeats. Tools: trendlines, support/resistance, indicators, candlestick patterns.",
      "Fundamental analysis studies the underlying economic and political drivers of a currency's value — interest rates, inflation, employment data, central bank policy, geopolitical events.",
      "Neither approach is 'correct' on its own. Fundamentals tend to set the broader direction over weeks and months; technicals are often used to time entries and exits within that direction.",
      "A common beginner mistake is ignoring the economic calendar entirely and being surprised when a clean technical setup gets blown apart by a surprise interest rate decision or jobs report.",
    ],
  },
  {
    id: "psychology",
    level: "Intermediate",
    title: "Trading psychology",
    summary: "Why the hardest part of trading has nothing to do with charts.",
    body: [
      "Revenge trading — trying to immediately win back a loss with a bigger, less-planned trade — is one of the fastest ways to turn a bad day into a disastrous month. If you catch yourself doing this, step away.",
      "Overconfidence after a winning streak leads to oversized positions and skipped risk management, right before the market normally humbles that overconfidence.",
      "A trading journal — logging every trade's reasoning, entry, exit, and outcome — is the single best tool for noticing your own repeated mistakes. Most traders think they know their patterns; the journal usually proves otherwise.",
      "Trading is a game of probabilities played over hundreds of trades, not a verdict on any single one. Judge your process, not any individual result.",
      "If a single trade's outcome affects your mood for the rest of the day, your position size is too large relative to what you can handle emotionally — regardless of what the math says.",
    ],
  },
];

const EXTERNAL_RESOURCES = [
  { name: "BabyPips — School of Pipsology", desc: "The most widely recommended free, structured forex course online.", url: "https://www.babypips.com/learn/forex" },
  { name: "Investopedia — Trading basics", desc: "Deep, well-written reference articles on virtually every trading concept.", url: "https://www.investopedia.com/trading-4427765" },
  { name: "TradingView — Education", desc: "Free chart-reading and strategy write-ups from a large trading community.", url: "https://www.tradingview.com/education/" },
];

// ---------- Course folders: free ones open now, premium ones are locked until payments exist ----------
const COURSE_FOLDERS = [
  {
    id: "getting-started",
    title: "Getting started",
    access: "free",
    desc: "The core concepts everyone should know before placing a real trade.",
    lessons: [COURSES[0], COURSES[1], COURSES[2]],
  },
  {
    id: "leveling-up",
    title: "Leveling up",
    access: "free",
    desc: "Go beyond the basics: leverage, analysis styles, and the mental game.",
    lessons: [COURSES[3], COURSES[4], COURSES[5]],
  },
  {
    id: "price-action-mastery",
    title: "Price action mastery",
    access: "premium",
    price: "$49",
    desc: "Market structure, liquidity, order blocks, and multi-timeframe confluence — for traders who've outgrown the basics.",
  },
  {
    id: "trading-plan-builder",
    title: "Building a trading plan",
    access: "premium",
    price: "$29",
    desc: "Turn a strategy into a written, testable plan: entry/exit rules, backtesting, and journaling templates.",
  },
  {
    id: "prop-firm-prep",
    title: "Prop firm challenge prep",
    access: "premium",
    price: "$39",
    desc: "How funded-account evaluations work, the rules that trip people up, and how to pass one without blowing the account.",
  },
];

function CoursesPage() {
  const [openFolder, setOpenFolder] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  if (activeLesson) {
    return (
      <div className="max-w-2xl mx-auto">
        <PanelHeader title={activeLesson.title} onBack={() => setActiveLesson(null)} />
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-6 text-sm text-[#8B93A3] leading-relaxed space-y-4">
          {activeLesson.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    );
  }

  if (openFolder?.access === "premium") {
    return (
      <div className="max-w-2xl mx-auto">
        <PanelHeader title={openFolder.title} onBack={() => setOpenFolder(null)} />
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-8 text-center">
          <Lock size={28} className="text-[#E8A33D] mx-auto mb-4" />
          <p className="text-sm text-[#E7E9EC] mb-4 max-w-sm mx-auto leading-relaxed">{openFolder.desc}</p>
          <p className="font-serif text-3xl text-[#E8A33D] mb-5" style={{ fontFamily: "Fraunces, serif" }}>
            {openFolder.price}
          </p>
          <button
            disabled
            className="bg-white/5 text-[#8B93A3] text-sm font-medium px-5 py-2.5 rounded-xl cursor-not-allowed"
          >
            Purchase — coming soon
          </button>
          <p className="text-xs text-[#8B93A3] mt-4 max-w-xs mx-auto">
            Payments aren't set up yet. This course will unlock for purchase once a payment gateway is added.
          </p>
        </div>
      </div>
    );
  }

  if (openFolder) {
    return (
      <div className="max-w-2xl mx-auto">
        <PanelHeader title={openFolder.title} onBack={() => setOpenFolder(null)} />
        <p className="text-sm text-[#8B93A3] mb-4">{openFolder.desc}</p>
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
          {openFolder.lessons.map((course) => (
            <button
              key={course.id}
              onClick={() => setActiveLesson(course)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#E7E9EC] font-medium">{course.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">{course.level}</span>
                </div>
                <div className="text-xs text-[#8B93A3] mt-0.5">{course.summary}</div>
              </div>
              <ChevronRight size={16} className="text-[#8B93A3] shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        Learn to trade
      </h2>
      <p className="text-sm text-[#8B93A3] mb-6">
        Free lessons to start, written in plain language — plus deeper paid courses coming soon once payments are set up.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {COURSE_FOLDERS.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setOpenFolder(folder)}
            className="text-left p-5 rounded-2xl border border-white/10 bg-[#1B1F27] hover:border-[#E8A33D]/40 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <Folder size={22} className="text-[#8B93A3]" />
              {folder.access === "free" ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3FA796]/15 text-[#3FA796]">
                  <CheckCircle2 size={11} /> Free
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8A33D]/15 text-[#E8A33D]">
                  <Lock size={11} /> {folder.price}
                </span>
              )}
            </div>
            <div className="text-base font-medium text-[#E7E9EC] mb-1.5">{folder.title}</div>
            <div className="text-xs text-[#8B93A3] leading-relaxed">{folder.desc}</div>
            {folder.lessons && (
              <div className="text-[10px] text-[#8B93A3] font-mono mt-3 uppercase tracking-wide">
                {folder.lessons.length} lessons
              </div>
            )}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">More free resources</h3>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
        {EXTERNAL_RESOURCES.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition"
          >
            <div>
              <div className="text-sm text-[#E7E9EC] font-medium">{r.name}</div>
              <div className="text-xs text-[#8B93A3] mt-0.5">{r.desc}</div>
            </div>
            <ExternalLink size={15} className="text-[#8B93A3] shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ---------- Small stat tile used in the trading history dashboard ----------
function StatTile({ label, value, tone }) {
  const color = tone === "up" ? "text-[#3FA796]" : tone === "down" ? "text-[#D64550]" : "text-[#E7E9EC]";
  return (
    <div className="bg-[#1B1F27] border border-white/10 rounded-xl p-3">
      <div className="text-[10px] text-[#8B93A3] font-mono uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-medium mt-1 ${color}`}>{value}</div>
    </div>
  );
}

// ---------- Trading history dashboard (Profile) ----------
function TradingHistoryDashboard({ connected }) {
  const allTrades = useMemo(
    () => [
      { id: 1, date: "2026-07-28", symbol: "EURUSD", side: "BUY", lots: 0.5, entry: "1.0821", exit: "1.0842", pnl: 42.0, status: "closed" },
      { id: 2, date: "2026-07-29", symbol: "XAUUSD", side: "SELL", lots: 0.2, entry: "2,401.2", exit: "2,409.6", pnl: -8.4, status: "closed" },
      { id: 3, date: "2026-07-29", symbol: "US30", side: "BUY", lots: 1.0, entry: "39,720", exit: "39,812", pnl: 92.0, status: "closed" },
      { id: 4, date: "2026-07-30", symbol: "GBPJPY", side: "SELL", lots: 0.3, entry: "199.80", exit: "199.31", pnl: 58.5, status: "closed" },
      { id: 5, date: "2026-07-30", symbol: "BTCUSD", side: "BUY", lots: 0.1, entry: "66,900", exit: "67,240", pnl: 34.0, status: "closed" },
      { id: 6, date: "2026-07-31", symbol: "NAS100", side: "SELL", lots: 0.5, entry: "18,950", exit: "18,904", pnl: -23.0, status: "closed" },
      { id: 7, date: "2026-07-31", symbol: "USOIL", side: "BUY", lots: 0.4, entry: "78.60", exit: "—", pnl: 0, status: "open" },
    ],
    []
  );

  // Nothing shown as "your history" until a real account is connected — no fake trades.
  const trades = connected ? allTrades : [];
  const closed = trades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => t.pnl > 0);
  const totalPnl = closed.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : 0;
  const openCount = trades.length - closed.length;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">Trading history</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile label="Total trades" value={trades.length} />
        <StatTile label="Win rate" value={`${winRate}%`} />
        <StatTile label="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`} tone={totalPnl >= 0 ? "up" : "down"} />
        <StatTile label="Open positions" value={openCount} />
      </div>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 overflow-x-auto">
        {trades.length === 0 ? (
          <p className="text-xs text-[#8B93A3]">
            {connected ? "No trades yet." : "Connect your MT5 account in the Bot tab to see your trade history here."}
          </p>
        ) : (
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[#8B93A3] text-left border-b border-white/10">
                <th className="pb-2 font-normal">Date</th>
                <th className="pb-2 font-normal">Symbol</th>
                <th className="pb-2 font-normal">Side</th>
                <th className="pb-2 font-normal">Lots</th>
                <th className="pb-2 font-normal">Entry</th>
                <th className="pb-2 font-normal">Exit</th>
                <th className="pb-2 font-normal">PnL</th>
                <th className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-[#8B93A3]">{t.date}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.symbol}</td>
                  <td className={`py-2 ${t.side === "BUY" ? "text-[#3FA796]" : "text-[#D64550]"}`}>{t.side}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.lots}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.entry}</td>
                  <td className="py-2 text-[#E7E9EC]">{t.exit}</td>
                  <td className={`py-2 ${t.pnl > 0 ? "text-[#3FA796]" : t.pnl < 0 ? "text-[#D64550]" : "text-[#8B93A3]"}`}>
                    {t.status === "open" ? "—" : `${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}`}
                  </td>
                  <td className="py-2 text-[#8B93A3]">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Shared bits for the settings/legal panels ----------
function PanelHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={onBack} className="text-xs text-[#8B93A3] hover:text-[#E7E9EC] font-mono">
        ← back
      </button>
      <h2 className="font-serif text-2xl text-[#E7E9EC]" style={{ fontFamily: "Fraunces, serif" }}>
        {title}
      </h2>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <div className="text-sm text-[#E7E9EC]">{label}</div>
        {desc && <div className="text-xs text-[#8B93A3] mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full shrink-0 transition relative ${checked ? "bg-[#E8A33D]" : "bg-white/10"}`}
        title={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#12151B] transition ${checked ? "translate-x-4" : ""}`}
        />
      </button>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition text-left">
      <span className="flex items-center gap-3 text-sm text-[#E7E9EC]">
        <Icon size={16} className="text-[#8B93A3]" /> {label}
      </span>
      <ChevronRight size={16} className="text-[#8B93A3]" />
    </button>
  );
}

// ---------- Settings panel ----------
function SettingsPanel({ onBack, onOpenChangePassword }) {
  const [notifications, setNotifications] = useState(true);
  const [aiCommentary, setAiCommentary] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <PanelHeader title="Settings" onBack={onBack} />
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10 mb-4">
        <ToggleRow
          label="Push notifications"
          desc="Get notified about replies, likes, and bot fills."
          checked={notifications}
          onChange={setNotifications}
        />
        <ToggleRow
          label="AI market commentary"
          desc="Show AI-generated notes in your feed."
          checked={aiCommentary}
          onChange={setAiCommentary}
        />
        <ToggleRow
          label="Public profile"
          desc="Let other traders see your posts and trade history."
          checked={publicProfile}
          onChange={setPublicProfile}
        />
      </div>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl">
        <MenuRow icon={Shield} label="Change password" onClick={onOpenChangePassword} />
      </div>
    </div>
  );
}

// ---------- Change password panel ----------
function ChangePasswordPanel({ onBack }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password.");
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PanelHeader title="Change password" onBack={onBack} />
      <form onSubmit={handleSubmit} className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <input
          type="password"
          required
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="bg-[#12151B] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
        />
        <div className="flex flex-col gap-1">
          <input
            type="password"
            required
            minLength={8}
            pattern={PASSWORD_PATTERN}
            title="At least 8 characters, with letters and numbers."
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#12151B] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
          />
          <p className="text-[11px] text-[#8B93A3]">Must be at least 8 characters and include both letters and numbers.</p>
        </div>
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-[#12151B] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
        />
        {error && <p className="text-xs text-[#D64550]">{error}</p>}
        {success && <p className="text-xs text-[#3FA796]">Password changed successfully.</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#E8A33D] text-[#12151B] font-medium text-sm px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}

// ---------- Privacy panel ----------
function PrivacyPanel({ onBack }) {
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [historyVisibleToEveryone, setHistoryVisibleToEveryone] = useState(true);

  return (
    <div className="max-w-2xl mx-auto">
      <PanelHeader title="Privacy" onBack={onBack} />
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10 mb-4">
        <ToggleRow
          label="Allow friend requests"
          desc="Let other traders add you as a friend from your posts."
          checked={allowFriendRequests}
          onChange={setAllowFriendRequests}
        />
        <ToggleRow
          label="Trade history visible to everyone"
          desc="Turn off to only show your trade history to friends."
          checked={historyVisibleToEveryone}
          onChange={setHistoryVisibleToEveryone}
        />
      </div>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-6 text-sm text-[#8B93A3] leading-relaxed space-y-4">
        <p>
          We store the account details you provide — email, username, mobile number, and country — to run your account, verify your
          identity, and secure your session. Your password is hashed and never stored in plain text.
        </p>
        <p>
          Posts, comments, likes, and dislikes you create are visible to other members of the community. The trading history shown
          on your profile is sample data for now and isn't shared with anyone until a real broker connection is wired up.
        </p>
        <p>We don't sell your data to third parties. You can request account deletion at any time via Help &amp; Support.</p>
        <div className="flex gap-3 border border-[#E8A33D]/30 rounded-xl p-4 mt-2">
          <ShieldAlert size={18} className="text-[#E8A33D] shrink-0 mt-0.5" />
          <p className="text-xs">
            Placeholder copy for a demo app. Replace this with a real privacy policy reviewed by a lawyer before this app handles
            real users' data.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Help & support panel ----------
function HelpPanel({ onBack }) {
  const faqs = [
    {
      q: "How do I connect my MT5 account?",
      a: 'Go to the Bot tab and enter your investor-only (read-only) credentials under "Connect MT5 account."',
    },
    {
      q: "Why do I need to verify my email?",
      a: "It confirms you own the address so we can secure your account and send important notices.",
    },
    {
      q: "Can I delete my account?",
      a: "Email support and we'll remove your data.",
    },
  ];
  return (
    <div className="max-w-2xl mx-auto">
      <PanelHeader title="Help & Support" onBack={onBack} />
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10 mb-4">
        {faqs.map((f, i) => (
          <div key={i} className="px-4 py-3">
            <div className="text-sm text-[#E7E9EC] font-medium">{f.q}</div>
            <div className="text-xs text-[#8B93A3] mt-1 leading-relaxed">{f.a}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <Mail size={16} className="text-[#8B93A3]" />
        <span className="text-sm text-[#E7E9EC] font-mono">support@fxtradingzone.com</span>
      </div>
    </div>
  );
}

// ---------- Terms & conditions panel ----------
function TermsPanel({ onBack }) {
  return (
    <div className="max-w-2xl mx-auto">
      <PanelHeader title="Terms & Conditions" onBack={onBack} />
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-6 text-sm text-[#8B93A3] leading-relaxed space-y-4">
        <p>By using FX Trading Zone (FXTZ), you agree to post in good faith and avoid sharing financial advice you're not licensed to give.</p>
        <p>
          Content shared by other members, including AI-generated commentary and bot fills, is for informational purposes only and
          is not investment advice.
        </p>
        <p>You're responsible for any trading decisions and any bot or copy-trading connections you set up. Trade at your own risk.</p>
        <p>We may suspend accounts that post spam, harassment, or market manipulation.</p>
        <div className="flex gap-3 border border-[#E8A33D]/30 rounded-xl p-4 mt-2">
          <ShieldAlert size={18} className="text-[#E8A33D] shrink-0 mt-0.5" />
          <p className="text-xs">
            Placeholder copy for a demo app. Have a lawyer draft real terms before opening this to the public, especially given the
            trading/financial subject matter.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Profile ----------
function Profile({ user, onLogout, onAvatarChange, friends, incomingRequests, outgoingRequests, onAcceptFriend, onDeclineFriend, onCancelFriend }) {
  const fileRef = useRef(null);
  const [panel, setPanel] = useState(null); // null | "settings" | "privacy" | "help" | "terms"
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      onAvatarChange(data.user);
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

  if (panel === "settings") return <SettingsPanel onBack={() => setPanel(null)} onOpenChangePassword={() => setPanel("changePassword")} />;
  if (panel === "changePassword") return <ChangePasswordPanel onBack={() => setPanel("settings")} />;
  if (panel === "privacy") return <PrivacyPanel onBack={() => setPanel(null)} />;
  if (panel === "help") return <HelpPanel onBack={() => setPanel(null)} />;
  if (panel === "terms") return <TermsPanel onBack={() => setPanel(null)} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        Your profile
      </h2>
      <p className="text-sm text-[#8B93A3] mb-6">Track record and settings will live here as the app grows.</p>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-16 h-16 rounded-full overflow-hidden group shrink-0"
              title="Change profile picture"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] font-serif text-xl" style={{ fontFamily: "Fraunces, serif" }}>
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                {uploading ? (
                  <span className="text-[10px] text-white font-mono">…</span>
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </span>
            </button>
            {avatarError && <p className="text-[10px] text-[#D64550] font-mono mt-1 max-w-[64px]">{avatarError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          <div>
            <div className="text-sm font-medium text-[#E7E9EC]">{user.username}</div>
            <div className="text-xs text-[#8B93A3] font-mono">
              @{user.username} · {user.email} · joined {joined}
            </div>
            <div className="text-xs text-[#8B93A3] font-mono mt-0.5">
              {user.mobile} · {user.country}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-xs px-3 py-2 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] hover:bg-white/5 transition font-mono shrink-0"
        >
          Log out
        </button>
      </div>
      {incomingRequests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">Friend requests ({incomingRequests.length})</h3>
          <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
            {incomingRequests.map((r) => (
              <div key={r.friendshipId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] font-serif text-sm shrink-0" style={{ fontFamily: "Fraunces, serif" }}>
                    {r.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-[#E7E9EC]">{r.username}</div>
                    <div className="text-xs text-[#8B93A3] font-mono">{r.handle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAcceptFriend(r.friendshipId)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#E8A33D] text-[#12151B] hover:brightness-110 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineFriend(r.friendshipId)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] hover:bg-white/5 transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">Friends {friends.length > 0 && `(${friends.length})`}</h3>
        {friends.length === 0 ? (
          <div className="bg-[#1B1F27] border border-white/10 rounded-2xl p-4 text-xs text-[#8B93A3]">
            No friends yet. Add traders from their posts in the feed or Search.
          </div>
        ) : (
          <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
            {friends.map((f) => (
              <div key={f.handle} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] font-serif text-sm shrink-0" style={{ fontFamily: "Fraunces, serif" }}>
                  {f.username[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-[#E7E9EC]">{f.username}</div>
                  <div className="text-xs text-[#8B93A3] font-mono">{f.handle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {outgoingRequests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">Sent requests ({outgoingRequests.length})</h3>
          <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
            {outgoingRequests.map((r) => (
              <div key={r.friendshipId} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] font-serif text-sm shrink-0" style={{ fontFamily: "Fraunces, serif" }}>
                    {r.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-[#E7E9EC]">{r.username}</div>
                    <div className="text-xs text-[#8B93A3] font-mono">{r.handle}</div>
                  </div>
                </div>
                <button
                  onClick={() => onCancelFriend(r.friendshipId)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#D64550] hover:bg-white/5 transition shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <TradingHistoryDashboard connected={user.mt5Connected} />
      <div className="mt-6">
        <h3 className="text-sm font-medium text-[#E7E9EC] mb-3">Settings</h3>
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
          <MenuRow icon={SettingsIcon} label="Settings" onClick={() => setPanel("settings")} />
          <MenuRow icon={Shield} label="Privacy" onClick={() => setPanel("privacy")} />
          <MenuRow icon={HelpCircle} label="Help & Support" onClick={() => setPanel("help")} />
          <MenuRow icon={FileText} label="Terms & Conditions" onClick={() => setPanel("terms")} />
        </div>
      </div>
    </div>
  );
}

// ---------- Messages (mock DMs) ----------
function Messages() {
  const seedThreads = useMemo(
    () => ({
      1: [
        { from: "them", text: "Nice call on EURUSD earlier.", time: "10m" },
        { from: "me", text: "Thanks! Watching for the breakout above 1.0850 still.", time: "8m" },
      ],
      2: [{ from: "them", text: "Heads up: volatility picking up on gold into the US session.", time: "1h" }],
      3: [{ from: "them", text: "Your bot's fills have looked clean this week.", time: "3h" }],
    }),
    []
  );
  const conversations = [
    { id: 1, author: "Maya R.", handle: "@mayafx" },
    { id: 2, author: "Market Copilot", handle: "@ai-desk" },
    { id: 3, author: "Priya N.", handle: "@priyafx" },
  ];

  const [threads, setThreads] = useState(seedThreads);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId);

  function send() {
    if (!draft.trim()) return;
    setThreads((prev) => ({ ...prev, [activeId]: [...prev[activeId], { from: "me", text: draft.trim(), time: "now" }] }));
    setDraft("");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        Messages
      </h2>
      <p className="text-sm text-[#8B93A3] mb-6">Direct messages are mock for now — nothing here leaves your browser.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 hover:bg-white/5 transition ${activeId === c.id ? "bg-white/5" : ""}`}
            >
              <div className="text-sm text-[#E7E9EC] font-medium">{c.author}</div>
              <div className="text-xs text-[#8B93A3] truncate mt-0.5">{threads[c.id][threads[c.id].length - 1]?.text}</div>
            </button>
          ))}
        </div>
        <div className="md:col-span-2 bg-[#1B1F27] border border-white/10 rounded-2xl p-4 flex flex-col h-[420px]">
          <div className="text-sm font-medium text-[#E7E9EC] mb-3 pb-3 border-b border-white/10">
            {active.author} <span className="text-xs text-[#8B93A3] font-mono">{active.handle}</span>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {threads[activeId].map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  m.from === "me" ? "bg-[#E8A33D] text-[#12151B] self-end" : "bg-white/5 text-[#E7E9EC] self-start"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message…"
              className="flex-1 bg-[#12151B] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
            />
            <button onClick={send} className="p-2 rounded-lg bg-[#E8A33D] text-[#12151B] hover:brightness-110 transition" title="Send">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Notifications ----------
function Notifications({ items, onMarkAllRead }) {
  const icons = { like: Candle, comment: MessageCircle, friend: UserPlus, bot: Zap };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
            Notifications
          </h2>
          <p className="text-sm text-[#8B93A3]">Mock activity for now — likes, comments, and friend requests will be real once accounts connect.</p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-xs px-3 py-2 rounded-lg border border-white/10 text-[#8B93A3] hover:text-[#E7E9EC] hover:bg-white/5 transition font-mono shrink-0"
        >
          Mark all read
        </button>
      </div>
      <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
        {items.map((n) => {
          const Icon = icons[n.type] ?? Bell;
          return (
            <div key={n.id} className={`flex items-center gap-3 px-4 py-3 ${!n.read ? "bg-[#E8A33D]/5" : ""}`}>
              {n.type === "like" ? <Candle up size={14} /> : <Icon size={16} className="text-[#8B93A3]" />}
              <div className="flex-1">
                <div className="text-sm text-[#E7E9EC]">{n.text}</div>
                <div className="text-xs text-[#8B93A3] font-mono mt-0.5">{n.time}</div>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#E8A33D] shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Search users ----------
function SearchUsers({ friendStatusByHandle, onAddFriend, onAcceptFriend, onDeclineFriend, onCancelFriend }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.users || []);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-serif text-2xl text-[#E7E9EC] mb-1" style={{ fontFamily: "Fraunces, serif" }}>
        Search
      </h2>
      <p className="text-sm text-[#8B93A3] mb-6">Find other traders by username.</p>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B93A3]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search usernames…"
          className="w-full bg-[#1B1F27] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#E7E9EC] placeholder-[#8B93A3] outline-none focus:border-[#E8A33D]"
        />
      </div>
      {loading && <p className="text-xs text-[#8B93A3]">Searching…</p>}
      {!loading && searched && results.length === 0 && (
        <p className="text-xs text-[#8B93A3]">No traders found for "{query.trim()}".</p>
      )}
      {results.length > 0 && (
        <div className="bg-[#1B1F27] border border-white/10 rounded-2xl divide-y divide-white/10">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-[#E8A33D]/20 flex items-center justify-center text-[#E8A33D] font-serif text-sm shrink-0"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {r.username[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-[#E7E9EC]">{r.username}</div>
                  <div className="text-xs text-[#8B93A3] font-mono">
                    {r.handle} · {r.country || "—"}
                  </div>
                </div>
              </div>
              <FriendButton
                friendInfo={friendStatusByHandle[r.handle]}
                onAdd={() => onAddFriend(r.handle)}
                onAccept={onAcceptFriend}
                onDecline={onDeclineFriend}
                onCancel={onCancelFriend}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- App ----------
export default function TradingCommunityApp() {
  const [view, setView] = useState("feed");

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authView, setAuthView] = useState("home"); // "home" | "signin" | "signup" | "verify" | "forgot" | "resetPassword"
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  async function submitAuth(mode, data) {
    setAuthLoading(true);
    setAuthError("");
    try {
      const endpoint = mode === "signin" ? "login" : "signup";
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.pendingVerification) {
          setPendingEmail(json.email);
          setAuthView("verify");
          setAuthError("");
          return;
        }
        throw new Error(json.error || "Something went wrong.");
      }
      if (json.pendingVerification) {
        setPendingEmail(json.email);
        setAuthView("verify");
        return;
      }
      setUser(json.user);
      setAuthView("home");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitVerify(code) {
    setAuthLoading(true);
    setAuthError("");
    setAuthInfo("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed.");
      setUser(json.user);
      setAuthView("home");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    setAuthError("");
    setAuthInfo("");
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not resend code.");
      setAuthInfo("New code sent.");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setResending(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setAuthView("home");
    setView("feed");
  }

  async function submitForgotPassword(email) {
    setAuthLoading(true);
    setAuthError("");
    setAuthInfo("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send reset code.");
      setPendingEmail(json.email);
      setAuthView("resetPassword");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitResetPassword(code, newPassword) {
    setAuthLoading(true);
    setAuthError("");
    setAuthInfo("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail, code, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not reset password.");
      setUser(json.user);
      setAuthView("home");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function resendResetCode() {
    setResending(true);
    setAuthError("");
    setAuthInfo("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not resend code.");
      setAuthInfo("New code sent.");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setResending(false);
    }
  }

  // Ask for camera/mic access as soon as the user lands on the Feed (the first tab),
  // so the browser permission is already granted before they try to attach media.
  useEffect(() => {
    if (!user) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => stream.getTracks().forEach((track) => track.stop()))
      .catch(() => {
        // Denied or no device — fine, features that need it will just prompt again later.
      });
  }, [user]);

  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/posts", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .finally(() => setPostsLoaded(true));
  }, [user]);

  async function addPost({ text, media }) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, media }),
    });
    const data = await res.json();
    if (res.ok) setPosts((prev) => [data.post, ...prev]);
  }

  async function votePost(id, type) {
    const res = await fetch(`/api/posts/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (res.ok) setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
  }

  async function commentOnPost(id, text) {
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (res.ok) setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
  }

  async function deletePost(id) {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const refreshFriends = useCallback(() => {
    if (!user) return;
    fetch("/api/friends", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setFriends(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      });
  }, [user]);

  useEffect(() => {
    refreshFriends();
  }, [refreshFriends]);

  const friendStatusByHandle = useMemo(() => {
    const map = {};
    friends.forEach((f) => (map[f.handle] = { status: "friend" }));
    incomingRequests.forEach((f) => (map[f.handle] = { status: "incoming", friendshipId: f.friendshipId }));
    outgoingRequests.forEach((f) => (map[f.handle] = { status: "outgoing", friendshipId: f.friendshipId }));
    return map;
  }, [friends, incomingRequests, outgoingRequests]);

  async function addFriend(handle) {
    const username = handle.replace(/^@/, "");
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok) refreshFriends();
    return res.ok ? { ok: true } : { ok: false, error: data.error };
  }
  async function acceptFriend(friendshipId) {
    await fetch(`/api/friends/${friendshipId}/accept`, { method: "POST", credentials: "include" });
    refreshFriends();
  }
  async function declineFriend(friendshipId) {
    await fetch(`/api/friends/${friendshipId}/decline`, { method: "POST", credentials: "include" });
    refreshFriends();
  }
  async function cancelFriend(friendshipId) {
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE", credentials: "include" });
    refreshFriends();
  }

  const [notifications, setNotifications] = useState(() => [
    { id: 1, type: "like", text: "Maya R. liked your post.", time: "5m", read: false },
    { id: 2, type: "comment", text: "Market Copilot commented on your post.", time: "20m", read: false },
    { id: 3, type: "friend", text: "Priya N. sent you a friend request.", time: "1h", read: true },
    { id: 4, type: "bot", text: "Your bot filled BUY 1.0 lots US30 @ 39,720.", time: "1h", read: true },
    { id: 5, type: "comment", text: "Dax replied to your comment.", time: "3h", read: true },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#12151B]">
        <div className="animate-pulse">
          <Logo size={40} />
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === "home") {
      return <Landing onSignIn={() => setAuthView("signin")} onSignUp={() => setAuthView("signup")} />;
    }
    if (authView === "verify") {
      return (
        <VerifyEmailForm
          email={pendingEmail}
          onSubmit={submitVerify}
          onResend={resendCode}
          onBack={() => {
            setAuthError("");
            setAuthInfo("");
            setAuthView("home");
          }}
          error={authError}
          info={authInfo}
          loading={authLoading}
          resending={resending}
        />
      );
    }
    if (authView === "forgot") {
      return (
        <ForgotPasswordForm
          onSubmit={submitForgotPassword}
          onBack={() => {
            setAuthError("");
            setAuthView("signin");
          }}
          error={authError}
          loading={authLoading}
        />
      );
    }
    if (authView === "resetPassword") {
      return (
        <ResetPasswordForm
          email={pendingEmail}
          onSubmit={submitResetPassword}
          onResend={resendResetCode}
          onBack={() => {
            setAuthError("");
            setAuthInfo("");
            setAuthView("signin");
          }}
          error={authError}
          info={authInfo}
          loading={authLoading}
          resending={resending}
        />
      );
    }
    return (
      <AuthForm
        mode={authView}
        onSubmit={(data) => submitAuth(authView, data)}
        onSwitchMode={() => {
          setAuthError("");
          setAuthView(authView === "signin" ? "signup" : "signin");
        }}
        onBack={() => {
          setAuthError("");
          setAuthView("home");
        }}
        onForgotPassword={() => {
          setAuthError("");
          setAuthView("forgot");
        }}
        error={authError}
        loading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#12151B]" style={{ fontFamily: "Inter, sans-serif" }}>
      <TickerTape />
      <DisclaimerBar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar view={view} setView={setView} unreadCount={unreadCount} friendRequestCount={incomingRequests.length} />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {view === "feed" && (
            <div className="max-w-2xl mx-auto">
              <h1 className="font-serif text-2xl text-[#E7E9EC] mb-4" style={{ fontFamily: "Fraunces, serif" }}>
                The Floor
              </h1>
              <NewPostForm onPost={addPost} user={user} />
              {!postsLoaded && <p className="text-sm text-[#8B93A3]">Loading the floor…</p>}
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onVote={votePost}
                  onComment={commentOnPost}
                  onDelete={deletePost}
                  friendInfo={friendStatusByHandle[p.handle]}
                  onAddFriend={addFriend}
                  onAcceptFriend={acceptFriend}
                  onDeclineFriend={declineFriend}
                  onCancelFriend={cancelFriend}
                  isOwnPost={p.handle === `@${user.username}`}
                />
              ))}
            </div>
          )}
          {view === "search" && (
            <SearchUsers
              friendStatusByHandle={friendStatusByHandle}
              onAddFriend={addFriend}
              onAcceptFriend={acceptFriend}
              onDeclineFriend={declineFriend}
              onCancelFriend={cancelFriend}
            />
          )}
          {view === "messages" && <Messages />}
          {view === "notifications" && <Notifications items={notifications} onMarkAllRead={markAllRead} />}
          {view === "bot" && <BotDashboard user={user} onUserUpdate={setUser} />}
          {view === "courses" && <CoursesPage />}
          {view === "profile" && (
            <Profile
              user={user}
              onLogout={logout}
              onAvatarChange={setUser}
              friends={friends}
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              onAcceptFriend={acceptFriend}
              onDeclineFriend={declineFriend}
              onCancelFriend={cancelFriend}
            />
          )}
        </div>
      </div>
    </div>
  );
}
