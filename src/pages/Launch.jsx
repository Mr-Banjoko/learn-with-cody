import AppShell from "../components/AppShell";

export default function Launch() {
  return (
    <div className="fixed inset-0 w-full overflow-hidden" style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)" }}>
      <AppShell />
    </div>
  );
}