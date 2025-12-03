// components/layout/site-header.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-midnight/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
            <div className="mx-auto flex max-w-6xl items-center px-4 py-2.5">
                {/* Left: logo */}
                <Link href="/" className="flex items-center" aria-label="Vera Learning">
                    <Image
                        src="/logo-vera-full.svg"
                        alt="Vera Learning logo"
                        width={140}
                        height={40}
                        className="h-8 w-auto"
                        priority
                    />
                </Link>

                {/* Right: nav + actions */}
                <div className="ml-auto flex items-center gap-6">
                    <nav className="hidden items-center gap-6 text-xs font-medium text-midnight/75 sm:flex">
                        <Link href="#overview" className="hover:text-midnight">
                            Overview
                        </Link>
                        <Link href="#product" className="hover:text-midnight">
                            Product
                        </Link>
                        <Link href="#who" className="hover:text-midnight">
                            Who it&apos;s for
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button className="text-xs font-medium">Join waitlist</Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
