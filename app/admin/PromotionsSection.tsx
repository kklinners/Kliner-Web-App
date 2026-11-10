"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { httpClient } from "../../utils/httpClient";
import { Panel, DataTable, Drawer, Button, Notice, Empty, StatusPill, apiError, shortDate } from "../components/dash/ui";
import PromotionCard from "../components/PromotionCard";
import Select from "../components/Select";
import { THEMES, ART_OPTIONS, SERVICE_TARGETS } from "../../utils/promotions";

const STATUS = {
  live: ["Live", "green"],
  scheduled: ["Scheduled", "sky"],
  ended: ["Ended", "neutral"],
  off: ["Off", "amber"],
};

const BLANK = { title: "", description: "", badge: "", theme: "purple", art: "none", service: "", active: true, startsAt: "", endsAt: "", sortOrder: "" };

const input = "h-10 w-full rounded-lg bg-white px-3 text-[14px] text-stone-900 ring-1 ring-inset ring-stone-300 !border-0 !shadow-none outline-none focus:ring-2 focus:ring-brand-600";
const trigger = "h-10 w-full rounded-lg bg-white px-3 text-[14px] text-stone-900 ring-1 ring-inset ring-stone-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-600";

// Dates are picked as local days. The end date runs to the end of that day.
const day = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const startIso = (v) => (v ? new Date(`${v}T00:00:00`).toISOString() : null);
const endIso = (v) => (v ? new Date(`${v}T23:59:59`).toISOString() : null);

function Field({ label, hint = "", children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-stone-800">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[12px] text-stone-500">{hint}</span>}
    </label>
  );
}

export default function PromotionsSection() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any>(null); // "new" | a promotion | null
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await httpClient.get("/api/v1/promotions/admin");
      setRows(data.data || []);
      setError("");
    } catch (err) {
      setError(apiError(err));
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const close = useCallback(() => setEditing(null), []);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const onText = (key) => (e) => set(key)(e.target.value);

  const openNew = () => {
    setForm(BLANK);
    setFormError("");
    setConfirmDelete(false);
    setEditing("new");
  };
  const openEdit = (p) => {
    setForm({
      title: p.title,
      description: p.description || "",
      badge: p.badge || "",
      theme: p.theme,
      art: p.art,
      service: p.service || "",
      active: p.active,
      startsAt: day(p.startsAt),
      endsAt: day(p.endsAt),
      sortOrder: String(p.sortOrder),
    });
    setFormError("");
    setConfirmDelete(false);
    setEditing(p);
  };

  const body = () => ({
    title: form.title,
    description: form.description,
    badge: form.badge,
    theme: form.theme,
    art: form.art,
    service: form.service,
    active: form.active,
    startsAt: startIso(form.startsAt),
    endsAt: endIso(form.endsAt),
    ...(form.sortOrder !== "" ? { sortOrder: Number(form.sortOrder) } : {}),
  });

  const save = async () => {
    setSaving(true);
    setFormError("");
    try {
      if (editing === "new") await httpClient.post("/api/v1/promotions", body());
      else await httpClient.put(`/api/v1/promotions/${editing.id}`, body());
      await load();
      close();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await httpClient.delete(`/api/v1/promotions/${editing.id}`);
      await load();
      close();
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p) => {
    try {
      await httpClient.put(`/api/v1/promotions/${p.id}`, { active: !p.active });
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const runs = (p) => {
    if (!p.startsAt && !p.endsAt) return "Until switched off";
    if (p.startsAt && p.endsAt) return `${shortDate(p.startsAt)} to ${shortDate(p.endsAt)}`;
    return p.startsAt ? `From ${shortDate(p.startsAt)}` : `Until ${shortDate(p.endsAt)}`;
  };

  const columns = [
    {
      key: "title",
      label: "Promotion",
      render: (p) => (
        <div className="min-w-0">
          <p className="font-medium text-stone-900 truncate">{p.title}</p>
          <p className="text-[13px] text-stone-500 truncate max-w-[44ch]">{[p.badge, p.description].filter(Boolean).join(" · ") || "No description"}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", mobileRight: true, render: (p) => <StatusPill map={STATUS} value={p.status} /> },
    { key: "runs", label: "Runs", hideOnMobile: true, render: (p) => <span className="text-stone-600">{runs(p)}</span> },
    { key: "order", label: "Order", align: "right", hideOnMobile: true, render: (p) => <span className="tabular-nums text-stone-600">{p.sortOrder}</span> },
    {
      key: "toggle",
      label: "",
      align: "right",
      hideOnMobile: true,
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(p);
          }}
          className="text-[13px] font-semibold text-brand-700 hover:underline"
        >
          {p.active ? "Turn off" : "Turn on"}
        </button>
      ),
    },
  ];

  const footer = (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={save} disabled={saving || form.title.trim().length < 3}>
        {saving ? "Saving…" : editing === "new" ? "Add promotion" : "Save changes"}
      </Button>
      {editing && editing !== "new" &&
        (confirmDelete ? (
          <>
            <Button variant="danger" onClick={remove} disabled={saving}>Yes, delete it</Button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="text-[13px] font-semibold text-stone-600">Keep it</button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={saving}>Delete</Button>
        ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-[14px] text-stone-600">
          Banners shown at the top of customers&apos; home screen. They&apos;re announcements only and don&apos;t change what a booking costs.
        </p>
        <Button onClick={openNew} className="self-start sm:self-auto">
          <Plus size={16} /> New promotion
        </Button>
      </div>

      {error && <Notice onClose={() => setError("")}>{error}</Notice>}

      {rows === null ? (
        <div className="h-40 animate-pulse rounded-xl bg-white ring-1 ring-stone-200" />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={openEdit}
          empty={
            <Panel>
              <Empty icon={Megaphone} title="No promotions yet" text="Add one and it shows to customers as soon as it's switched on." />
            </Panel>
          }
        />
      )}

      <Drawer open={!!editing} onClose={close} title={editing === "new" ? "New promotion" : "Edit promotion"} subtitle="What customers see is previewed below." footer={footer}>
        {formError && <Notice onClose={() => setFormError("")}>{formError}</Notice>}

        <PromotionCard promo={form} onBook={() => {}} />

        <div className="mt-6 space-y-4">
          <Field label="Title">
            <input className={input} value={form.title} onChange={onText("title")} maxLength={60} placeholder="Weekend deal" />
          </Field>
          <Field label="Details" hint={`${form.description.length}/140`}>
            <textarea className={`${input} h-auto py-2.5`} rows={2} value={form.description} onChange={onText("description")} maxLength={140} placeholder="Book any service this weekend" />
          </Field>
          <Field label="Big label" hint="Shown large, like “30% OFF” or “NEW”. It's wording only and doesn't change any prices.">
            <input className={input} value={form.badge} onChange={onText("badge")} maxLength={16} placeholder="Optional" />
          </Field>

          <div>
            <span className="text-[13px] font-semibold text-stone-800">Colour</span>
            <div className="mt-1.5 flex gap-2" role="group" aria-label="Colour">
              {Object.entries(THEMES).map(([key, t]: [string, any]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={form.theme === key}
                  onClick={() => set("theme")(key)}
                  className={`flex h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold ring-inset ${form.theme === key ? "ring-2 ring-brand-600 text-stone-900" : "ring-1 ring-stone-300 text-stone-600 hover:bg-stone-50"}`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Picture">
            <Select value={form.art} onChange={set("art")} options={ART_OPTIONS} title="Picture" triggerClassName={trigger} />
          </Field>
          <Field label="“Book now” opens" hint="Adds a Book now button that takes the customer to that service.">
            <Select value={form.service} onChange={set("service")} options={SERVICE_TARGETS} title="Book now opens" triggerClassName={trigger} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts">
              <input type="date" className={input} value={form.startsAt} onChange={onText("startsAt")} />
            </Field>
            <Field label="Ends">
              <input type="date" className={input} value={form.endsAt} min={form.startsAt || undefined} onChange={onText("endsAt")} />
            </Field>
          </div>
          <p className="-mt-2 text-[12px] text-stone-500">Leave dates empty to show it straight away and until you turn it off.</p>

          <Field label="Order" hint="Lower numbers show first. Leave empty to add it last.">
            <input type="number" min={0} max={9999} className={input} value={form.sortOrder} onChange={onText("sortOrder")} />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-stone-50 px-3 py-3 ring-1 ring-inset ring-stone-200">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active")(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            <span className="text-[14px] font-semibold text-stone-800">Show to customers</span>
          </label>
        </div>
      </Drawer>
    </div>
  );
}
