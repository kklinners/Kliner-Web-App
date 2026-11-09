
import React from "react";

export default function AuthLayout({ children }: {
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EFEDE8]">
      {children}
    </div>
  );
}

