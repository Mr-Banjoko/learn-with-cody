import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CodyLaunch from "../components/CodyLaunch";
import AppShell from "../components/AppShell";

export default function Launch() {
  const [launched, setLaunched] = useState(false);

  return (
    <div className="fixed inset-0">
      <AnimatePresence>
        {!launched && (
          <CodyLaunch onComplete={() => setLaunched(true)} />
        )}
      </AnimatePresence>
      {launched && <AppShell />}
    </div>
  );
}