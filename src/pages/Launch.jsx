import AppShell from "../components/AppShell";

export default function Launch() {
  return (
    <div className="fixed top-0 left-0 right-0" style={{ height: "100dvh" }}>
      <AppShell />
    </div>
  );
}