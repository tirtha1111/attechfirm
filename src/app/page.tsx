"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { 
  Lock, LogOut, Plus, Trash2, Edit, Save, Check, CheckSquare, 
  Clock, Heart, DollarSign, PenTool, LifeBuoy, Cpu, TrendingUp, Users, 
  ChevronDown, ChevronUp, ChevronRight, Copy, ExternalLink, Mail, Phone, MapPin, Globe, Sparkles, 
  X, Menu, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2,
  Layers, Zap, Send, RefreshCw, AlertCircle, Laptop, Database, Activity,
  RotateCcw
} from "lucide-react";
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { db } from "@/lib/firebase";
import { PageData, INITIAL_PAGE_DATA, Service, Founder, WhyItem, ProcessStep, PricingPlan, FAQItem } from "@/lib/types";

// Official Shiny Metallic AT Monogram Logo
function SilverLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
        <defs>
          <linearGradient id="silverPlat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="60" cy="60" r="54" fill="#08090d" stroke="url(#silverPlat)" strokeWidth="3" />
        <circle cx="60" cy="60" r="49" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 2" />
        
        {/* Monogram A & T geometric paths */}
        <path
          d="M36 82 L50 36 L64 82 M40 70 L60 70"
          stroke="url(#silverPlat)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M62 36 L90 36 M76 36 L76 82"
          stroke="url(#silverPlat)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// Inline Editable component for live in-place website editing
interface EditableProps {
  value: string;
  onChange: (newValue: string) => void;
  textarea?: boolean;
  className?: string;
  admin: boolean;
  placeholder?: string;
}

function Editable({ 
  value = "", 
  onChange, 
  textarea = false, 
  className = "", 
  admin, 
  placeholder = "Edit text..."
}: EditableProps) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (!admin) {
    return <span className={className}>{value}</span>;
  }

  const handleStartEdit = () => {
    setTempValue(value || "");
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (tempValue.trim() !== "") {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !textarea) {
      handleBlur();
    }
    if (e.key === "Escape") {
      setEditing(false);
    }
  };

  if (editing) {
    if (textarea) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-slate-900 text-white border-2 border-amber-400 rounded-lg p-2.5 outline-none font-inherit text-left resize-y shadow-[0_0_20px_rgba(251,191,36,0.25)] ${className}`}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full bg-slate-900 text-white border-2 border-amber-400 rounded-lg px-2.5 py-1 outline-none font-inherit text-left shadow-[0_0_20px_rgba(251,191,36,0.25)] ${className}`}
      />
    );
  }

  return (
    <span 
      onClick={handleStartEdit} 
      className={`group relative cursor-pointer border border-dashed border-transparent hover:border-amber-400/80 hover:bg-amber-400/10 rounded px-1 transition-all duration-200 inline-block ${className}`}
      title="Click to edit live"
    >
      <span>{value}</span>
      <span className="absolute top-1/2 -translate-y-1/2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-slate-950 px-1 py-0.5 rounded shadow-lg text-[9px] font-bold pointer-events-none flex items-center gap-0.5 z-20">
        <Edit size={9} /> Edit
      </span>
    </span>
  );
}

export default function Page() {
  const [data, setData] = useState<PageData>(INITIAL_PAGE_DATA);
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("attechfirm_admin_auth") === "true";
    }
    return false;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Lead contact form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactService, setContactService] = useState("Web Development");
  const [contactMessage, setContactMessage] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);

  // Scroll Progress Percentage
  const [scrollPercent, setScrollPercent] = useState(0);

  // Checkout states
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // 0. Sync auth state from session storage on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = sessionStorage.getItem("attechfirm_admin_auth") === "true";
      setAdminMode(isAuth);
    };
    checkAuth();
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, []);

  // 1. Initialize Firestore Admin Credentials & Real-time Page Data Sync
  useEffect(() => {
    // Seed credentials if not exists
    async function seedAdminCredentials() {
      try {
        const authRef = doc(db, "adminAuth", "credentials");
        const authSnap = await getDoc(authRef);
        if (!authSnap.exists()) {
          await setDoc(authRef, {
            username: "attechfirm",
            password: "attechfirm1122",
            role: "SUPER_ADMIN",
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn("Admin auth credentials check:", err);
      }
    }
    seedAdminCredentials();

    // 2. Real-time Firestore sync listener for page data (Single Source of Truth)
    const docRef = doc(db, "pageData", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as Partial<PageData>;
        setData({
          heroBadge: remoteData.heroBadge || INITIAL_PAGE_DATA.heroBadge,
          heroTitleLine1: remoteData.heroTitleLine1 || INITIAL_PAGE_DATA.heroTitleLine1,
          heroTitleLine2: remoteData.heroTitleLine2 || INITIAL_PAGE_DATA.heroTitleLine2,
          heroSubtitle: remoteData.heroSubtitle || INITIAL_PAGE_DATA.heroSubtitle,
          heroPrimaryCta: remoteData.heroPrimaryCta || INITIAL_PAGE_DATA.heroPrimaryCta,
          heroSecondaryCta: remoteData.heroSecondaryCta || INITIAL_PAGE_DATA.heroSecondaryCta,
          logoText: remoteData.logoText || INITIAL_PAGE_DATA.logoText,
          logoSub: remoteData.logoSub || INITIAL_PAGE_DATA.logoSub,
          stats: remoteData.stats && remoteData.stats.length > 0 ? remoteData.stats : INITIAL_PAGE_DATA.stats,
          services: remoteData.services && remoteData.services.length > 0 ? remoteData.services : INITIAL_PAGE_DATA.services,
          founders: remoteData.founders && remoteData.founders.length > 0 ? remoteData.founders : INITIAL_PAGE_DATA.founders,
          whyChooseUs: remoteData.whyChooseUs && remoteData.whyChooseUs.length > 0 ? remoteData.whyChooseUs : INITIAL_PAGE_DATA.whyChooseUs,
          process: remoteData.process && remoteData.process.length > 0 ? remoteData.process : INITIAL_PAGE_DATA.process,
          pricing: remoteData.pricing && remoteData.pricing.length > 0 ? remoteData.pricing : INITIAL_PAGE_DATA.pricing,
          faqs: remoteData.faqs && remoteData.faqs.length > 0 ? remoteData.faqs : INITIAL_PAGE_DATA.faqs,
          featuredProject: {
            category: remoteData.featuredProject?.category || INITIAL_PAGE_DATA.featuredProject.category,
            sub: remoteData.featuredProject?.sub || INITIAL_PAGE_DATA.featuredProject.sub,
            title: remoteData.featuredProject?.title || INITIAL_PAGE_DATA.featuredProject.title,
            desc: remoteData.featuredProject?.desc || INITIAL_PAGE_DATA.featuredProject.desc,
            bullets: remoteData.featuredProject?.bullets && remoteData.featuredProject.bullets.length > 0 
              ? remoteData.featuredProject.bullets 
              : INITIAL_PAGE_DATA.featuredProject.bullets,
            tech: remoteData.featuredProject?.tech && remoteData.featuredProject.tech.length > 0 
              ? remoteData.featuredProject.tech 
              : INITIAL_PAGE_DATA.featuredProject.tech
          },
          contactInfo: {
            email: remoteData.contactInfo?.email || INITIAL_PAGE_DATA.contactInfo.email,
            phone: remoteData.contactInfo?.phone || INITIAL_PAGE_DATA.contactInfo.phone,
            location: remoteData.contactInfo?.location || INITIAL_PAGE_DATA.contactInfo.location,
            website: remoteData.contactInfo?.website || INITIAL_PAGE_DATA.contactInfo.website
          }
        });
      } else {
        // Initialize Firestore with full default data
        setDoc(docRef, {
          ...INITIAL_PAGE_DATA,
          updatedAt: new Date().toISOString()
        }).catch((err) => console.warn("Init pageData doc:", err));
        setData(INITIAL_PAGE_DATA);
      }
    }, (err) => {
      console.warn("Firestore snapshot sync error, using default data:", err);
      setData(INITIAL_PAGE_DATA);
    });

    return () => unsubscribe();
  }, []);

  // Monitor scroll for progress and liquid navbar active states
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollPercent((currentScroll / totalScroll) * 100);
      }

      const sections = ["services", "founders", "why", "process", "pricing", "faqs", "contact"];
      const scrollPosition = window.scrollY + 220;

      if (window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Secure Admin Login handler checking against database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Check database credentials
      const authRef = doc(db, "adminAuth", "credentials");
      const authSnap = await getDoc(authRef);

      let validUsername = "attechfirm";
      let validPassword = "attechfirm1122";

      if (authSnap.exists()) {
        const creds = authSnap.data();
        validUsername = creds.username || "attechfirm";
        validPassword = creds.password || "attechfirm1122";
      }

      const inputUserTrimmed = inputUsername.trim();
      const inputPassTrimmed = inputPassword.trim();

      if (inputUserTrimmed === validUsername && inputPassTrimmed === validPassword) {
        setAdminMode(true);
        setShowLogin(false);
        setInputUsername("");
        setInputPassword("");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("attechfirm_admin_auth", "true");
        }
        toast.success("Authenticated Successfully! Admin Editor Active", {
          description: "Click directly on any text or elements to edit page content."
        });
      } else {
        toast.error("Invalid Credentials", {
          description: "Username or password does not match. Access denied."
        });
      }
    } catch (err) {
      console.error("Login verification error:", err);
      // Fallback check
      if (inputUsername.trim() === "attechfirm" && inputPassword.trim() === "attechfirm1122") {
        setAdminMode(true);
        setShowLogin(false);
        setInputUsername("");
        setInputPassword("");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("attechfirm_admin_auth", "true");
        }
        toast.success("Admin Editor Active");
      } else {
        toast.error("Authentication failed. Please verify credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Log out handler
  const handleLogout = () => {
    setAdminMode(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("attechfirm_admin_auth");
    }
    toast.info("Logged out of Admin Mode.");
  };

  // Live state update helper
  const updateValue = (key: keyof PageData, val: any) => {
    setData((prev) => ({ ...prev, [key]: val }));
    setHasUnsavedChanges(true);
  };

  // Restore all original company details and push to Firebase
  const handleRestoreOriginalDetails = async () => {
    setData(INITIAL_PAGE_DATA);
    setHasUnsavedChanges(false);
    const toastId = toast.loading("Restoring all company details to Firebase...");
    try {
      const docRef = doc(db, "pageData", "main");
      await setDoc(docRef, {
        ...INITIAL_PAGE_DATA,
        updatedAt: new Date().toISOString()
      });
      toast.success("All company details, services, founders & packages restored!", { id: toastId });
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore to database.", { id: toastId });
    }
  };

  // Save changes to Firestore
  const handleSaveToDatabase = async () => {
    const toastId = toast.loading("Saving changes to Firebase database...");
    try {
      const docRef = doc(db, "pageData", "main");
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout. Please check your internet connection.")), 15000)
      );

      await Promise.race([
        setDoc(docRef, {
          ...data,
          updatedAt: new Date().toISOString()
        }),
        timeoutPromise
      ]);

      setHasUnsavedChanges(false);
      toast.success("Published Live to Firebase! Latest website is updated.", { id: toastId });
    } catch (err: any) {
      console.error("Save error: ", err);
      toast.error(err?.message || "Failed to save changes to Firebase. Please try again.", { id: toastId });
    }
  };

  // Submit Lead Message to Firestore & trigger email alert to attechfirm@gmail.com
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    try {
      // 1. Save to Firestore contacts collection
      await addDoc(collection(db, "contacts"), {
        name: contactName,
        email: contactEmail,
        service: contactService,
        message: contactMessage,
        createdAt: new Date().toISOString()
      });

      // 2. Send instant email notification to attechfirm@gmail.com
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: contactName,
          email: contactEmail,
          subject: contactService,
          message: contactMessage
        })
      }).catch((err) => console.warn("Background email notification error:", err));

      toast.success("Message sent successfully!", {
        description: "Your inquiry has been dispatched to attechfirm@gmail.com. We'll reply within 24-48 hours."
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      console.error("Submit contact error: ", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleUpiPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !checkoutName || !checkoutEmail) return;

    if (!utrNumber || utrNumber.trim().length < 6) {
      toast.error("Please enter a valid 12-digit UTR / UPI Transaction Reference ID.");
      return;
    }

    setCheckoutLoading(true);
    const clientData = {
      name: checkoutName,
      email: checkoutEmail,
      phone: checkoutPhone || "N/A",
      planTitle: selectedPlan.title,
      amount: selectedPlan.currentPrice,
      paymentId: utrNumber.trim(),
      utrNumber: utrNumber.trim(),
      upiId: data.contactInfo.upiId || "9635996626@fam",
      createdAt: new Date().toISOString(),
      status: "development"
    };

    // 1. Send automatic email notification for new package purchase
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "purchase",
        name: checkoutName,
        email: checkoutEmail,
        phone: checkoutPhone || "N/A",
        planTitle: selectedPlan.title,
        amount: selectedPlan.currentPrice,
        utrNumber: utrNumber.trim()
      })
    }).catch((err) => console.warn("Background purchase email notification error:", err));

    try {
      await addDoc(collection(db, "clients"), clientData);
    } catch (err: any) {
      console.warn("Firestore save fallback triggered:", err);
      // Save locally to pending list if cloud write was slow or delayed
      try {
        const pending = JSON.parse(localStorage.getItem("attechfirm_pending_clients") || "[]");
        pending.push(clientData);
        localStorage.setItem("attechfirm_pending_clients", JSON.stringify(pending));
      } catch (e) {
        console.error("Local storage error:", e);
      }
    } finally {
      localStorage.setItem("attechfirm_client_session", JSON.stringify(clientData));
      toast.success("Payment submitted successfully! Redirecting to Client Portal...");
      setCheckoutLoading(false);
      setShowCheckout(false);
      router.push("/client");
    }
  };

  const copyUpiId = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="bg-[#030305] text-slate-100 min-h-screen relative font-sans selection:bg-slate-700 selection:text-white pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Top Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-slate-400 via-indigo-400 to-white z-[100] transition-all duration-150 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        style={{ width: `${scrollPercent}%` }}
      />

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-slate-500/10 blur-[130px]" />
        <div className="absolute top-[35%] right-0 w-[550px] h-[550px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-slate-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Modern Liquid Glass Floating Navbar */}
      <header className="sticky top-4 z-50 px-4 w-full max-w-7xl mx-auto">
        <div className="bg-black/75 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl md:rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 gap-4">
          {/* Brand/Logo Section */}
          <a href="#" className="flex items-center gap-3 group">
            <SilverLogo className="w-8 h-8 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1">
                {data.logoText}
              </span>
              <span className="text-[10px] text-slate-400 max-w-[200px] truncate hidden md:inline">
                {data.logoSub}
              </span>
            </div>
          </a>

          {/* Nav Links - Center Floating Pill Menu */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {[
              { id: "services", label: "Services" },
              { id: "founders", label: "Founders" },
              { id: "why", label: "Why Us" },
              { id: "process", label: "Process" },
              { id: "pricing", label: "Pricing" },
              { id: "faqs", label: "FAQs" },
              { id: "contact", label: "Contact" }
            ].map((link) => {
              const active = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`relative text-xs px-3.5 py-1.5 rounded-full transition-all duration-300 font-medium ${
                    active 
                      ? "text-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)] border border-white/20" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {adminMode ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[11px]">AT Tech Firm (Admin)</span>
                <button 
                  onClick={handleLogout}
                  className="ml-1 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-full transition-all"
                  title="Logout Admin"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="#contact"
                  className="hidden sm:inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
                >
                  Get Started
                </a>
              </div>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-all"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 bg-[#0a0b10]/95 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 md:hidden shadow-2xl backdrop-blur-xl z-50">
            {["services", "founders", "why", "process", "pricing", "faqs", "contact"].map((link) => (
              <a
                key={link}
                href={`#${link}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm hover:bg-white/5 rounded-xl text-slate-200 hover:text-white capitalize transition-all"
              >
                {link}
              </a>
            ))}
            <div className="h-px bg-white/10 my-1" />
            {adminMode ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut size={16} /> Logout Admin Session
              </button>
            ) : null}
          </div>
        )}
      </header>

      {/* Admin Credentials Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0c0d14] border border-white/15 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-200 shadow-inner">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Admin Authorization</h3>
                <p className="text-xs text-slate-400">Authenticate to edit website content live</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Username</label>
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Enter username (attechfirm)"
                  className="w-full bg-slate-900 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all font-mono"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Enter password (attechfirm1122)"
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Verifying Security Credentials...
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    Unlock Live Admin Editor
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[80vh] flex flex-col justify-center px-6 max-w-7xl mx-auto pt-12 md:pt-20 z-10">
        <div className="text-center max-w-3xl mx-auto space-y-8 relative">
          
          {/* Top luxury badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs text-slate-200 shadow-xl backdrop-blur-md">
            <Sparkles size={13} className="text-slate-200 animate-pulse" />
            <Editable 
              value={data.heroBadge} 
              onChange={(v) => updateValue("heroBadge", v)} 
              admin={adminMode} 
            />
          </div>

          {/* Display Header */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] tracking-tight">
            <Editable 
              value={data.heroTitleLine1} 
              onChange={(v) => updateValue("heroTitleLine1", v)} 
              admin={adminMode} 
              className="block"
            />
            <span className="text-slate-300 font-light block mt-2 italic font-serif">
              <Editable 
                value={data.heroTitleLine2} 
                onChange={(v) => updateValue("heroTitleLine2", v)} 
                admin={adminMode} 
              />
            </span>
          </h1>

          {/* Subheading Lede */}
          <p className="text-slate-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            <Editable 
              value={data.heroSubtitle} 
              onChange={(v) => updateValue("heroSubtitle", v)} 
              admin={adminMode} 
              textarea 
            />
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-slate-100 to-white text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider hover:scale-[1.03] transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] block text-center"
            >
              <Editable 
                value={data.heroPrimaryCta} 
                onChange={(v) => updateValue("heroPrimaryCta", v)} 
                admin={adminMode} 
              />
            </a>
            <a 
              href="#services" 
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-full text-xs uppercase tracking-wider border border-white/15 hover:border-white/25 transition-all block text-center backdrop-blur-md"
            >
              <Editable 
                value={data.heroSecondaryCta} 
                onChange={(v) => updateValue("heroSecondaryCta", v)} 
                admin={adminMode} 
              />
            </a>
          </div>
        </div>

        {/* Quick Stats bottom strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 border-t border-white/10 pt-10">
          {data.stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-4 bg-white/[0.04] hover:bg-white/[0.08] p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md shadow-lg"
            >
              <div className="w-11 h-11 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-slate-200">
                {stat.icon === "CheckSquare" && <CheckSquare size={19} />}
                {stat.icon === "Clock" && <Clock size={19} />}
                {stat.icon === "Heart" && <Heart size={19} />}
              </div>
              <div className="text-left flex flex-col">
                <span className="text-lg font-bold text-white">
                  <Editable 
                    value={stat.count} 
                    onChange={(v) => {
                      const updated = [...data.stats];
                      updated[idx].count = v;
                      updateValue("stats", updated);
                    }} 
                    admin={adminMode} 
                  />
                </span>
                <span className="text-xs text-slate-300">
                  <Editable 
                    value={stat.label} 
                    onChange={(v) => {
                      const updated = [...data.stats];
                      updated[idx].label = v;
                      updateValue("stats", updated);
                    }} 
                    admin={adminMode} 
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="services"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">What We Do</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Comprehensive <em className="font-serif italic font-light text-slate-300">digital services</em> for every need
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            From web development to database solutions and digital growth — we build modern, reliable digital products tailored to your goals.
          </p>
        </div>

        {/* Dynamic Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.services.map((service, idx) => (
            <div 
              key={service.id}
              className="bg-[#0b0c12]/80 hover:bg-[#10121a] backdrop-blur-md border border-white/10 hover:border-white/25 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-xl group relative hover:-translate-y-1"
            >
              {adminMode && (
                <button 
                  onClick={() => {
                    const filtered = data.services.filter((_, i) => i !== idx);
                    updateValue("services", filtered);
                    toast.info("Service card removed.");
                  }}
                  className="absolute top-4 right-4 p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all z-10"
                  title="Delete service"
                >
                  <Trash2 size={13} />
                </button>
              )}

              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">
                  Service Key: {service.id}
                </span>
                
                <h3 className="text-lg font-bold text-white leading-snug">
                  <Editable 
                    value={service.title} 
                    onChange={(v) => {
                      const updated = [...data.services];
                      updated[idx].title = v;
                      updateValue("services", updated);
                    }} 
                    admin={adminMode} 
                  />
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <Editable 
                    value={service.desc} 
                    onChange={(v) => {
                      const updated = [...data.services];
                      updated[idx].desc = v;
                      updateValue("services", updated);
                    }} 
                    admin={adminMode} 
                    textarea 
                  />
                </p>
              </div>

              {/* Tags block */}
              <div className="flex flex-wrap gap-1.5 mt-6 border-t border-white/10 pt-4">
                {service.tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="text-[10px] text-slate-200 bg-white/10 border border-white/15 px-2 py-1 rounded"
                  >
                    <Editable 
                      value={tag} 
                      onChange={(v) => {
                        const updated = [...data.services];
                        updated[idx].tags[tIdx] = v;
                        updateValue("services", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Admin Create Service Card Button */}
          {adminMode && (
            <button 
              onClick={() => {
                const newService: Service = {
                  id: `service-${Date.now().toString().slice(-4)}`,
                  title: "New Digital Service",
                  desc: "Edit description card text inside this template placeholder.",
                  tags: ["Feature 1", "Feature 2", "Feature 3"]
                };
                updateValue("services", [...data.services, newService]);
                toast.success("Added new Service card!");
              }}
              className="border border-dashed border-white/20 hover:border-amber-400/50 bg-white/5 hover:bg-amber-400/5 rounded-2xl flex flex-col items-center justify-center p-8 gap-3 text-slate-400 hover:text-amber-400 transition-all duration-300 min-h-[220px]"
            >
              <Plus size={24} />
              <span className="text-xs font-semibold uppercase tracking-wider">Add New Service Box</span>
            </button>
          )}
        </div>
      </section>

      {/* ================= FOUNDERS SECTION ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="founders"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Our Founders</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Built by <em className="font-serif italic font-light text-slate-300">visionaries</em> in technology
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            A&T TECH FIRM was founded by Tirtharaj and Aditya with a shared vision: to make modern digital technology accessible, practical and reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.founders.map((founder, idx) => (
            <div 
              key={idx} 
              className="bg-[#0b0c12]/80 border border-white/10 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-white/25 shadow-xl text-left backdrop-blur-md hover:-translate-y-1"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-300 via-slate-100 to-white text-slate-950 font-extrabold flex items-center justify-center text-xl shadow-lg border border-white/20">
                    <Editable 
                      value={founder.avatarChar} 
                      onChange={(v) => {
                        const updated = [...data.founders];
                        updated[idx].avatarChar = v;
                        updateValue("founders", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      <Editable 
                        value={founder.name} 
                        onChange={(v) => {
                          const updated = [...data.founders];
                          updated[idx].name = v;
                          updateValue("founders", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      <Editable 
                        value={founder.role} 
                        onChange={(v) => {
                          const updated = [...data.founders];
                          updated[idx].role = v;
                          updateValue("founders", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <Editable 
                    value={founder.bio} 
                    onChange={(v) => {
                      const updated = [...data.founders];
                      updated[idx].bio = v;
                      updateValue("founders", updated);
                    }} 
                    admin={adminMode} 
                    textarea 
                  />
                </p>
              </div>

              {/* Bio tags block */}
              <div className="flex flex-wrap gap-2 mt-8 border-t border-white/10 pt-6">
                {founder.tags.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="text-[10px] font-medium px-2.5 py-1 bg-white/10 border border-white/15 rounded-md text-slate-200"
                  >
                    <Editable 
                      value={tag} 
                      onChange={(v) => {
                        const updated = [...data.founders];
                        updated[idx].tags[tIdx] = v;
                        updateValue("founders", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="why"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Trusted for <em className="font-serif italic font-light text-slate-300">clarity, quality</em> and reliability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.whyChooseUs.map((reason, idx) => (
            <div 
              key={idx}
              className="bg-white/[0.04] border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all backdrop-blur-md shadow-lg hover:-translate-y-1"
            >
              <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-slate-200 mb-4">
                {reason.icon === "DollarSign" && <DollarSign size={18} />}
                {reason.icon === "PenTool" && <PenTool size={18} />}
                {reason.icon === "LifeBuoy" && <LifeBuoy size={18} />}
                {reason.icon === "Cpu" && <Cpu size={18} />}
                {reason.icon === "TrendingUp" && <TrendingUp size={18} />}
                {reason.icon === "Users" && <Users size={18} />}
              </div>

              <h3 className="text-base font-bold text-white mb-2">
                <Editable 
                  value={reason.title} 
                  onChange={(v) => {
                    const updated = [...data.whyChooseUs];
                    updated[idx].title = v;
                    updateValue("whyChooseUs", updated);
                  }} 
                  admin={adminMode} 
                />
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                <Editable 
                  value={reason.desc} 
                  onChange={(v) => {
                    const updated = [...data.whyChooseUs];
                    updated[idx].desc = v;
                    updateValue("whyChooseUs", updated);
                  }} 
                  admin={adminMode} 
                  textarea 
                />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PROCESS SECTION ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="process"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Our Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            A clear path from <em className="font-serif italic font-light text-slate-300">idea to launch</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.process.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white/[0.04] border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all backdrop-blur-md shadow-lg hover:-translate-y-1"
            >
              <span className="text-3xl font-serif italic text-slate-400 block mb-4">
                <Editable 
                  value={step.num} 
                  onChange={(v) => {
                    const updated = [...data.process];
                    updated[idx].num = v;
                    updateValue("process", updated);
                  }} 
                  admin={adminMode} 
                />
              </span>
              <h3 className="text-sm font-bold text-white mb-1.5">
                <Editable 
                  value={step.title} 
                  onChange={(v) => {
                    const updated = [...data.process];
                    updated[idx].title = v;
                    updateValue("process", updated);
                  }} 
                  admin={adminMode} 
                />
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <Editable 
                  value={step.desc} 
                  onChange={(v) => {
                    const updated = [...data.process];
                    updated[idx].desc = v;
                    updateValue("process", updated);
                  }} 
                  admin={adminMode} 
                  textarea 
                />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED PROJECT ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="projects"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Featured Project</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Real work, <em className="font-serif italic font-light text-slate-300">real outcomes</em>
          </h2>
        </div>

        <div className="bg-[#0b0c12]/80 border border-white/10 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 text-left shadow-2xl backdrop-blur-md relative group">
          <div className="space-y-6 max-w-lg">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-white/10 border border-white/15 rounded-full text-slate-200">
                <Editable 
                  value={data.featuredProject.category} 
                  onChange={(v) => {
                    const updated = { ...data.featuredProject, category: v };
                    updateValue("featuredProject", updated);
                  }} 
                  admin={adminMode} 
                />
              </span>
              <span className="text-xs text-slate-300">
                <Editable 
                  value={data.featuredProject.sub} 
                  onChange={(v) => {
                    const updated = { ...data.featuredProject, sub: v };
                    updateValue("featuredProject", updated);
                  }} 
                  admin={adminMode} 
                />
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              <Editable 
                value={data.featuredProject.title} 
                onChange={(v) => {
                  const updated = { ...data.featuredProject, title: v };
                  updateValue("featuredProject", updated);
                }} 
                admin={adminMode} 
              />
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              <Editable 
                value={data.featuredProject.desc} 
                onChange={(v) => {
                  const updated = { ...data.featuredProject, desc: v };
                  updateValue("featuredProject", updated);
                }} 
                admin={adminMode} 
                textarea 
              />
            </p>

            <div className="flex flex-wrap gap-2">
              {data.featuredProject.bullets.map((bullet, idx) => (
                <span key={idx} className="text-[11px] text-slate-200 flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <CheckSquare size={12} className="text-slate-400" />
                  <Editable 
                    value={bullet} 
                    onChange={(v) => {
                      const updated = { ...data.featuredProject };
                      updated.bullets[idx] = v;
                      updateValue("featuredProject", updated);
                    }} 
                    admin={adminMode} 
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-64 bg-white/[0.04] border border-white/10 p-6 rounded-2xl flex flex-col justify-between self-stretch">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-slate-300 block font-bold">Tech Stack</span>
              <div className="flex flex-col gap-2">
                {data.featuredProject.tech.map((techItem, idx) => (
                  <span key={idx} className="text-xs text-white bg-slate-900 border border-white/10 px-3 py-2 rounded-xl block font-medium">
                    <Editable 
                      value={techItem} 
                      onChange={(v) => {
                        const updated = { ...data.featuredProject };
                        updated.tech[idx] = v;
                        updateValue("featuredProject", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </span>
                ))}
              </div>
            </div>

            <a 
              href="#contact" 
              className="mt-8 py-3 bg-white/10 border border-white/15 hover:border-white/25 hover:bg-white/15 rounded-xl text-center text-xs font-bold uppercase text-white tracking-wider transition-all flex items-center justify-center gap-2 group/btn"
            >
              Collaborate <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="pricing"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Simple, <em className="font-serif italic font-light text-slate-300">transparent</em> packages
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Clear pricing and clearly defined services. No hidden costs, no surprises. Contact for custom scope projects.
          </p>
        </div>

        {/* 20% Discount launch banner */}
        <div className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-5 text-center max-w-4xl mx-auto relative overflow-hidden shadow-xl backdrop-blur-md">
          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-slate-200 to-slate-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-white leading-relaxed flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-white text-slate-950 text-[10px] font-black px-2 py-0.5 rounded mr-1">
              PROMO
            </span>
            20% LAUNCH DISCOUNT — LIMITED TIME OFFER — BUILD SMARTER, PAY LESS.
          </p>
        </div>

        {/* Dynamic Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.pricing.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-[#0b0c12]/80 border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-2xl backdrop-blur-md hover:-translate-y-1.5 ${
                plan.isPopular 
                  ? "border-white/30 ring-1 ring-white/20 shadow-[0_0_40px_rgba(255,255,255,0.08)] bg-[#0f111a]" 
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-slate-200 to-white text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    <Editable 
                      value={plan.title} 
                      onChange={(v) => {
                        const updated = [...data.pricing];
                        updated[idx].title = v;
                        updateValue("pricing", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1.5 leading-none">
                    <Editable 
                      value={plan.subtitle} 
                      onChange={(v) => {
                        const updated = [...data.pricing];
                        updated[idx].subtitle = v;
                        updateValue("pricing", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </p>
                </div>

                <div className="py-3 border-y border-white/10">
                  <div className="flex items-baseline gap-2">
                    {plan.originalPrice && (
                      <span className="text-slate-400 text-xs line-through">
                        <Editable 
                          value={plan.originalPrice} 
                          onChange={(v) => {
                            const updated = [...data.pricing];
                            updated[idx].originalPrice = v;
                            updateValue("pricing", updated);
                          }} 
                          admin={adminMode} 
                        />
                      </span>
                    )}
                    <span className="text-3xl font-black text-white">
                      <Editable 
                        value={plan.currentPrice} 
                        onChange={(v) => {
                          const updated = [...data.pricing];
                          updated[idx].currentPrice = v;
                          updateValue("pricing", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300">STARTING FROM / 20% OFF INCLUDED</span>
                </div>

                <ul className="space-y-2.5 text-left text-xs text-slate-200">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-none" />
                      <Editable 
                        value={feature} 
                        onChange={(v) => {
                          const updated = [...data.pricing];
                          updated[idx].features[fIdx] = v;
                          updateValue("pricing", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPlan(plan);
                  setShowCheckout(true);
                }}
                className={`mt-8 w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all block ${
                  plan.isPopular
                    ? "bg-gradient-to-r from-slate-100 to-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25"
                }`}
              >
                Choose Package
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section 
        className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10 relative z-10" 
        id="faqs"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Common Questions</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Frequently Asked <em className="font-serif italic font-light text-slate-300">Questions</em>
          </h2>
        </div>

        <div className="space-y-4 text-left">
          {data.faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-[#0b0c12]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all shadow-md"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left font-bold text-sm text-white hover:text-slate-200 transition-all"
                >
                  <span>
                    <Editable 
                      value={faq.q} 
                      onChange={(v) => {
                        const updated = [...data.faqs];
                        updated[idx].q = v;
                        updateValue("faqs", updated);
                      }} 
                      admin={adminMode} 
                    />
                  </span>
                  <div className="p-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 flex-none">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 border-t border-white/10 leading-relaxed">
                    <Editable 
                      value={faq.a} 
                      onChange={(v) => {
                        const updated = [...data.faqs];
                        updated[idx].a = v;
                        updateValue("faqs", updated);
                      }} 
                      admin={adminMode} 
                      textarea 
                    />
                  </div>
                )}
              </div>
            );
          })}

          {adminMode && (
            <button
              onClick={() => {
                const newFaq: FAQItem = {
                  q: "New Frequently Asked Question Title?",
                  a: "Provide clear answers to common questions about services, deliverables, or processes."
                };
                updateValue("faqs", [...data.faqs, newFaq]);
                toast.success("Added new FAQ Item!");
              }}
              className="w-full py-4 border border-dashed border-white/20 hover:border-amber-400/50 bg-white/5 hover:bg-amber-400/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-all"
            >
              <Plus size={16} /> Add FAQ Question
            </button>
          )}
        </div>
      </section>

      {/* ================= CONTACT FORM ================= */}
      <section 
        className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10" 
        id="contact"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Get In Touch</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Let&apos;s build something <em className="font-serif italic font-light text-slate-300">great together</em>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Have a project in mind, need a quote, or want to discuss your digital requirements? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto text-left">
          
          {/* Contact Details side */}
          <div className="space-y-8 bg-[#0b0c12]/80 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Direct Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-slate-200 flex-none">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Email</span>
                    <span className="text-xs text-white font-mono">
                      <Editable 
                        value={data.contactInfo.email} 
                        onChange={(v) => {
                          const updated = { ...data.contactInfo, email: v };
                          updateValue("contactInfo", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-slate-200 flex-none">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Phone / WhatsApp</span>
                    <span className="text-xs text-white font-mono">
                      <Editable 
                        value={data.contactInfo.phone} 
                        onChange={(v) => {
                          const updated = { ...data.contactInfo, phone: v };
                          updateValue("contactInfo", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-slate-200 flex-none">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Location</span>
                    <span className="text-xs text-white">
                      <Editable 
                        value={data.contactInfo.location} 
                        onChange={(v) => {
                          const updated = { ...data.contactInfo, location: v };
                          updateValue("contactInfo", updated);
                        }} 
                        admin={adminMode} 
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 border border-white/10 rounded-2xl space-y-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 24-48h Guaranteed Response
              </span>
              <p className="text-[11px] text-slate-300">
                Direct communication with technical founders on all project proposals.
              </p>
            </div>
          </div>

          {/* Interactive Form with Direct Firebase persistence */}
          <form 
            onSubmit={handleContactSubmit} 
            className="bg-[#0b0c12]/80 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-xl space-y-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Your Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-white/15 focus:border-white/30 rounded-xl px-4 py-3 text-xs outline-none text-white transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Email Address</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900 border border-white/15 focus:border-white/30 rounded-xl px-4 py-3 text-xs outline-none text-white transition-all font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Required Service</label>
              <select
                value={contactService}
                onChange={(e) => setContactService(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 focus:border-white/30 rounded-xl px-4 py-3 text-xs outline-none text-white transition-all cursor-pointer"
              >
                <option>Web Development</option>
                <option>Database Solutions</option>
                <option>Digital Growth</option>
                <option>Website Optimization</option>
                <option>Professional Email</option>
                <option>Payment Integration</option>
                <option>Website Maintenance</option>
                <option>Custom Features</option>
                <option>Custom Quote / Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Tell us about your project</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Describe your design, timeline or features..."
                rows={4}
                className="w-full bg-slate-900 border border-white/15 focus:border-white/30 rounded-xl p-4 text-xs outline-none text-white transition-all resize-y"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingContact}
              className="w-full py-3.5 bg-gradient-to-r from-slate-100 to-white text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submittingContact ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-white/10 px-6 max-w-7xl mx-auto text-center md:text-left relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SilverLogo className="w-6 h-6" />
            <span className="text-xs font-bold text-white tracking-widest">{data.logoText}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <a href="#services" className="hover:text-white transition-all">Services</a>
            <a href="#founders" className="hover:text-white transition-all">Founders</a>
            <a href="#pricing" className="hover:text-white transition-all">Pricing</a>
            <a href="#faqs" className="hover:text-white transition-all">FAQs</a>
            <a href="#contact" className="hover:text-white transition-all">Contact</a>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            <a href="/admin" className="hover:text-slate-300 transition-colors select-none mr-0.5" title="Admin Auth Access">©</a> 2026 A&T TECH FIRM — Building Digital Solutions for a Better Tomorrow
          </p>
        </div>
      </footer>

      {/* ================= CHECKOUT MODAL ================= */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0c14] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8 text-left">
            <button 
              onClick={() => {
                setShowCheckout(false);
                setCheckoutStep(1);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {checkoutStep === 1 ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Package Checkout</h3>
                  <p className="text-xs text-slate-400">
                    Selected Package: <strong className="text-emerald-400">{selectedPlan.title}</strong> ({selectedPlan.currentPrice})
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!checkoutName || !checkoutEmail) {
                    toast.error("Please fill in your name and email.");
                    return;
                  }
                  setCheckoutStep(2);
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Full Name *</label>
                    <input 
                      type="text" 
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address *</label>
                    <input 
                      type="email" 
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp Number (Optional)</label>
                    <input 
                      type="tel" 
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
                    >
                      <span>Proceed to UPI Payment</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {/* Step 2: UPI Scanner & Payment Options */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutStep(1)} 
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-1"
                    >
                      ← Back to Details
                    </button>
                    <h3 className="text-xl font-bold text-white tracking-tight">Scan QR or Pay via UPI</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Amount</span>
                    <span className="text-base font-extrabold text-emerald-400">{selectedPlan.currentPrice}</span>
                  </div>
                </div>

                {(() => {
                  const rawAmount = selectedPlan.currentPrice.replace(/[^0-9]/g, "");
                  const cleanAmount = rawAmount || "1499";
                  const currentUpiId = data.contactInfo.upiId || "9635996626@fam";
                  const upiUri = `upi://pay?pa=${encodeURIComponent(currentUpiId)}&pn=${encodeURIComponent("AT Tech Firm")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent("Payment for " + selectedPlan.title)}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

                  return (
                    <div className="space-y-6">
                      {/* UPI ID Banner with 1-click Copy */}
                      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Official UPI ID</span>
                          <span className="text-sm font-mono font-bold text-emerald-300">{currentUpiId}</span>
                        </div>
                        <button 
                          onClick={() => copyUpiId(currentUpiId)}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
                        >
                          {copiedUpi ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedUpi ? "Copied!" : "Copy UPI"}</span>
                        </button>
                      </div>

                      {/* Dynamic QR Code */}
                      <div className="bg-white p-4 rounded-2xl text-center max-w-[240px] mx-auto border-4 border-slate-800 shadow-xl relative group">
                        <img 
                          src={qrCodeUrl} 
                          alt="UPI QR Code" 
                          className="w-full h-auto mx-auto rounded-lg"
                        />
                        <div className="mt-2 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                          A&T TECH FIRM • {selectedPlan.currentPrice}
                        </div>
                      </div>

                      {/* Mobile Deep Link Redirect Button */}
                      <div>
                        <a 
                          href={upiUri}
                          target="_self"
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <ExternalLink size={16} />
                          <span>Pay via Installed UPI App (GPay/PhonePe/Paytm)</span>
                        </a>
                        <p className="text-[10px] text-slate-400 text-center mt-1.5">
                          Clicking this will automatically open your phone's payment app
                        </p>
                      </div>

                      {/* UTR Input Form */}
                      <form onSubmit={handleUpiPaymentSubmit} className="space-y-4 pt-2 border-t border-white/10">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                            <span>12-Digit UPI Transaction / UTR Ref ID *</span>
                            <span className="text-emerald-400 text-[9px] font-mono">From UPI App Receipt</span>
                          </label>
                          <input 
                            type="text" 
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 423156890123"
                            required
                            className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={checkoutLoading}
                          className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.3)]"
                        >
                          {checkoutLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck size={16} /> Submit Payment &amp; Open Client Portal
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Floating Admin Toolbar when logged in */}
      {adminMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0c0d14] border border-amber-400/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-[0_0_40px_rgba(251,191,36,0.25)] backdrop-blur-2xl max-w-md md:max-w-xl w-[92%]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-none shadow-md">
              <Edit size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 leading-none">
                Admin Live Editor
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">
                {hasUnsavedChanges ? "Unsaved edits in buffer" : "Synced with Firebase"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button 
              onClick={handleRestoreOriginalDetails}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 font-semibold rounded-xl text-[11px] uppercase tracking-wider transition-all"
              title="Restore all default company details"
            >
              <RotateCcw size={12} /> Reset Defaults
            </button>

            <button 
              onClick={handleSaveToDatabase}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
            >
              <Save size={13} /> Save &amp; Publish
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
              title="Exit Admin Mode"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Quick Admin Access Button when logged out (Removed to keep login portal secure/hidden) */}
    </div>
  );
}
