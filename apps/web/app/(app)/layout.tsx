import Navbar from "../../features/landing/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="max-w-screen overflow-x-clip">
        <Navbar />
        {children}
      </main>
    </>
  );
}
