import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
    return (
        <footer className="mt-6 border-t border-midnight/10 bg-midnight text-white">
            <div className="mx-auto max-w-6xl px-4 py-5 space-y-1">
                {/* Top row: brand block + nav */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: logo + supporting text */}
                    <div className="flex max-w-xl items-center gap-3">
                        <Image
                            src="/logo-vera-monogram.svg"
                            alt="VeraLearning"
                            width={180}
                            height={52}
                            className="h-12 w-auto"
                        />
                        <p className="text-xs leading-relaxed text-white/75 md:text-sm">
                            AI-native tools for skills demonstration and assessment — grounded in
                            cognitive science and real learning practice.
                        </p>
                    </div>

                    {/* Right: footer nav */}
                    <nav className="flex flex-wrap items-center gap-3 text-xs text-white/75 md:text-sm">
                        <Link href="#product" className="hover:text-white">
                            Product
                        </Link>
                        <Link href="#who" className="hover:text-white">
                            Who it&apos;s for
                        </Link>
                        <Link href="/contact" className="hover:text-white">
                            Contact
                        </Link>
                    </nav>
                </div>

                {/* Bottom row: copyright + legal */}
                <div className="flex flex-col gap-1 border-t border-white/10 pt-2 text-[11px] text-white/50 md:flex-row md:items-center md:justify-between">
                    <p>© 2025 VeraLearning. All rights reserved.</p>
                    <div className="flex gap-3">
                        <Link href="/privacy" className="hover:text-white">
                            Privacy &amp; terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
