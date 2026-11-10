"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, UserCircle2, Plus } from "lucide-react";
import Image from "next/image";
import { httpClient } from "../../utils/httpClient";
import { Panel, DataTable, Drawer, Button, Notice, Empty, apiError } from "../components/dash/ui";
import Select from "../components/Select";

const DOC_TYPES = [
  { value: "nin", label: "NIN" },
  { value: "voters_card", label: "Voter's card" },
  { value: "drivers_licence", label: "Driver's licence" },
  { value: "passport", label: "Passport" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

const input =
  "h-10 w-full rounded-lg bg-white px-3 text-[14px] text-stone-900 ring-1 ring-inset ring-stone-300 !border-0 !shadow-none outline-none focus:ring-2 focus:ring-brand-600";

function Field({ label, children, hint = "" }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-stone-800">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[12px] text-stone-500">{hint}</span> : null}
    </label>
  );
}

const BLANK = { firstName: "", lastName: "", phone: "", bvn: "", notes: "" };

export default function EmployeesSection() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [docType, setDocType] = useState("nin");
  const [docLabel, setDocLabel] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await httpClient.get("/api/v1/employees?active=false");
      setRows(data.data || []);
      setError("");
    } catch (err) {
      setError(apiError(err));
      setRows([]);
    }
  }, []);

  const loadOne = async (employeeId: string) => {
    const { data } = await httpClient.get(`/api/v1/employees/${employeeId}`);
    setDetail(data.data);
    return data.data;
  };

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(BLANK);
    setFormError("");
    setDetail(null);
    setEditing("new");
  };

  const openEdit = async (row: any) => {
    setFormError("");
    setEditing(row.employee_id);
    const d = await loadOne(row.employee_id);
    setForm({
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone || "",
      bvn: d.bvn || "",
      notes: d.notes || "",
    });
  };

  const save = async () => {
    setSaving(true);
    setFormError("");
    try {
      const body = {
        ...form,
        bvn: form.bvn.replace(/\D/g, ""),
      };
      if (editing === "new") {
        await httpClient.post("/api/v1/employees", body);
      } else {
        await httpClient.patch(`/api/v1/employees/${editing}`, body);
      }
      await load();
      if (editing !== "new") await loadOne(editing as string);
      setEditing(null);
    } catch (err) {
      setFormError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!editing || editing === "new") return;
    const fd = new FormData();
    fd.append("image", file);
    await httpClient.post(`/api/v1/employees/${editing}/photo`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await loadOne(editing as string);
    await load();
  };

  const uploadDoc = async (file: File) => {
    if (!editing || editing === "new") return;
    const fd = new FormData();
    fd.append("image", file);
    fd.append("docType", docType);
    fd.append("label", docLabel);
    await httpClient.post(`/api/v1/employees/${editing}/documents`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setDocLabel("");
    await loadOne(editing as string);
    await load();
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (r: any) => (
        <div className="flex items-center gap-2">
          {r.profilePhotoUrl ? (
            <Image src={r.profilePhotoUrl} alt="" width={32} height={32} className="rounded-full object-cover h-8 w-8" />
          ) : (
            <UserCircle2 size={32} className="text-stone-300" />
          )}
          <span className="font-medium text-stone-900">{r.fullName}</span>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (r: any) => r.phone || "—" },
    { key: "bvn", label: "BVN", render: (r: any) => <span className="font-mono text-[13px]">{r.bvnMasked}</span> },
    {
      key: "docs",
      label: "Documents",
      render: (r: any) => <span className="text-stone-600">{r.documentCount}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r: any) => (
        <span className={r.status === "active" ? "text-emerald-700 font-semibold" : "text-stone-500"}>
          {r.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
  <div className="space-y-4">
      {error ? <Notice onClose={() => setError("")}>{error}</Notice> : null}
      <Panel
        title="Kliner employees"
        action={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} /> Add employee
          </Button>
        }
      >
        {rows === null ? (
          <p className="text-stone-500 text-[14px]">Loading roster…</p>
        ) : rows.length === 0 ? (
          <Empty icon={UserCircle2} title="No employees yet" text="Add your field team with BVN and ID documents." />
        ) : (
          <DataTable rows={rows} columns={columns} onRowClick={openEdit} rowKey={(r) => r.employee_id} />
        )}
      </Panel>

      <Drawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New employee" : detail?.fullName || "Employee"}
        subtitle={editing !== "new" && detail ? `ID ${detail.employee_id}` : "BVN and documents are required for field jobs."}
        footer={
          <Button disabled={saving} onClick={save}>
            {editing === "new" ? "Create employee" : "Save changes"}
          </Button>
        }
      >
        {formError ? <Notice>{formError}</Notice> : null}
        <div className="space-y-4">
          <Field label="First name">
            <input className={input} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input className={input} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="BVN" hint="11-digit Bank Verification Number. Stored securely; only admins see full BVN.">
            <input className={input} inputMode="numeric" maxLength={11} value={form.bvn} onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })} />
          </Field>
          <Field label="Notes">
            <textarea
              className={`${input} h-auto py-2`}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>

          {editing !== "new" && detail && (
            <>
              <Field label="Profile photo">
                <div className="flex items-center gap-3">
                  {detail.profilePhotoUrl ? (
                    <Image src={detail.profilePhotoUrl} alt="" width={56} height={56} className="rounded-xl object-cover h-14 w-14" />
                  ) : (
                    <UserCircle2 size={56} className="text-stone-200" />
                  )}
                  <label className="cursor-pointer">
                    <span className="text-[14px] font-semibold text-brand-700">Upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                  </label>
                </div>
              </Field>

              <Field label="ID & documents" hint="JPG, PNG, or PDF (max 12 MB).">
                <div className="space-y-2 mb-3">
                  {(detail.documents || []).map((d: any) => {
                    const isPdf = d.mimeType === "application/pdf";
                    return (
                      <a
                        key={d.id}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[13px] text-brand-800 underline"
                      >
                        {isPdf ? <FileText size={16} /> : null}
                        {d.label || d.docType}
                        {isPdf ? " (PDF)" : ""}
                      </a>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Select value={docType} onChange={setDocType} options={DOC_TYPES} />
                  <input className={input} placeholder="Label (optional)" value={docLabel} onChange={(e) => setDocLabel(e.target.value)} />
                </div>
                <label className="mt-2 inline-block cursor-pointer">
                  <span className="text-[14px] font-semibold text-brand-700">Upload document (photo or PDF)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])}
                  />
                </label>
              </Field>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
