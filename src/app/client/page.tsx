"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, Clock, ExternalLink } from "lucide-react";

export default function ClientDashboard() {
  const router = useRouter();
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    // Read the session/localStorage to see if they are logged in
    const stored = localStorage.getItem("attechfirm_client_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setClientData(parsed);
        }, 0);
      } catch (e) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  if (!clientData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden font-sans">
      {/* Background aesthetics */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 pt-20">
        <div className="flex items-center gap-3 mb-12">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
        </div>

        <div className="bg-[#0b0c12]/80 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back, {clientData.name}
              </h2>
              <p className="text-slate-400 text-sm">
                Plan: <strong className="text-white">{clientData.planTitle}</strong>
              </p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <CheckCircle2 size={16} />
              Payment Verified
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                  <Clock size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Project Status</h3>
                </div>
                <p className="text-lg font-medium text-white mb-2">Development is in progress.</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Our engineering team has received your payment and project details. We are currently setting up the architecture and preparing your development environment.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400 mb-4">Dedicated Support</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Need an update or want to share resources? Your technical leaders are directly reachable.
                </p>
                <div className="space-y-3">
                  <a 
                    href="mailto:realtirtharaj@gmail.com?subject=Project%20Support%20-%20A%26T%20Tech%20Firm" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-bold text-white block">Contact Tirtharaj</span>
                      <span className="text-xs text-slate-400">realtirtharaj@gmail.com</span>
                    </div>
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                  <a 
                    href="mailto:hello@attechfirm.com?subject=Project%20Support%20(Aditya)%20-%20A%26T%20Tech%20Firm" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-bold text-white block">Contact Aditya</span>
                      <span className="text-xs text-slate-400">aditya@attechfirm.com</span>
                    </div>
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
