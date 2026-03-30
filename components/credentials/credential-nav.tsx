import Image from "next/image";
import Link from "next/link";

export function CredentialNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-midnight/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <Link href="https://veralearning.com" className="flex items-center">
          <Image
            src="/logo-vera-full.svg"
            alt="VeraLearning"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>
    </nav>
  );
}
