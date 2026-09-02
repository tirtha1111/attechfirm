"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, LogOut, Save, RotateCcw, ShieldCheck, Mail, Phone, MapPin, 
  Trash2, Plus, Edit, List, CheckCircle, Database, Users, DollarSign, 
  HelpCircle, MessageSquare, Globe, ArrowLeft, RefreshCw, Eye, EyeOff, Check
} from "lucide-react";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, onSnapshot } from "firebase/firestore";
import { signInWithPopup, signOut } from "firebase/auth";
import { Toaster, toast } from "sonner";
import { db, auth, googleProvider } from "@/lib/firebase";
import { PageData, INITIAL_PAGE_DATA, Service, Founder, WhyReason, ProcessStep, PricingPlan, FAQItem } from "@/lib/types";

// Types for Contact Leads stored in Firestore
interface ContactLead {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
}

interface ClientOrder {
  id: string;
  name: string;
  email: string;
  planTitle: string;
  amount: string;
  paymentId: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [data, setData] = useState<PageData>(INITIAL_PAGE_DATA);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [clients, setClients] = useState<ClientOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "modules" | "leads" | "clients">("general");
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [leadsTrigger, setLeadsTrigger] = useState(0);

  // Auth States
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("attechfirm_admin_auth") === "true";
    }
    return false;
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Sub-module selections/states
  const [moduleTab, setModuleTab] = useState<"services" | "founders" | "pricing" | "faqs" | "why" | "project">("services");

  // Sync real-time page content
  useEffect(() => {
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
      }
      setLoading(false);
    }, (err) => {
      console.warn("Firestore listener error on Admin side:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch submitted leads/contacts
  useEffect(() => {
    if (!authenticated) return;

    let isMounted = true;
    const fetchLeadsAndClients = async () => {
      // Async defer
      await Promise.resolve();
      if (!isMounted) return;
      setLeadsLoading(true);
      setClientsLoading(true);
      
      try {
        const qSnap = await getDocs(collection(db, "contacts"));
        const list: ContactLead[] = [];
        qSnap.forEach((d) => {
          const item = d.data();
          list.push({
            id: d.id,
            name: item.name || "Anonymous",
            email: item.email || "No email",
            service: item.service || "Unspecified",
            message: item.message || "",
            createdAt: item.createdAt || new Date().toISOString()
          });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (isMounted) setLeads(list);
      } catch (err) {
        console.warn("Error loading leads:", err);
      } finally {
        if (isMounted) setLeadsLoading(false);
      }

      try {
        const clientSnap = await getDocs(collection(db, "clients"));
        const clientList: ClientOrder[] = [];
        clientSnap.forEach((d) => {
          const item = d.data();
          clientList.push({
            id: d.id,
            name: item.name || "Anonymous",
            email: item.email || "No email",
            planTitle: item.planTitle || "Unknown Plan",
            amount: item.amount || "0",
            paymentId: item.paymentId || "None",
            status: item.status || "development",
            createdAt: item.createdAt || new Date().toISOString()
          });
        });
        clientList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (isMounted) setClients(clientList);
      } catch (err) {
        console.warn("Error loading clients:", err);
      } finally {
        if (isMounted) setClientsLoading(false);
      }
    };

    fetchLeadsAndClients();

    return () => {
      isMounted = false;
    };
  }, [authenticated, leadsTrigger]);

  // Authenticate against Google
  const [showPasscodeFallback, setShowPasscodeFallback] = useState(false);
  const [fallbackPasscode, setFallbackPasscode] = useState("");

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user.email === "attechfirm@gmail.com") {
        setAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("attechfirm_admin_auth", "true");
        }
        toast.success("Successfully logged into Admin Panel!");
      } else {
        await signOut(auth);
        toast.error("Access denied. This account is not authorized.");
      }
    } catch (err: any) {
      console.warn("Auth check failed:", err);
      setShowPasscodeFallback(true);
      const errorCode = err?.code || "";
      if (errorCode === "auth/unauthorized-domain") {
        toast.error("Google Sign-In Domain Limitation: This custom/preview domain is not authorized in Firebase settings. Please use the secure fallback code.", {
          duration: 10000
        });
      } else {
        toast.error(`Authentication failed. You can use the secure passcode fallback below.`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (fallbackPasscode === "attechfirm1122") {
      setAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("attechfirm_admin_auth", "true");
      }
      toast.success("Logged in successfully via secure fallback!");
    } else {
      toast.error("Invalid passcode. Access denied.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthenticated(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("attechfirm_admin_auth");
      }
      toast.info("Logged out of Admin session.");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Push latest PageData structure to Firestore
  const handleSaveAll = async () => {
    const toastId = toast.loading("Publishing all changes to Firebase database...");
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

      toast.success("All sections published live!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to publish content changes.", { id: toastId });
    }
  };

  // Reset page layout content back to standard default fields
  const handleResetDefaults = async () => {
    if (confirm("Are you sure you want to reset all content to system defaults? Any unsaved edits will be lost.")) {
      const toastId = toast.loading("Resetting page modules to original default details...");
      try {
        setData(INITIAL_PAGE_DATA);
        const docRef = doc(db, "pageData", "main");
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout. Please check your internet connection.")), 15000)
        );

        await Promise.race([
          setDoc(docRef, {
            ...INITIAL_PAGE_DATA,
            updatedAt: new Date().toISOString()
          }),
          timeoutPromise
        ]);

        toast.success("All site content reset and updated on Firebase!", { id: toastId });
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to restore default records.", { id: toastId });
      }
    }
  };

  // Delete lead record from Firestore
  const handleDeleteLead = async (id: string) => {
    if (confirm("Delete this submitted contact lead permanently?")) {
      try {
        await deleteDoc(doc(db, "contacts", id));
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast.success("Lead submission removed successfully.");
      } catch (err) {
        console.warn("Delete lead error:", err);
        toast.error("Could not delete contact item.");
      }
    }
  };

  // Content array manipulation helpers
  const handleAddService = () => {
    const newService: Service = {
      id: `service-${Date.now().toString().slice(-4)}`,
      title: "New Custom Service",
      desc: "Fully custom description built around requirements.",
      tags: ["Tech", "Custom"]
    };
    setData((prev) => ({ ...prev, services: [...prev.services, newService] }));
    toast.success("New service item added to bottom of module.");
  };

  const handleAddPricing = () => {
    const newPlan: PricingPlan = {
      title: "New Plan Package",
      subtitle: "CUSTOM BUNDLE",
      originalPrice: "₹14,999+",
      currentPrice: "₹11,999+",
      features: ["Custom feature 1", "Custom feature 2"]
    };
    setData((prev) => ({ ...prev, pricing: [...prev.pricing, newPlan] }));
    toast.success("New pricing plan added to package list.");
  };

  const handleAddFAQ = () => {
    const newFaq: FAQItem = {
      q: "Enter Frequently Asked Question Here?",
      a: "Enter complete detailed answer here."
    };
    setData((prev) => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
    toast.success("New FAQ row added.");
  };

  if (!authenticated) {
    return (
      <div className="bg-[#030305] text-slate-100 min-h-screen flex items-center justify-center p-4 relative font-sans selection:bg-slate-700 selection:text-white">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-slate-500/10 blur-[130px]" />
        </div>

        <Toaster position="top-right" theme="dark" closeButton />

        <div className="bg-[#0c0d14] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left z-10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white uppercase tracking-wider">Admin Portal</h3>
                <p className="text-xs text-slate-400">A&T TECH FIRM Management</p>
              </div>
            </div>
            <a 
              href="/" 
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs transition-all flex items-center gap-1 border border-white/5"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </a>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <h3 className="text-xl font-bold text-white">Admin Portal</h3>
            <p className="text-sm text-slate-400">Please sign in with authorized Google account</p>
            
            <button 
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full mt-2 py-3.5 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              )}
              Sign in with Google
            </button>

            {/* Backup/Fallback Options Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-[#0c0d14] px-3 text-slate-500">Or Backup Options</span>
              </div>
            </div>

            {showPasscodeFallback ? (
              <form onSubmit={handlePasscodeLogin} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Backup Passcode</label>
                  <input
                    type="password"
                    value={fallbackPasscode}
                    onChange={(e) => setFallbackPasscode(e.target.value)}
                    placeholder="Enter backup passcode"
                    className="w-full bg-slate-950 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none text-white transition-all font-mono"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Verify Backup Passcode
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowPasscodeFallback(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
              >
                Use Backup Passcode Fallback
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030305] text-slate-100 min-h-screen relative font-sans selection:bg-slate-700 selection:text-white flex flex-col">
      <Toaster position="top-right" theme="dark" closeButton />

      {/* Header bar */}
      <header className="bg-black/60 border-b border-white/10 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black tracking-widest text-white uppercase">A&T Tech Firm</h1>
              <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Super Admin Console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs transition-all flex items-center gap-1.5 border border-white/5"
            >
              <ArrowLeft size={13} /> View Website
            </a>

            <button 
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Reset Defaults
            </button>

            <button 
              onClick={handleSaveAll}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Save size={13} /> Save &amp; Publish
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl border border-white/5 text-slate-400 transition-all"
              title="Logout session"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Controls */}
        <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-4 space-y-2 lg:sticky lg:top-24">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Admin Tabs</p>
          
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === "general" 
                ? "bg-amber-400 text-slate-950 font-bold shadow-md" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Globe size={15} /> General Landing Info
          </button>

          <button 
            onClick={() => setActiveTab("modules")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
              activeTab === "modules" 
                ? "bg-amber-400 text-slate-950 font-bold shadow-md" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <List size={15} /> Section Modules Editor
          </button>

          <button 
            onClick={() => setActiveTab("leads")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 justify-between transition-all ${
              activeTab === "leads" 
                ? "bg-amber-400 text-slate-950 font-bold shadow-md" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={15} />
              <span>Contact Form Leads</span>
            </div>
            {leads.length > 0 && (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === "leads" ? "bg-slate-950 text-amber-400" : "bg-amber-400 text-slate-950"}`}>
                {leads.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("clients")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 justify-between transition-all ${
              activeTab === "clients" 
                ? "bg-amber-400 text-slate-950 font-bold shadow-md" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign size={15} />
              <span>Paid Orders &amp; Clients</span>
            </div>
            {clients.length > 0 && (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === "clients" ? "bg-slate-950 text-amber-400" : "bg-amber-400 text-slate-950"}`}>
                {clients.length}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: GENERAL PAGE FIELDS */}
          {activeTab === "general" && (
            <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Globe size={16} className="text-amber-400" />
                  Website General Branding
                </h2>
                <p className="text-xs text-slate-400">Configure core typography values, navigation headers, and metadata</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo Headline text</label>
                  <input
                    type="text"
                    value={data.logoText}
                    onChange={(e) => updateValue("logoText", e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo Subtitle phrase</label>
                  <input
                    type="text"
                    value={data.logoSub}
                    onChange={(e) => updateValue("logoSub", e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-5">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Hero Call-To-Action</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Floating Badge Text</label>
                    <input
                      type="text"
                      value={data.heroBadge}
                      onChange={(e) => updateValue("heroBadge", e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary CTA Title</label>
                    <input
                      type="text"
                      value={data.heroPrimaryCta}
                      onChange={(e) => updateValue("heroPrimaryCta", e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary CTA Title</label>
                    <input
                      type="text"
                      value={data.heroSecondaryCta}
                      onChange={(e) => updateValue("heroSecondaryCta", e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hero Title Line 1</label>
                  <input
                    type="text"
                    value={data.heroTitleLine1}
                    onChange={(e) => updateValue("heroTitleLine1", e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hero Title Line 2 (Italic Font)</label>
                  <input
                    type="text"
                    value={data.heroTitleLine2}
                    onChange={(e) => updateValue("heroTitleLine2", e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hero Subtitle Paragraph Description</label>
                  <textarea
                    value={data.heroSubtitle}
                    onChange={(e) => updateValue("heroSubtitle", e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-5">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Contact &amp; Location details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Email ID</label>
                    <input
                      type="email"
                      value={data.contactInfo.email}
                      onChange={(e) => {
                        const updated = { ...data.contactInfo, email: e.target.value };
                        updateValue("contactInfo", updated);
                      }}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Phone Number</label>
                    <input
                      type="text"
                      value={data.contactInfo.phone}
                      onChange={(e) => {
                        const updated = { ...data.contactInfo, phone: e.target.value };
                        updateValue("contactInfo", updated);
                      }}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Office Location / Region</label>
                    <input
                      type="text"
                      value={data.contactInfo.location}
                      onChange={(e) => {
                        const updated = { ...data.contactInfo, location: e.target.value };
                        updateValue("contactInfo", updated);
                      }}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Website Domain URL</label>
                    <input
                      type="text"
                      value={data.contactInfo.website}
                      onChange={(e) => {
                        const updated = { ...data.contactInfo, website: e.target.value };
                        updateValue("contactInfo", updated);
                      }}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODULES EDITOR */}
          {activeTab === "modules" && (
            <div className="space-y-6">
              {/* Floating micro tab list */}
              <div className="flex items-center gap-1.5 bg-[#0c0d14] border border-white/10 p-1.5 rounded-2xl flex-wrap">
                {[
                  { id: "services", label: "Services List", icon: <Database size={12} /> },
                  { id: "founders", label: "Founders Profile", icon: <Users size={12} /> },
                  { id: "pricing", label: "Pricing Packages", icon: <DollarSign size={12} /> },
                  { id: "faqs", label: "FAQ Q&A Rows", icon: <HelpCircle size={12} /> },
                  { id: "why", label: "Why Us Highlights", icon: <Globe size={12} /> },
                  { id: "project", label: "Featured Project", icon: <CheckCircle size={12} /> }
                ].map((mt) => (
                  <button
                    key={mt.id}
                    onClick={() => setModuleTab(mt.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                      moduleTab === mt.id 
                        ? "bg-amber-400 text-slate-950 shadow-sm" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {mt.icon}
                    <span>{mt.label}</span>
                  </button>
                ))}
              </div>

              {/* MODULE: SERVICES */}
              {moduleTab === "services" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">Services Module Editor</h2>
                      <p className="text-xs text-slate-400">Manage digital service offerings highlighted on the page</p>
                    </div>
                    <button 
                      onClick={handleAddService}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={13} /> Add Service Box
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    {data.services.map((service, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative space-y-3">
                        <button 
                          onClick={() => {
                            const updated = data.services.filter((_, i) => i !== idx);
                            updateValue("services", updated);
                            toast.info("Deleted service item.");
                          }}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Service Unique Key</label>
                          <input 
                            type="text" 
                            value={service.id}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].id = e.target.value;
                              updateValue("services", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Headline Title</label>
                          <input 
                            type="text" 
                            value={service.title}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].title = e.target.value;
                              updateValue("services", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Service Description Card Paragraph</label>
                          <textarea 
                            value={service.desc}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].desc = e.target.value;
                              updateValue("services", updated);
                            }}
                            rows={2}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bullet Sub-features (Comma Separated)</label>
                          <input 
                            type="text" 
                            value={service.tags.join(", ")}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                              updateValue("services", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE: FOUNDERS */}
              {moduleTab === "founders" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Founders Team Profiles</h2>
                    <p className="text-xs text-slate-400">Edit company founder names, background tags and expertise descriptions</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-5">
                    {data.founders.map((founder, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avatar Icon Char</label>
                            <input 
                              type="text" 
                              maxLength={1}
                              value={founder.avatarChar}
                              onChange={(e) => {
                                const updated = [...data.founders];
                                updated[idx].avatarChar = e.target.value;
                                updateValue("founders", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-center"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Founder Name</label>
                            <input 
                              type="text" 
                              value={founder.name}
                              onChange={(e) => {
                                const updated = [...data.founders];
                                updated[idx].name = e.target.value;
                                updateValue("founders", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Corporate Role Designation</label>
                          <input 
                            type="text" 
                            value={founder.role}
                            onChange={(e) => {
                              const updated = [...data.founders];
                              updated[idx].role = e.target.value;
                              updateValue("founders", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Founder Biography &amp; Scope</label>
                          <textarea 
                            value={founder.bio}
                            onChange={(e) => {
                              const updated = [...data.founders];
                              updated[idx].bio = e.target.value;
                              updateValue("founders", updated);
                            }}
                            rows={4}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Expertise Tags (Comma Separated)</label>
                          <input 
                            type="text" 
                            value={founder.tags.join(", ")}
                            onChange={(e) => {
                              const updated = [...data.founders];
                              updated[idx].tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                              updateValue("founders", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE: PRICING PLANS */}
              {moduleTab === "pricing" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">Pricing Plans &amp; Packages</h2>
                      <p className="text-xs text-slate-400">Manage client budget tiers and featured options</p>
                    </div>
                    <button 
                      onClick={handleAddPricing}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={13} /> Add Plan Package
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    {data.pricing.map((plan, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative space-y-3">
                        <button 
                          onClick={() => {
                            const updated = data.pricing.filter((_, i) => i !== idx);
                            updateValue("pricing", updated);
                            toast.info("Deleted pricing plan package.");
                          }}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-all"
                          title="Delete Plan"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Plan Title Headline</label>
                            <input 
                              type="text" 
                              value={plan.title}
                              onChange={(e) => {
                                const updated = [...data.pricing];
                                updated[idx].title = e.target.value;
                                updateValue("pricing", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sub-headline Category</label>
                            <input 
                              type="text" 
                              value={plan.subtitle}
                              onChange={(e) => {
                                const updated = [...data.pricing];
                                updated[idx].subtitle = e.target.value;
                                updateValue("pricing", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Original Cost (struck)</label>
                            <input 
                              type="text" 
                              value={plan.originalPrice}
                              onChange={(e) => {
                                const updated = [...data.pricing];
                                updated[idx].originalPrice = e.target.value;
                                updateValue("pricing", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Promo Launch Price</label>
                            <input 
                              type="text" 
                              value={plan.currentPrice}
                              onChange={(e) => {
                                const updated = [...data.pricing];
                                updated[idx].currentPrice = e.target.value;
                                updateValue("pricing", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Highlight Starred</label>
                            <select 
                              value={plan.isPopular ? "true" : "false"}
                              onChange={(e) => {
                                const updated = [...data.pricing];
                                updated[idx].isPopular = e.target.value === "true";
                                updateValue("pricing", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                            >
                              <option value="false">Standard No-Badge</option>
                              <option value="true">Popular Highlight (Amber)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Plan Included Features (Comma Separated)</label>
                          <textarea 
                            value={plan.features.join(", ")}
                            onChange={(e) => {
                              const updated = [...data.pricing];
                              updated[idx].features = e.target.value.split(",").map(f => f.trim()).filter(Boolean);
                              updateValue("pricing", updated);
                            }}
                            rows={3}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE: FAQS */}
              {moduleTab === "faqs" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
                      <p className="text-xs text-slate-400">Configure public FAQ answers on website</p>
                    </div>
                    <button 
                      onClick={handleAddFAQ}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={13} /> Add FAQ Item
                    </button>
                  </div>

                  <div className="space-y-4 border-t border-white/5 pt-5">
                    {data.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl relative space-y-3">
                        <button 
                          onClick={() => {
                            const updated = data.faqs.filter((_, i) => i !== idx);
                            updateValue("faqs", updated);
                            toast.info("FAQ row removed.");
                          }}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-all"
                          title="Delete FAQ"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Question Title Text</label>
                          <input 
                            type="text" 
                            value={faq.q}
                            onChange={(e) => {
                              const updated = [...data.faqs];
                              updated[idx].q = e.target.value;
                              updateValue("faqs", updated);
                            }}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Answer Detailed Content</label>
                          <textarea 
                            value={faq.a}
                            onChange={(e) => {
                              const updated = [...data.faqs];
                              updated[idx].a = e.target.value;
                              updateValue("faqs", updated);
                            }}
                            rows={2}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE: WHY CHOOSE US */}
              {moduleTab === "why" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Why Choose Us Reason Modules</h2>
                    <p className="text-xs text-slate-400">Configure key business selling highlights</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    {data.whyChooseUs.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Highlight Header</label>
                            <input 
                              type="text" 
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...data.whyChooseUs];
                                updated[idx].title = e.target.value;
                                updateValue("whyChooseUs", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">System Icon Code Name</label>
                            <select 
                              value={item.icon}
                              onChange={(e) => {
                                const updated = [...data.whyChooseUs];
                                updated[idx].icon = e.target.value;
                                updateValue("whyChooseUs", updated);
                              }}
                              className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                            >
                              <option value="DollarSign">DollarSign Icon</option>
                              <option value="PenTool">PenTool Icon</option>
                              <option value="LifeBuoy">LifeBuoy Support Icon</option>
                              <option value="Cpu">Cpu Tech Icon</option>
                              <option value="TrendingUp">TrendingUp Growth Icon</option>
                              <option value="Users">Users Client Icon</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Description text</label>
                          <textarea 
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...data.whyChooseUs];
                              updated[idx].desc = e.target.value;
                              updateValue("whyChooseUs", updated);
                            }}
                            rows={2}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE: FEATURED PROJECT */}
              {moduleTab === "project" && (
                <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Featured Project Section</h2>
                    <p className="text-xs text-slate-400">Configure case studies highlighted on page</p>
                  </div>

                  <div className="space-y-4 border-t border-white/5 pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Project Category</label>
                        <input 
                          type="text" 
                          value={data.featuredProject.category}
                          onChange={(e) => {
                            const updated = { ...data.featuredProject, category: e.target.value };
                            updateValue("featuredProject", updated);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Company Subtitle</label>
                        <input 
                          type="text" 
                          value={data.featuredProject.sub}
                          onChange={(e) => {
                            const updated = { ...data.featuredProject, sub: e.target.value };
                            updateValue("featuredProject", updated);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Project Heading title</label>
                        <input 
                          type="text" 
                          value={data.featuredProject.title}
                          onChange={(e) => {
                            const updated = { ...data.featuredProject, title: e.target.value };
                            updateValue("featuredProject", updated);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Detailed Description card paragraph</label>
                      <textarea 
                        value={data.featuredProject.desc}
                        onChange={(e) => {
                          const updated = { ...data.featuredProject, desc: e.target.value };
                          updateValue("featuredProject", updated);
                        }}
                        rows={3}
                        className="w-full bg-slate-950 border border-white/5 rounded-lg p-3 text-xs text-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deliverables Bullets (Comma Separated)</label>
                        <input 
                          type="text" 
                          value={data.featuredProject.bullets.join(", ")}
                          onChange={(e) => {
                            const updated = { 
                              ...data.featuredProject, 
                              bullets: e.target.value.split(",").map(b => b.trim()).filter(Boolean) 
                            };
                            updateValue("featuredProject", updated);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tech Stack Tags (Comma Separated)</label>
                        <input 
                          type="text" 
                          value={data.featuredProject.tech.join(", ")}
                          onChange={(e) => {
                            const updated = { 
                              ...data.featuredProject, 
                              tech: e.target.value.split(",").map(t => t.trim()).filter(Boolean) 
                            };
                            updateValue("featuredProject", updated);
                          }}
                          className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT FORM LEADS */}
          {activeTab === "leads" && (
            <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-400" />
                    Submitted Client Leads
                  </h2>
                  <p className="text-xs text-slate-400">View real-time customer inquiries from contact forms</p>
                </div>
                <button 
                  onClick={() => setLeadsTrigger((prev) => prev + 1)}
                  disabled={leadsLoading}
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5"
                  title="Reload Inquiries"
                >
                  <RefreshCw size={14} className={leadsLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {leadsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Syncing Contact list...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-slate-400">
                  <MessageSquare size={36} className="mx-auto opacity-30 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">No Leads Found</h3>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Submitted messages from your site's contact forms will sync and display here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="bg-slate-900/50 border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between md:flex-row gap-4 transition-all">
                      <div className="space-y-3 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                          <span className="text-[9px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                            {lead.service}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <a href={`mailto:${lead.email}`} className="hover:underline text-slate-300 font-medium">
                              {lead.email}
                            </a>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Submitted: {new Date(lead.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-950/80 rounded-xl p-3 text-xs text-slate-300 border border-white/5 leading-relaxed italic">
                          "{lead.message || "No custom message provided."}"
                        </div>
                      </div>

                      <div className="flex items-start justify-end">
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all flex items-center justify-center"
                          title="Delete Lead permanently"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* TAB 4: CLIENTS / ORDERS */}
          {activeTab === "clients" && (
            <div className="bg-[#0c0d14] border border-white/10 rounded-2xl p-6 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    Paid Orders &amp; Clients
                  </h2>
                  <p className="text-xs text-slate-400">View real-time confirmed payments and active development projects</p>
                </div>
                <button 
                  onClick={() => setLeadsTrigger((prev) => prev + 1)}
                  disabled={clientsLoading}
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/5"
                  title="Reload Clients"
                >
                  <RefreshCw size={14} className={clientsLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {clientsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw size={24} className="animate-spin text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Syncing Client list...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-slate-400">
                  <DollarSign size={36} className="mx-auto opacity-30 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">No Paid Clients Yet</h3>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Users who purchase a package via the website checkout will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="bg-slate-900/50 border border-emerald-500/10 hover:border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between md:flex-row gap-4 transition-all">
                      <div className="space-y-3 text-left w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-sm font-bold text-white">{client.name}</h4>
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                              Paid
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">{client.amount}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{client.paymentId}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            <a href={`mailto:${client.email}`} className="hover:underline text-slate-300 font-medium">
                              {client.email}
                            </a>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Purchased: {new Date(client.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-950/80 rounded-xl p-3 text-xs text-emerald-300 border border-emerald-500/10 leading-relaxed font-semibold">
                          Selected Package: {client.planTitle}
                          <br/>
                          <span className="text-[10px] font-normal text-slate-400 mt-1 block">Status: {client.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
