import Link from "next/link";

// Centred above each auth form: the K from klin-logo.png in brand purple.
export default function AuthLogo() {
  return (
    <Link href="/" aria-label="Kliner home" className="flex justify-center mb-4 sm:mb-6 text-brand-600">
      <span className="logo-mask aspect-[318/342] h-14 sm:h-16" />
    </Link>
  );
}
