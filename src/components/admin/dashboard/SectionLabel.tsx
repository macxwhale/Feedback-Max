
import React from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-left px-2">
      {children}
    </div>
  );
}
