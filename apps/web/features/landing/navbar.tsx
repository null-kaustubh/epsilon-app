import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3">
      <Link href="/" className="cursor-pointer font-head text-3xl">
        EPSILON
      </Link>
    </header>
  );
}
