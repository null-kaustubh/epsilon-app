import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3">
      <Link
        href="/"
        className="cursor-pointer font-bodoni font-bold text-4xl text-landing-foreground select-none flex items-center"
      >
        <Image
          src={"/epsilon_logo.svg"}
          alt="epsilon"
          width={30}
          height={30}
          className="-mt-0.5"
        />
        PSILON
      </Link>
    </header>
  );
}
