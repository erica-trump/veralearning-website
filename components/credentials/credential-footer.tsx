import Link from "next/link";

export function CredentialFooter() {
  return (
    <footer className="px-5 pb-8 pt-4 text-center text-[12px] text-[#7A8A96]">
      <p>
        © {new Date().getFullYear()}{" "}
        <Link href="https://veralearning.com" className="text-[#3D8F8F]">
          VeraLearning
        </Link>{" "}
        ·{" "}
        <Link href="https://veralearning.com" className="text-[#3D8F8F]">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="https://veralearning.com" className="text-[#3D8F8F]">
          Verify a credential
        </Link>
      </p>
    </footer>
  );
}
