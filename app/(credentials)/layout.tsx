import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { CredentialFooter } from "@/components/credentials/credential-footer";
import { CredentialNav } from "@/components/credentials/credential-nav";

const dmSans = DM_Sans({
  variable: "--font-credential-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-credential-serif",
  weight: "400",
  subsets: ["latin"],
});

export default function CredentialsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${dmSans.variable} ${dmSerif.variable} min-h-screen bg-[#EEEDE9] font-[family:var(--font-credential-sans)] text-[#0D2B45]`}
    >
      <CredentialNav />
      <main>{children}</main>
      <CredentialFooter />
    </div>
  );
}
