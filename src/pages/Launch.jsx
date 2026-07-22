import AppShell from "../components/AppShell";

export default function Launch() {
  return (
    <div className="fixed left-0 top-0 h-[100svh] w-screen overflow-hidden">
      <AppShell />
    </div>
  );
}