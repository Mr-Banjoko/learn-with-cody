/**
 * TemplateHome — "Template" folder in the Games tab.
 * Lists the 3 template ideas; each opens the full test batch level
 * (1 learn game + one of every campaign game) in that idea's design.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";
import TemplateIdeaLevel from "./TemplateIdeaLevel";
import CodyArrow from "./CodyArrow";
import { TEMPLATES } from "../../lib/gameTemplates";

const IDEAS = [TEMPLATES.idea1, TEMPLATES.idea2, TEMPLATES.idea3, TEMPLATES.idea4, TEMPLATES.idea5, TEMPLATES.idea6];

export default function TemplateHome({ onBack, lang = "en" }) {
  const [activeIdea, setActiveIdea] = useState(null);

  if (activeIdea) {
    return <TemplateIdeaLevel theme={activeIdea} onBack={() => setActiveIdea(null)} lang={lang} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E293B", margin: 0, lineHeight: 1.1 }}>
            🎨 {lang === "zh" ? "模板测试" : "Template"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "2px 0 0" }}>
            {lang === "zh" ? "为征程模式测试新设计" : "Design test batch for campaign mode"}
          </p>
        </div>
      </div>

      {/* Idea folders */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px calc(24px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12 }}>
        {IDEAS.map((idea, i) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveIdea(idea)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderRadius: 22, background: "white",
              border: `2px solid ${idea.accent}55`, boxShadow: `0 4px 18px ${idea.accent}25`,
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Theme preview swatch */}
            <div style={{ width: 60, height: 60, borderRadius: 18, background: idea.bg, border: `2px solid ${idea.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              <CodyArrow src={idea.arrowImg} color={idea.arrowColor || idea.accent} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", margin: 0 }}>{idea.name}</p>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: "3px 0 0" }}>
                {idea.tagline} · {lang === "zh" ? "13 个游戏测试" : "13-game test run"}
              </p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: idea.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 0 ${idea.accent}66` }}>
              <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}