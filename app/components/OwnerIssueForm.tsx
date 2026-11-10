"use client";

import { useState } from "react";
import { httpClient } from "../../utils/httpClient";
import { apiError } from "./dash/ui";

export default function OwnerIssueForm({ bookingId, serviceName }: { bookingId: string; serviceName: string }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Please describe what happened (at least 10 characters).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("message", message.trim());
      if (file) fd.append("images", file);
      await httpClient.post(`/api/v1/services/${bookingId}/owner-issue`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
      setMessage("");
      setFile(null);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="text-[15px] text-brand-900/80 py-4 border-b border-brand-900/15">
        Thanks — we&apos;ve logged your report for <strong>{serviceName}</strong>. We&apos;ll review arrival logs and crew check-ins.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="py-4 border-b border-brand-900/15 space-y-3">
      <p className="text-[16px] font-semibold text-brand-950">Report a problem on this booking</p>
      <p className="text-[14px] text-brand-900/70">
        Damage, missing items, or someone who isn&apos;t your assigned team? We use your visit code, arrival time, and crew check-ins to investigate.
      </p>
      {error ? <p className="text-[14px] text-rose-700">{error}</p> : null}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="What happened?"
        className="w-full rounded-xl border border-brand-200 px-3 py-2 text-[15px]"
      />
      <label className="block text-[14px] font-semibold text-brand-800">
        Photo (optional)
        <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="h-11 px-5 rounded-full bg-brand-600 text-white text-[15px] font-semibold disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
