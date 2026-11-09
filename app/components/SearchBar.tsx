"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICES, openService, searchServices } from "./serviceCatalog";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = searchServices(query);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (service) => {
    setOpen(false);
    setQuery(service.name);
    openService(router, service);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[active]) choose(results[active].service);
    else setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div className="relative" ref={boxRef}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex items-center bg-gray-100 rounded-full p-2 pl-4 border border-transparent focus-within:border-brand-600 focus-within:bg-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-2 shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search services e.g. plumbing, ironing, deep cleaning"
          aria-label="Search services"
          className="bg-transparent !border-0 !shadow-none outline-none w-full text-sm text-black placeholder-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="ml-2 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 hover:bg-brand-700"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </form>

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {results.length > 0 ? (
            <ul role="listbox">
              {results.map(({ service, matched }, i) => (
                <li key={service.name} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(service)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${i === active ? "bg-brand-50" : "bg-white"}`}
                  >
                    <span className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <service.Icon size={26} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-gray-900">{service.name}</span>
                      <span className="block text-xs text-gray-500 truncate">
                        {matched ? `Includes ${matched}` : service.description}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-brand-600 shrink-0">{service.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-2">No services match &ldquo;{query}&rdquo;</p>
              <p className="mb-2">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => choose(s)}
                    className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
