import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-page-bg text-midnight">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
