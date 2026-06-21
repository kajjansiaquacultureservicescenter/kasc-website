"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, Mail, Phone, Tag, Loader2, CheckCircle2, Eye, RefreshCw, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  service?: string;
  message: string;
  admin_reply?: string;
  status: "new" | "read" | "replied";
  created_at: string;
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load inquiries");
    else setInquiries(data as Inquiry[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markStatus(id: string, status: Inquiry["status"]) {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  }

  async function saveReply(id: string) {
    if (!replyText.trim()) return;
    setSavingReply(true);
    const { error } = await supabase
      .from("inquiries")
      .update({ admin_reply: replyText.trim(), status: "replied" })
      .eq("id", id);
    if (error) toast.error("Failed to save reply");
    else {
      toast.success("Reply saved and marked as replied");
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, admin_reply: replyText.trim(), status: "replied" } : i));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, admin_reply: replyText.trim(), status: "replied" } : null);
    }
    setSavingReply(false);
  }

  function selectInquiry(inq: Inquiry) {
    setSelected(inq);
    setReplyText(inq.admin_reply || "");
    if (inq.status === "new") markStatus(inq.id, "read");
  }

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#071e2e] font-display">Inquiries</h1>
          <p className="text-gray-500 text-sm mt-1">{counts.new > 0 ? `${counts.new} new` : "All caught up"}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "new", "read", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize",
              filter === f ? "bg-[#0f5070] text-white border-[#0f5070]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2d8ab8]"
            )}
          >
            {f} <span className="text-xs opacity-70">({counts[f]})</span>
            {f === "new" && counts.new > 0 && filter !== "new" && (
              <span className="w-2 h-2 rounded-full bg-red-500 ml-0.5" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#0f5070]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <MessageSquare size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No inquiries found.</p>
              </div>
            ) : filtered.map((inq) => (
              <button
                key={inq.id}
                onClick={() => selectInquiry(inq)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all hover:shadow-sm",
                  selected?.id === inq.id ? "border-[#2d8ab8] bg-[#eef8fd]" : "bg-white border-gray-100",
                  inq.status === "new" && "border-l-4 border-l-[#0f5070]"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f5070] to-[#226640] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {inq.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#071e2e] truncate">{inq.name}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-medium shrink-0",
                        inq.status === "new" ? "bg-[#eef8fd] text-[#0f5070]" :
                        inq.status === "replied" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {inq.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">{inq.subject || inq.message.slice(0, 45)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 ml-11">
                  {inq.service && <span className="flex items-center gap-1"><Tag size={10} />{inq.service}</span>}
                  <span className="flex items-center gap-1 ml-auto"><Clock size={10} />{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-[#071e2e] font-display text-lg">{selected.name}</h2>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-1 text-xs text-[#0f5070] hover:underline">
                        <Mail size={11} />{selected.email}
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="flex items-center gap-1 text-xs text-[#0f5070] hover:underline">
                          <Phone size={11} />{selected.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markStatus(selected.id, "replied")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selected.status === "replied"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-[#226640] hover:text-[#226640]"
                      )}
                    >
                      <CheckCircle2 size={12} className="inline mr-1" />Replied
                    </button>
                  </div>
                </div>

                {selected.subject && (
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</span>
                    <div className="text-sm text-[#071e2e] font-medium mt-0.5">{selected.subject}</div>
                  </div>
                )}
                {selected.service && (
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</span>
                    <div className="text-sm text-[#071e2e] mt-0.5">{selected.service}</div>
                  </div>
                )}

                <div className="mb-5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</span>
                  <div className="mt-2 p-4 rounded-xl bg-[#f8fafc] border border-gray-100 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                {/* Admin reply notes */}
                <div className="mb-5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin Reply Notes</span>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Record your reply here for reference..."
                    className="mt-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d8ab8] resize-none"
                  />
                  <button
                    onClick={() => saveReply(selected.id)}
                    disabled={savingReply || !replyText.trim()}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#226640] text-white text-xs font-semibold hover:bg-[#1a5032] disabled:opacity-50 transition-all"
                  >
                    {savingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Save & mark replied
                  </button>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your Inquiry"}`}
                    onClick={() => markStatus(selected.id, "replied")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0f5070] text-white text-sm font-semibold hover:bg-[#0d3f5a] transition-all"
                  >
                    <Mail size={14} /> Reply via Email
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bc5a] transition-all"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Eye size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select an inquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
