"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import BottomNavigation from "../../components/BottomNavigation";
import KlinerLoader from "../../components/KlinerLoader";
import { useAuth } from "../../../context/AuthContext";
import { httpClient } from "../../../utils/httpClient";

const EMPTY = { firstName: "", lastName: "", username: "", phone: "", address: "", city: "", state: "" };
const MAX_PHOTO_MB = 5;

const LABELS = {
  firstName: "First name",
  lastName: "Last name",
  username: "Username",
  phone: "Phone",
  address: "Street",
  city: "City",
  state: "State",
};

const toForm = (u) => Object.fromEntries(Object.keys(EMPTY).map((key) => [key, u?.[key] || ""])) as typeof EMPTY;
const errorText = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback;

const rowClass = "grid grid-cols-[104px_minmax(0,1fr)] sm:grid-cols-[168px_minmax(0,1fr)] items-center min-h-[56px] border-b border-brand-900/15";
const labelClass = "text-[15px] text-brand-900/60";
const valueClass = "text-[16px] font-semibold text-brand-950 break-words";

function SectionTitle({ children, action = null }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-brand-950 pb-2.5">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-brand-950">{children}</h2>
      {action}
    </div>
  );
}

export default function ProfilePage() {
  const { refreshUserData, logout } = useAuth();
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("loading"); // loading | ready | failed
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const photoInput = useRef(null);
  const formRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await httpClient.get(`/api/v1/user/user-info?_t=${Date.now()}`);
      if (!data.success) throw new Error("Failed");
      setInfo(data.data);
      setForm(toForm(data.data));
      setStatus("ready");
    } catch {
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (editing && focusField) {
      formRef.current?.querySelector(`input[name="${focusField}"]`)?.focus();
      setFocusField(null);
    }
  }, [editing, focusField]);

  const saved = toForm(info);
  const dirty = Object.keys(EMPTY).some((key) => form[key].trim() !== saved[key]);
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const startEditing = (field = "firstName") => {
    setFocusField(field);
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(saved);
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const missing = Object.keys(EMPTY).find((key) => !form[key].trim());
    if (missing) {
      setFocusField(missing);
      return toast.error(`${LABELS[missing]} is required`);
    }
    if (form.username.trim().length < 3) return toast.error("Username must be at least 3 characters");
    if (form.phone.replace(/\D/g, "").length < 7) return toast.error("Enter a valid phone number");

    setSaving(true);
    try {
      const { phone, ...rest } = form;
      const { data } = await httpClient.post("/api/v1/user/fill-data", { ...rest, mobile: phone });
      if (!data.success) throw new Error(data.message);
      await Promise.all([load(), refreshUserData()]);
      setEditing(false);
      toast.success("Saved");
    } catch (err) {
      toast.error(errorText(err, "Couldn't save your changes"));
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return toast.error(`Photo must be under ${MAX_PHOTO_MB}MB`);

    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await httpClient.put("/api/v1/user/update-profile-image", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!data.success) throw new Error(data.message);
      // Only the photo changed, so any edits in progress are left alone
      const fresh = await httpClient.get(`/api/v1/user/user-info?_t=${Date.now()}`);
      setInfo(fresh.data.data);
      refreshUserData();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(errorText(err, "Couldn't upload your photo"));
    } finally {
      setUploading(false);
    }
  };

  const renderRow = (field, type = "text", autoComplete = undefined) => (
    <div key={field} className={`${rowClass} ${editing ? "focus-within:border-brand-600" : ""}`}>
      <span className={labelClass}>{LABELS[field]}</span>
      {editing ? (
        <input
          name={field}
          type={type}
          value={form[field]}
          onChange={handleChange}
          autoComplete={autoComplete}
          aria-label={LABELS[field]}
          className="w-full h-[55px] bg-transparent !border-0 !shadow-none !ring-0 !outline-none p-0 text-[16px] font-semibold"
        />
      ) : saved[field] ? (
        <span className={valueClass}>{saved[field]}</span>
      ) : (
        <button type="button" onClick={() => startEditing(field)} className="text-left text-[16px] font-semibold text-brand-600">
          Add
        </button>
      )}
    </div>
  );

  const displayName = `${saved.firstName} ${saved.lastName}`.trim() || saved.username || "Your account";
  const initials = (saved.firstName[0] || saved.username[0] || info?.email?.[0] || "K").toUpperCase() + saved.lastName.slice(0, 1).toUpperCase();
  const photo = info?.profileImage?.url;

  return (
    <div className="min-h-screen bg-white lg:pl-56 pb-28 lg:pb-16">
      <Toaster />
      <BottomNavigation />

      <main className="max-w-[640px] px-5 sm:px-8 pt-10 lg:pt-16 mx-auto lg:mx-0 lg:ml-[6vw]">
        {status === "loading" && (
          <div className="flex justify-center pt-40" aria-label="Loading profile">
            <KlinerLoader size={44} tone="brand" />
          </div>
        )}

        {status === "failed" && (
          <div className="pt-24">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-brand-950">We couldn&apos;t load your account.</h1>
            <button
              onClick={() => {
                setStatus("loading");
                load();
              }}
              className="mt-4 text-[16px] font-semibold text-brand-700 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && (
          <form ref={formRef} onSubmit={handleSave} noValidate>
            <div className="flex items-center gap-5 sm:gap-7">
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                disabled={uploading}
                aria-label={photo ? "Change photo" : "Add a photo"}
                className="relative shrink-0 h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-brand-600 text-white flex items-center justify-center text-[34px] sm:text-[44px] font-bold tracking-[-0.02em] disabled:opacity-70"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                ) : (
                  initials
                )}
                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-brand-950/55">
                    <KlinerLoader size={30} />
                  </span>
                )}
              </button>
              <input ref={photoInput} type="file" accept="image/*" onChange={handlePhoto} className="hidden" aria-label="Profile photo" />

              <div className="min-w-0">
                <h1 className="text-[30px] sm:text-[44px] font-semibold tracking-[-0.03em] leading-[1.08] text-brand-950 break-words">{displayName}</h1>
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  disabled={uploading}
                  className="mt-2 text-[15px] font-semibold text-brand-700 underline underline-offset-4 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : photo ? "Change photo" : "Add a photo"}
                </button>
              </div>
            </div>

            <section className="mt-12">
              <SectionTitle
                action={
                  !editing && (
                    <button type="button" onClick={() => startEditing()} className="text-[15px] font-semibold text-brand-700 underline underline-offset-4">
                      Edit
                    </button>
                  )
                }
              >
                Your details
              </SectionTitle>
              {renderRow("firstName", "text", "given-name")}
              {renderRow("lastName", "text", "family-name")}
              {renderRow("username", "text", "username")}
              {renderRow("phone", "tel", "tel")}
              <div className={rowClass}>
                <span className={labelClass}>Email</span>
                <span className={`${valueClass} ${editing ? "!text-brand-900/50" : ""}`}>{info.email}</span>
              </div>
            </section>

            <section className="mt-12">
              <SectionTitle>Where we clean</SectionTitle>
              {renderRow("address", "text", "street-address")}
              {renderRow("city", "text", "address-level2")}
              {renderRow("state", "text", "address-level1")}
            </section>

            {editing ? (
              <div className="sticky bottom-[68px] lg:bottom-0 z-20 -mx-5 sm:mx-0 mt-8 px-5 sm:px-0 py-3 bg-white flex items-center gap-5">
                <button type="submit" disabled={saving || !dirty} className="h-12 px-8 inline-flex items-center bg-brand-600 text-white text-[16px] font-semibold hover:bg-brand-700 disabled:opacity-50">
                  {saving && <KlinerLoader size={22} className="mr-2.5" />}{saving ? "Saving" : "Save"}
                </button>
                <button type="button" onClick={cancelEditing} disabled={saving} className="text-[16px] font-semibold text-brand-900/70">
                  Cancel
                </button>
              </div>
            ) : (
              <section className="mt-12">
                <SectionTitle>Account</SectionTitle>
                <div className={rowClass}>
                  <span className={labelClass}>Password</span>
                  <Link href="/auth/forget-password" className="text-[16px] font-semibold text-brand-700">
                    Change password
                  </Link>
                </div>
                <div className={rowClass}>
                  <span className={labelClass}>Session</span>
                  <button type="button" onClick={logout} className="text-left text-[16px] font-semibold text-red-600">
                    Log out
                  </button>
                </div>
              </section>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
