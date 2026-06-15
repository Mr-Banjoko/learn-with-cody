import { useRef } from "react";

export default function BusinessPlan() {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", background: "#f4f1eb", minHeight: "100vh", padding: "20px" }}>
      {/* Print button - hidden in print */}
      <div className="no-print" style={{ textAlign: "center", marginBottom: 24 }}>
        <button
          onClick={handlePrint}
          style={{ background: "#1a3a5c", color: "white", border: "none", padding: "12px 32px", fontSize: 15, borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
        >
          ⬇ Print / Save as PDF
        </button>
      </div>

      <div ref={printRef} style={{ maxWidth: 820, margin: "0 auto", background: "white", boxShadow: "0 4px 32px rgba(0,0,0,0.12)", padding: "60px 72px", lineHeight: 1.8, color: "#1a1a1a" }}>

        {/* Cover Page */}
        <div style={{ textAlign: "center", paddingBottom: 60, borderBottom: "3px solid #1a3a5c", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 32 }}>Business Planning Document</div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>ShenZhen Horizon Education Technology Co., Ltd.</div>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: "#1a3a5c", margin: "0 0 8px", lineHeight: 1.2 }}>Learn With Cody</h1>
          <div style={{ fontSize: 18, color: "#c07a00", fontStyle: "italic", marginBottom: 36 }}>An Independent Phonics Learning Application for Young Learners</div>
          <div style={{ width: 80, height: 4, background: "#c07a00", margin: "0 auto 36px" }} />
          <div style={{ fontSize: 13, color: "#555", lineHeight: 2 }}>
            <div><strong>Prepared by:</strong> ShenZhen Horizon Education Technology Co., Ltd.</div>
            <div><strong>Location:</strong> Shenzhen, Guangdong Province, People's Republic of China</div>
            <div><strong>Document Date:</strong> June 2026</div>
            <div><strong>Classification:</strong> Confidential — For Investor & Government Use Only</div>
          </div>
        </div>

        {/* Section 1 */}
        <Section number="1" title="Executive Summary">
          <p><strong>Company Name:</strong> ShenZhen Horizon Education Technology Co., Ltd.</p>
          <p><strong>Mission Statement:</strong> To empower young learners to independently acquire foundational English literacy skills through an engaging, structured, and technology-driven phonics application — removing the barrier of teacher dependency and making high-quality phonics education accessible to every child.</p>
          <p><strong>Product Overview:</strong> <em>Learn With Cody</em> is a gamified English phonics learning application designed for children aged 4 to 9. The application guides students through a comprehensive, curriculum-aligned phonics programme using interactive mini-games, audio-guided lessons, and a structured campaign mode that progresses from short vowel sounds through to more advanced phonemic patterns. The app's mascot — Cody — acts as a friendly guide throughout the learning journey, keeping young learners motivated and engaged.</p>
          <p>The application is built as a cross-platform Progressive Web App (PWA), accessible on iOS, Android, and desktop browsers without requiring separate native builds. It is currently in advanced development, with the Short A and Short I vowel campaigns fully complete and the Short O campaign nearing completion.</p>
          <p>ShenZhen Horizon seeks strategic partnerships with schools, education bureaus, and investors to bring <em>Learn With Cody</em> to market across Shenzhen, China, and international markets serving English language learners.</p>
        </Section>

        {/* Section 2 */}
        <Section number="2" title="Product Description">
          <SubHeading>2.1 What the Application Does</SubHeading>
          <p><em>Learn With Cody</em> teaches children to read and decode English words by mastering phonics — the relationship between letters and the sounds they represent. The application presents each vowel sound as a structured "campaign," guiding students through a sequence of up to 31 levels per vowel. Each level contains multiple rounds of varied interactive games, ensuring deep practice, repetition, and retention without monotony.</p>
          <p>Audio instructions are provided in both English and Mandarin Chinese, making the app highly accessible to Chinese-speaking learners who may have limited exposure to English at home.</p>

          <SubHeading>2.2 Target Age Group</SubHeading>
          <p>Primary target: Children aged <strong>4 to 8 years old</strong> (Kindergarten to Grade 2).</p>
          <p>Secondary target: Children aged <strong>8 to 12</strong> requiring phonics remediation or accelerated English literacy development.</p>

          <SubHeading>2.3 Key Features and Game Modes</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Campaign Mode:</strong> A structured, level-based progression across vowel sounds (Short A, Short E, Short I, Short O, Short U), each with up to 31 graded levels.</li>
            <li><strong>Phonics Flashcards:</strong> Illustrated word cards with native English audio for vocabulary acquisition.</li>
            <li><strong>Letter-to-Sound Connection Game:</strong> Students draw lines to match letters to their corresponding picture-slice sounds, reinforcing phoneme-grapheme correspondence.</li>
            <li><strong>Letter Catch Game:</strong> A real-time game where students tap falling letters to complete missing sounds in words.</li>
            <li><strong>Drag the Letters:</strong> Students drag individual phoneme tiles to construct words, building phonemic blending skills.</li>
            <li><strong>Missing Sound Rounds:</strong> Students identify and select the missing letter in a CVC word, reinforcing medial and boundary vowel recognition.</li>
            <li><strong>Word Match Game:</strong> Students match a spoken/illustrated word to its correct written form from a set of distractors.</li>
            <li><strong>Dictation Rounds:</strong> Students hear a word and type or construct it, practising phonemic encoding (spelling).</li>
            <li><strong>Handwriting / Tracing:</strong> Guided letter tracing with stroke-recognition feedback for pencil-control development.</li>
            <li><strong>Draw-a-Line Game:</strong> Students connect picture-sound pairs to reinforce phoneme awareness.</li>
            <li><strong>Picture Rearrangement:</strong> Students arrange image slices in correct phoneme order to reconstruct a word.</li>
            <li><strong>Performance Tracking:</strong> Star ratings and progress data are stored per level, allowing students and teachers to monitor mastery.</li>
            <li><strong>Bilingual Audio Hints:</strong> Every new game type is introduced with an audio guide in English or Mandarin Chinese.</li>
          </ul>
        </Section>

        {/* Section 3 */}
        <Section number="3" title="Market Opportunity">
          <SubHeading>3.1 Global Phonics Education Market</SubHeading>
          <p>The global educational technology (EdTech) market was valued at approximately USD 142 billion in 2023 and is projected to exceed USD 400 billion by 2030, growing at a compound annual growth rate (CAGR) of approximately 16%. Within this, early literacy and phonics applications represent one of the fastest-growing segments, driven by increased awareness of the "reading crisis" — a global concern that millions of children are completing primary education without achieving functional literacy.</p>
          <p>Research consistently demonstrates that structured phonics instruction is the most effective method for teaching children to read, giving phonics-based applications a strong evidence base and growing institutional demand.</p>

          <SubHeading>3.2 Demand in China</SubHeading>
          <p>China represents one of the world's largest and most competitive markets for English language education. An estimated <strong>300 million</strong> Chinese students are learning English, with demand peaking at the early childhood and primary school levels. Following the Chinese government's 2021 education reform ("double reduction" policy), demand has shifted away from after-school tutoring centres and towards technology-based, self-directed learning tools that comply with regulatory guidelines.</p>
          <p>Shenzhen, as a Tier-1 city with a high concentration of international businesses, expatriate families, and bilingual schools, presents a particularly high-value initial market. The city's education bureau actively encourages technology adoption in public and private schools.</p>
          <p>Key demand drivers in China include:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>National curriculum requirement for English from Grade 3 (with many schools starting earlier)</li>
            <li>Parent aspiration for children to achieve English proficiency for future academic and career competitiveness</li>
            <li>School demand for supplementary English literacy tools that reduce teacher workload</li>
            <li>Bilingual and international school growth in first- and second-tier cities</li>
          </ul>

          <SubHeading>3.3 International Market Potential</SubHeading>
          <p>Beyond China, <em>Learn With Cody</em> targets English as a Second Language (ESL) markets across Southeast Asia (Vietnam, Thailand, South Korea, Japan), the Middle East, and English-medium school markets in Africa. The bilingual (English/Chinese) interface can be extended to support additional languages, broadening the addressable market further. The PWA architecture means the product can be deployed globally without app store dependency in restricted markets.</p>
        </Section>

        {/* Section 4 */}
        <Section number="4" title="Business Model">
          <SubHeading>4.1 Revenue Streams</SubHeading>
          <p><strong>1. Institutional Licensing (B2B) — Primary Revenue Stream</strong><br />
          Annual or multi-year software licences sold to kindergartens, primary schools, international schools, and education centres. Pricing is set per institution or per student seat, making it scalable for both small and large institutions.</p>

          <p><strong>2. Direct Consumer Subscription (B2C)</strong><br />
          Monthly or annual subscription plans sold directly to parents through app stores and the web platform. A freemium model is employed: the first vowel campaign (Short A) is available free of charge, with remaining campaigns unlocked via subscription, driving organic acquisition and conversion.</p>

          <p><strong>3. Government / Education Bureau Contracts</strong><br />
          Procurement contracts with municipal or district education bureaus for district-wide deployment across public schools. These represent high-value, long-term contracts with significant volume.</p>

          <p><strong>4. Education Centre Licensing</strong><br />
          Licensing to private English language training centres and tutoring organisations for use as a supplementary classroom tool.</p>

          <p><strong>5. Curriculum Packages</strong><br />
          Bundled content packages for schools that include printed companion materials, teacher guides, and professional development sessions.</p>

          <SubHeading>4.2 Pricing Model (Indicative)</SubHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#1a3a5c", color: "white" }}>
                <th style={th}>Tier</th>
                <th style={th}>Target</th>
                <th style={th}>Pricing (Indicative)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Parent Subscription</td><td style={td}>Individual families</td><td style={td}>¥98 / month or ¥698 / year</td></tr>
              <tr><td style={td}>Small School Licence</td><td style={td}>Kindergartens ≤ 200 students</td><td style={td}>¥8,000 – ¥15,000 / year</td></tr>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Standard School Licence</td><td style={td}>Primary schools 200–1,000 students</td><td style={td}>¥20,000 – ¥50,000 / year</td></tr>
              <tr><td style={td}>International School Licence</td><td style={td}>Bilingual / international schools</td><td style={td}>¥50,000 – ¥120,000 / year</td></tr>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Bureau Contract</td><td style={td}>District / municipal authority</td><td style={td}>Negotiated (¥200,000+)</td></tr>
            </tbody>
          </table>
        </Section>

        {/* Section 5 */}
        <Section number="5" title="Target Customers">
          <SubHeading>5.1 Primary Institutional Customers</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Kindergartens and Preschools:</strong> English phonics is a core offering at premium kindergartens in Shenzhen. A tablet-based, self-guided phonics tool reduces reliance on foreign teachers and provides measurable learning outcomes.</li>
            <li><strong>Public Primary Schools:</strong> Schools seeking cost-effective English supplementary tools that align with national curriculum objectives.</li>
            <li><strong>International and Bilingual Schools:</strong> Institutions requiring rigorous, research-backed phonics programmes for their English medium instruction (EMI) curriculum.</li>
            <li><strong>Private Education Centres:</strong> After-school English language training centres seeking differentiated, technology-based content to complement classroom instruction.</li>
          </ul>

          <SubHeading>5.2 Consumer Customers</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Parents in Shenzhen and major Chinese cities:</strong> Educated, aspirational parents seeking high-quality English learning tools for home use that offer structured progression rather than entertainment-only content.</li>
            <li><strong>Expatriate families:</strong> International families in China seeking English literacy support for children learning to read in a second-language environment.</li>
          </ul>

          <SubHeading>5.3 Geographic Focus</SubHeading>
          <p><strong>Phase 1 (2026):</strong> Shenzhen, Guangdong Province<br />
          <strong>Phase 2 (2027):</strong> Guangzhou, Shanghai, Beijing, Chengdu<br />
          <strong>Phase 3 (2028+):</strong> Southeast Asia, Middle East, international ESL markets</p>
        </Section>

        {/* Section 6 */}
        <Section number="6" title="Competitive Advantage">
          <p><em>Learn With Cody</em> differentiates itself from existing products in the following significant ways:</p>
          <ol style={{ paddingLeft: 20 }}>
            <li><strong>Structured Curriculum Depth:</strong> Unlike entertainment apps that offer isolated games, <em>Learn With Cody</em> delivers a full, sequenced phonics programme across 5 vowel campaigns with up to 31 levels each — comparable in depth to a professional reading programme.</li>
            <li><strong>Bilingual Instruction (English + Mandarin):</strong> Audio hints, instructions, and feedback are provided in both English and Mandarin Chinese, making the app uniquely accessible to Chinese-speaking learners without English-speaking teacher support.</li>
            <li><strong>Independent Learning Design:</strong> The app is designed so children can navigate and complete lessons without adult supervision, addressing the critical challenge of teacher-to-student ratios in Chinese classrooms.</li>
            <li><strong>Diverse Game Mechanics:</strong> Over 12 distinct game types prevent learning fatigue while systematically targeting different phonemic skills — decoding, encoding, auditory discrimination, and grapheme-phoneme correspondence.</li>
            <li><strong>Cross-Platform PWA Technology:</strong> No separate iOS and Android development — one codebase runs everywhere, reducing development costs and enabling faster updates.</li>
            <li><strong>Local Market Understanding:</strong> Built by an education consulting team based in Shenzhen, the product is designed specifically for the Chinese English-learning context — not adapted from a Western product.</li>
            <li><strong>Performance Tracking:</strong> Built-in star ratings and level completion data allow schools and parents to monitor progress without additional assessment tools.</li>
          </ol>
        </Section>

        {/* Section 7 */}
        <Section number="7" title="Development Status">
          <SubHeading>7.1 Current Stage</SubHeading>
          <p>The application is currently in <strong>advanced development / late beta stage</strong>. The core platform, game engine, and campaign infrastructure are fully operational. Content production (audio recordings, illustrated word images, phoneme slice assets) is ongoing in parallel with software development.</p>

          <SubHeading>7.2 Completed Features</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Full campaign infrastructure with 31-level progression per vowel sound</li>
            <li>Short A vowel campaign — all 31 levels complete</li>
            <li>Short I vowel campaign — all 31 levels complete</li>
            <li>All 12+ game type engines fully implemented and tested</li>
            <li>Bilingual audio system (English and Mandarin Chinese) for all game type introductions</li>
            <li>Performance tracking and star rating system</li>
            <li>Progressive Web App architecture with offline capability</li>
            <li>Flashcard and independent games hub (Letter Catch, Word Match, Drag Letters, Missing Sound, Draw-a-Line, Picture Rearrangement, Dictation, Handwriting/Tracing)</li>
            <li>Campaign map with visual progress tracking</li>
            <li>Audio warmup and sequential audio playback system for smooth in-game experience</li>
          </ul>

          <SubHeading>7.3 Features In Progress</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Short O vowel campaign — levels in active development (campaign infrastructure complete, content being finalised)</li>
            <li>Short E and Short U vowel campaigns — content preparation phase</li>
            <li>Teacher/parent dashboard for class progress monitoring</li>
            <li>School admin panel for licence and student management</li>
            <li>Additional language support beyond English and Mandarin</li>
            <li>Cloud-based progress synchronisation across devices</li>
          </ul>
        </Section>

        {/* Section 8 */}
        <Section number="8" title="Go-to-Market Strategy">
          <SubHeading>8.1 Phase 1: Shenzhen Pilot (Q3–Q4 2026)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Identify 5–10 pilot kindergartens and primary schools in Shenzhen for free or subsidised trials</li>
            <li>Collect structured teacher and student feedback to refine the product</li>
            <li>Generate case studies and testimonials from Shenzhen-based institutions</li>
            <li>Submit application to Shenzhen Municipal Education Bureau for review and endorsement</li>
            <li>Launch parent-facing subscription through WeChat Mini Programme and direct web access</li>
          </ul>

          <SubHeading>8.2 Phase 2: Guangdong Province Expansion (2027)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Leverage Shenzhen pilot results to approach school districts in Guangzhou, Dongguan, and Foshan</li>
            <li>Appoint regional education channel partners and sales agents</li>
            <li>Participate in national education technology exhibitions (e.g., China Education Expo, GET Conference Beijing)</li>
            <li>Pursue procurement listing on government education platform catalogues</li>
          </ul>

          <SubHeading>8.3 Phase 3: National and International Expansion (2028+)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>National rollout targeting Tier 1 and Tier 2 cities</li>
            <li>Partnerships with Chinese education publishing houses for curriculum bundling</li>
            <li>International market entry via ESL-focused education distributors in Southeast Asia and the Middle East</li>
            <li>App store presence on Apple App Store and Google Play for international consumer markets</li>
          </ul>
        </Section>

        {/* Section 9 */}
        <Section number="9" title="Financial Projections">
          <SubHeading>9.1 Estimated Development Costs</SubHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#1a3a5c", color: "white" }}>
                <th style={th}>Cost Category</th>
                <th style={th}>Estimated Annual Cost (RMB)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Software development (platform, ongoing features)</td><td style={td}>¥150,000 – ¥250,000</td></tr>
              <tr><td style={td}>Content production (audio, illustrations, assets)</td><td style={td}>¥80,000 – ¥150,000</td></tr>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Hosting and infrastructure</td><td style={td}>¥20,000 – ¥40,000</td></tr>
              <tr><td style={td}>Marketing and sales</td><td style={td}>¥50,000 – ¥100,000</td></tr>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>Operations and administration</td><td style={td}>¥30,000 – ¥60,000</td></tr>
              <tr style={{ background: "#1a3a5c", color: "white" }}><td style={{ ...td, fontWeight: 700, color: "white" }}>Total Estimated Annual Operating Cost</td><td style={{ ...td, fontWeight: 700, color: "white" }}>¥330,000 – ¥600,000</td></tr>
            </tbody>
          </table>

          <SubHeading>9.2 Revenue Projections</SubHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#1a3a5c", color: "white" }}>
                <th style={th}>Year</th>
                <th style={th}>Institutional Licences</th>
                <th style={th}>Subscriptions</th>
                <th style={th}>Projected Revenue (RMB)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>2026 (Pilot)</td><td style={td}>3–8 schools</td><td style={td}>100–300 families</td><td style={td}>¥150,000 – ¥400,000</td></tr>
              <tr><td style={td}>2027</td><td style={td}>20–50 schools</td><td style={td}>500–2,000 families</td><td style={td}>¥600,000 – ¥2,000,000</td></tr>
              <tr style={{ background: "#f7f4ee" }}><td style={td}>2028</td><td style={td}>80–150 schools</td><td style={td}>3,000–8,000 families</td><td style={td}>¥2,000,000 – ¥6,000,000</td></tr>
              <tr><td style={td}>2029</td><td style={td}>200+ schools + bureau deals</td><td style={td}>10,000+ families</td><td style={td}>¥6,000,000 – ¥15,000,000</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "#777", marginTop: 6 }}>* Projections are indicative estimates based on comparable EdTech market entry benchmarks. Actual results will vary.</p>
        </Section>

        {/* Section 10 */}
        <Section number="10" title="Team & Company Background">
          <p><strong>ShenZhen Horizon Education Technology Co., Ltd.</strong> is an education consulting and technology company based in Shenzhen, Guangdong Province, People's Republic of China. The company was established with a focus on bridging the gap between international education standards and the practical needs of Chinese students and institutions.</p>
          <p>The founding team brings expertise in English language education, early childhood curriculum design, and software development. The company has direct relationships with schools, education centres, and academic institutions in the Shenzhen and Greater Bay Area region, providing a strong foundation for initial market penetration.</p>
          <p>The development of <em>Learn With Cody</em> represents the company's flagship technology product, drawing on years of first-hand observation of the challenges Chinese children face in acquiring English phonics skills through traditional classroom instruction alone.</p>
          <p>The company is currently structured as a small, focused team and intends to grow its technical, content, and sales functions as the product reaches commercial launch stage. Recruitment of a dedicated sales lead and a curriculum advisor are planned for 2026.</p>
        </Section>

        {/* Section 11 */}
        <Section number="11" title="Future Roadmap">
          <SubHeading>11.1 Product Development (2026–2027)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Complete Short O, Short E, and Short U vowel campaigns</li>
            <li>Introduce long vowel campaigns (Long A, Long E, Long I, Long O, Long U)</li>
            <li>Add consonant blend and digraph modules (e.g., sh, ch, th, bl, cr)</li>
            <li>Develop teacher dashboard for class monitoring, progress reports, and assignment setting</li>
            <li>Cloud synchronisation of student progress across devices</li>
            <li>Introduce a "Reading Mode" where children decode simple decodable texts</li>
          </ul>

          <SubHeading>11.2 Platform Expansion (2027–2028)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Native iOS and Android app builds for improved performance and app store discoverability</li>
            <li>WeChat Mini Programme integration for frictionless access in the Chinese market</li>
            <li>Additional interface language support (Korean, Japanese, Vietnamese) for Southeast Asian markets</li>
            <li>AI-powered adaptive learning paths based on individual student performance data</li>
          </ul>

          <SubHeading>11.3 Business Expansion (2028+)</SubHeading>
          <ul style={{ paddingLeft: 20 }}>
            <li>Partnerships with Chinese national textbook publishers for curriculum integration</li>
            <li>Licensing of the <em>Learn With Cody</em> platform to international ESL publishers</li>
            <li>Development of a "Learn With Cody" companion physical product line (flash cards, workbooks)</li>
            <li>Explore Series B funding for international market expansion</li>
          </ul>
        </Section>

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: "2px solid #1a3a5c", textAlign: "center", fontSize: 11, color: "#888" }}>
          <p>© 2026 ShenZhen Horizon Education Technology Co., Ltd. | All Rights Reserved</p>
          <p>This document is confidential and intended solely for the named recipient. Unauthorised distribution is prohibited.</p>
          <p style={{ marginTop: 8, fontStyle: "italic" }}>Learn With Cody — Empowering Every Child to Read</p>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          div[style*="box-shadow"] { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid #c07a00" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#c07a00", minWidth: 24 }}>{number}.</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a3a5c", letterSpacing: 0.3 }}>{title}</h2>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.9, color: "#2a2a2a" }}>{children}</div>
    </div>
  );
}

function SubHeading({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a3a5c", margin: "20px 0 8px", letterSpacing: 0.2 }}>{children}</h3>;
}

const th = { padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, letterSpacing: 0.3 };
const td = { padding: "8px 12px", borderBottom: "1px solid #e8e2d6", fontSize: 13 };