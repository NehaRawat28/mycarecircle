import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {children}
      </main>
    </div>
  );
}
