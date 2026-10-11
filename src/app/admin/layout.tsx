import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // .no-crt desliga o efeito de scanlines do site público dentro do admin.
  return <div className="no-crt min-h-dvh">{children}</div>;
}
