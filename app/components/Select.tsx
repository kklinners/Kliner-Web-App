"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Option = string | { value: string; label: string };
const norm = (o: Option) => (typeof o === "string" ? { value: o, label: o } : o);

const DEFAULT_TRIGGER =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] font-medium text-black outline-none focus-visible:ring-2 focus-visible:ring-brand-600";

// Kliner's own dropdown. A floating list on desktop and a bottom sheet on phones, where the
// native list is hardest to use. Keyboard: arrows, Home/End, Enter, Escape, type to jump.
export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
  title,
  searchable = false,
  allowCustom = false,
  required = false,
  disabled = false,
  className = "",
  triggerClassName = DEFAULT_TRIGGER,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  title?: string;
  searchable?: boolean;
  allowCustom?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;
  const items = useMemo(() => options.map(norm), [options]);

  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxH: number } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<HTMLElement>(null);
  const typed = useRef({ text: "", timer: 0 as any });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = q ? items.filter((o) => o.label.toLowerCase().includes(q)) : items;
    const exact = items.some((o) => o.label.toLowerCase() === q);
    return allowCustom && q && !exact ? [{ value: query.trim(), label: `Use “${query.trim()}”` }, ...found] : found;
  }, [items, query, allowCustom]);

  const selected = items.find((o) => o.value === value);
  const shown = selected?.label || value;

  const place = useCallback(() => {
    const el = trigger.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const below = window.innerHeight - r.bottom - gap - 12;
    const above = r.top - gap - 12;
    const flip = below < 240 && above > below;
    const width = Math.max(r.width, 240);
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
      width,
      top: flip ? undefined : r.bottom + gap,
      bottom: flip ? window.innerHeight - r.top + gap : undefined,
      maxH: Math.max(160, Math.min(380, flip ? above : below)),
    });
  }, []);

  const openList = () => {
    if (disabled) return;
    const asSheet = window.matchMedia("(max-width: 639px)").matches;
    setSheet(asSheet);
    if (!asSheet) place(); // positioned before it appears, so it can take focus at once
    setQuery("");
    const i = items.findIndex((o) => o.value === value);
    setActive(Math.max(0, i));
    setOpen(true);
  };

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  const choose = (v: string) => {
    onChange(v);
    close(true);
  };

  useLayoutEffect(() => {
    if (open && !sheet) place();
  }, [open, sheet, place, rows.length]);

  // Focus moves into the list in the same moment it opens, so the first key press isn't lost
  useLayoutEffect(() => {
    if (open) focusTarget.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => !sheet && place();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    const before = document.body.style.overflow;
    if (sheet) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      if (sheet) document.body.style.overflow = before;
    };
  }, [open, sheet, place]);

  useEffect(() => {
    if (open) document.getElementById(optId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open, rows.length]);

  useEffect(() => setActive(0), [query]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, rows.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(rows.length - 1);
    else if (e.key === "Enter" || (e.key === " " && !searchable)) {
      if (rows[active]) choose(rows[active].value);
    } else if (e.key === "Escape") close(true);
    else if (e.key === "Tab") close(true);
    else if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // type to jump
      clearTimeout(typed.current.timer);
      typed.current.text += e.key.toLowerCase();
      typed.current.timer = setTimeout(() => (typed.current.text = ""), 700);
      const hit = rows.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
      return;
    } else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const list = (
    <ul
      id={listId}
      role="listbox"
      aria-label={title || placeholder}
      tabIndex={searchable ? -1 : 0}
      ref={searchable ? undefined : (focusTarget as React.RefObject<HTMLUListElement>)}
      aria-activedescendant={rows.length ? optId(active) : undefined}
      onKeyDown={searchable ? undefined : onListKey}
      className="overflow-y-auto overscroll-contain outline-none"
    >
      {rows.length === 0 && <li className="px-5 py-4 text-[15px] text-brand-900/60">No match</li>}
      {rows.map((o, i) => {
        const on = o.value === value;
        return (
          <li
            key={`${o.value}-${i}`}
            id={optId(i)}
            role="option"
            aria-selected={on}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(o.value)}
            className={`relative flex items-center justify-between gap-4 min-h-[52px] px-5 border-b border-brand-900/10 last:border-b-0 cursor-pointer text-[16px] ${
              on ? "font-bold text-brand-700 before:absolute before:left-0 before:inset-y-0 before:w-1 before:bg-brand-600" : "font-semibold text-brand-950"
            } ${i === active ? "bg-brand-50" : ""}`}
          >
            <span>{o.label}</span>
            {on && (
              <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-brand-600" fill="none" aria-hidden="true">
                <path d="m4.5 10.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        );
      })}
    </ul>
  );

  const search = searchable && (
    <div className="px-4 pb-3 pt-1 border-b border-brand-900/15">
      <input
        ref={focusTarget as React.RefObject<HTMLInputElement>}
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={rows.length ? optId(active) : undefined}
        aria-label={`Search ${title || placeholder}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onListKey}
        placeholder="Type to search"
        autoComplete="off"
        className="h-11 w-full rounded-lg bg-brand-50 px-3.5 text-[16px] font-medium !text-black placeholder:text-brand-900/50 outline-none focus:ring-2 focus:ring-brand-600"
      />
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            openList();
          }
        }}
        className={`${triggerClassName} flex items-center justify-between gap-3 text-left disabled:opacity-50`}
      >
        <span className={`truncate ${shown ? "" : "text-gray-500"}`}>{shown || placeholder}</span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-brand-700 transition-transform ${open ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Keeps native form behaviour: a value to submit, and "please fill this" on the trigger */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        required={required}
        value={value}
        onChange={() => {}}
        onFocus={() => trigger.current?.focus()}
        className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
      />

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          sheet ? (
            <div className="kl-fade fixed inset-0 z-[70] bg-brand-950/50" onMouseDown={() => close(true)}>
              <div
                className="kl-sheet fixed inset-x-0 bottom-0 max-h-[80vh] flex flex-col bg-white rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h2 className="text-[22px] font-bold tracking-[-0.02em] text-brand-950">{title || placeholder}</h2>
                  <button type="button" onClick={() => close(true)} className="h-11 px-2 -mr-2 text-[15px] font-semibold text-brand-700">
                    Close
                  </button>
                </div>
                {search}
                <div className="flex flex-col min-h-0 border-t border-brand-900/15">{list}</div>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 z-[70]" onMouseDown={() => close(true)}>
              <div
                className="kl-pop fixed flex flex-col bg-white rounded-2xl ring-1 ring-brand-900/15 shadow-[0_24px_48px_-24px_rgba(25,8,94,0.4)] overflow-hidden"
                style={pos ? { left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH } : { visibility: "hidden" }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {search && <div className="pt-3">{search}</div>}
                {list}
              </div>
            </div>
          ),
          document.body
        )}
    </div>
  );
}
