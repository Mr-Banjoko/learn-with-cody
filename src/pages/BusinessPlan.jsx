import { useRef } from "react";

const wordContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Learn With Cody — Business Plan</title>
<style>
  body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.8; color: #1a1a1a; margin: 2cm; }
  h1 { font-size: 28pt; color: #1a3a5c; text-align: center; }
  h2 { font-size: 16pt; color: #1a3a5c; border-bottom: 2px solid #c07a00; padding-bottom: 4px; margin-top: 28px; }
  h3 { font-size: 13pt; color: #1a3a5c; margin-top: 18px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0; padding-left: 24px; }
  li { margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th { background: #1a3a5c; color: white; padding: 8px 10px; text-align: left; font-size: 10pt; }
  td { padding: 7px 10px; border-bottom: 1px solid #ddd; font-size: 10pt; }
  tr:nth-child(even) td { background: #f7f4ee; }
  .cover { text-align: center; padding: 40px 0 60px; border-bottom: 3px solid #1a3a5c; margin-bottom: 40px; }
  .cover .subtitle { font-size: 14pt; color: #c07a00; font-style: italic; }
  .cover .meta { font-size: 10pt; color: #555; line-height: 2; margin-top: 24px; }
  .footer { margin-top: 60px; padding-top: 16px; border-top: 2px solid #1a3a5c; text-align: center; font-size: 9pt; color: #888; }
</style>
</head>
<body>
<div class="cover">
  <p style="font-size:9pt;letter-spacing:3px;color:#888;text-transform:uppercase;">Business Planning Document</p>
  <p style="font-size:11pt;color:#555;">ShenZhen Horizon Education Technology Co., Ltd.</p>
  <h1>Learn With Cody</h1>
  <p class="subtitle">An Independent Phonics Learning Application for Young Learners</p>
  <div class="meta">
    <p><strong>Prepared by:</strong> ShenZhen Horizon Education Technology Co., Ltd.</p>
    <p><strong>Location:</strong> Shenzhen, Guangdong Province, People's Republic of China</p>
    <p><strong>Document Date:</strong> June 2026</p>
    <p><strong>Classification:</strong> Confidential — For Investor &amp; Government Use Only</p>
  </div>
</div>

<h2>1. Executive Summary</h2>
<p><strong>Company Name:</strong> ShenZhen Horizon Education Technology Co., Ltd.</p>
<p><strong>Mission Statement:</strong> To empower young learners to independently acquire foundational English literacy skills through an engaging, structured, and technology-driven phonics application — removing the barrier of teacher dependency and making high-quality phonics education accessible to every child.</p>
<p><strong>Product Overview:</strong> <em>Learn With Cody</em> is a gamified English phonics learning application designed for children aged 4 to 9. The application guides students through a comprehensive, curriculum-aligned phonics programme using interactive mini-games, audio-guided lessons, and a structured campaign mode that progresses from short vowel sounds through to more advanced phonemic patterns. The app's mascot — Cody — acts as a friendly guide throughout the learning journey, keeping young learners motivated and engaged.</p>
<p>The application is built as a cross-platform Progressive Web App (PWA), accessible on iOS, Android, and desktop browsers without requiring separate native builds. It is currently in advanced development, with the Short A and Short I vowel campaigns fully complete and the Short O campaign nearing completion.</p>
<p>ShenZhen Horizon seeks strategic partnerships with schools, education bureaus, and investors to bring <em>Learn With Cody</em> to market across Shenzhen, China, and international markets serving English language learners.</p>

<h2>2. Product Description</h2>
<h3>2.1 What the Application Does</h3>
<p><em>Learn With Cody</em> teaches children to read and decode English words by mastering phonics — the relationship between letters and the sounds they represent. The application presents each vowel sound as a structured "campaign," guiding students through a sequence of up to 31 levels per vowel. Each level contains multiple rounds of varied interactive games, ensuring deep practice, repetition, and retention without monotony.</p>
<p>Audio instructions are provided in both English and Mandarin Chinese, making the app highly accessible to Chinese-speaking learners who may have limited exposure to English at home.</p>
<h3>2.2 Target Age Group</h3>
<p>Primary target: Children aged <strong>4 to 8 years old</strong> (Kindergarten to Grade 2).</p>
<p>Secondary target: Children aged <strong>8 to 12</strong> requiring phonics remediation or accelerated English literacy development.</p>
<h3>2.3 Key Features and Game Modes</h3>
<ul>
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

<h2>3. Market Opportunity</h2>
<h3>3.1 Global Phonics Education Market</h3>
<p>The global educational technology (EdTech) market was valued at approximately USD 142 billion in 2023 and is projected to exceed USD 400 billion by 2030, growing at a compound annual growth rate (CAGR) of approximately 16%. Within this, early literacy and phonics applications represent one of the fastest-growing segments, driven by increased awareness of the "reading crisis" — a global concern that millions of children are completing primary education without achieving functional literacy.</p>
<p>Research consistently demonstrates that structured phonics instruction is the most effective method for teaching children to read, giving phonics-based applications a strong evidence base and growing institutional demand.</p>
<h3>3.2 Demand in China</h3>
<p>China represents one of the world's largest and most competitive markets for English language education. An estimated <strong>300 million</strong> Chinese students are learning English, with demand peaking at the early childhood and primary school levels. Following the Chinese government's 2021 education reform ("double reduction" policy), demand has shifted away from after-school tutoring centres and towards technology-based, self-directed learning tools that comply with regulatory guidelines.</p>
<p>Shenzhen, as a Tier-1 city with a high concentration of international businesses, expatriate families, and bilingual schools, presents a particularly high-value initial market. The city's education bureau actively encourages technology adoption in public and private schools.</p>
<p>Key demand drivers in China include:</p>
<ul>
  <li>National curriculum requirement for English from Grade 3 (with many schools starting earlier)</li>
  <li>Parent aspiration for children to achieve English proficiency for future academic and career competitiveness</li>
  <li>School demand for supplementary English literacy tools that reduce teacher workload</li>
  <li>Bilingual and international school growth in first- and second-tier cities</li>
</ul>
<h3>3.3 International Market Potential</h3>
<p>Beyond China, <em>Learn With Cody</em> targets English as a Second Language (ESL) markets across Southeast Asia (Vietnam, Thailand, South Korea, Japan), the Middle East, and English-medium school markets in Africa. The bilingual (English/Chinese) interface can be extended to support additional languages, broadening the addressable market further.</p>

<h2>4. Business Model</h2>
<h3>4.1 Revenue Streams</h3>
<p><strong>1. Institutional Licensing (B2B) — Primary Revenue Stream</strong><br/>Annual or multi-year software licences sold to kindergartens, primary schools, international schools, and education centres.</p>
<p><strong>2. Direct Consumer Subscription (B2C)</strong><br/>Monthly or annual subscription plans sold directly to parents. A freemium model is employed: the first vowel campaign (Short A) is available free of charge, with remaining campaigns unlocked via subscription.</p>
<p><strong>3. Government / Education Bureau Contracts</strong><br/>Procurement contracts with municipal or district education bureaus for district-wide deployment across public schools.</p>
<p><strong>4. Education Centre Licensing</strong><br/>Licensing to private English language training centres and tutoring organisations.</p>
<p><strong>5. Curriculum Packages</strong><br/>Bundled content packages for schools that include printed companion materials, teacher guides, and professional development sessions.</p>
<h3>4.2 Pricing Model (Indicative)</h3>
<table>
  <thead><tr><th>Tier</th><th>Target</th><th>Pricing (Indicative)</th></tr></thead>
  <tbody>
    <tr><td>Parent Subscription</td><td>Individual families</td><td>¥98 / month or ¥698 / year</td></tr>
    <tr><td>Small School Licence</td><td>Kindergartens ≤ 200 students</td><td>¥8,000 – ¥15,000 / year</td></tr>
    <tr><td>Standard School Licence</td><td>Primary schools 200–1,000 students</td><td>¥20,000 – ¥50,000 / year</td></tr>
    <tr><td>International School Licence</td><td>Bilingual / international schools</td><td>¥50,000 – ¥120,000 / year</td></tr>
    <tr><td>Bureau Contract</td><td>District / municipal authority</td><td>Negotiated (¥200,000+)</td></tr>
  </tbody>
</table>

<h2>5. Target Customers</h2>
<h3>5.1 Primary Institutional Customers</h3>
<ul>
  <li><strong>Kindergartens and Preschools:</strong> English phonics is a core offering at premium kindergartens in Shenzhen. A tablet-based, self-guided phonics tool reduces reliance on foreign teachers and provides measurable learning outcomes.</li>
  <li><strong>Public Primary Schools:</strong> Schools seeking cost-effective English supplementary tools that align with national curriculum objectives.</li>
  <li><strong>International and Bilingual Schools:</strong> Institutions requiring rigorous, research-backed phonics programmes for their English medium instruction (EMI) curriculum.</li>
  <li><strong>Private Education Centres:</strong> After-school English language training centres seeking differentiated, technology-based content.</li>
</ul>
<h3>5.2 Consumer Customers</h3>
<ul>
  <li><strong>Parents in Shenzhen and major Chinese cities:</strong> Educated, aspirational parents seeking high-quality English learning tools for home use.</li>
  <li><strong>Expatriate families:</strong> International families in China seeking English literacy support for children learning to read in a second-language environment.</li>
</ul>
<h3>5.3 Geographic Focus</h3>
<p><strong>Phase 1 (2026):</strong> Shenzhen, Guangdong Province<br/>
<strong>Phase 2 (2027):</strong> Guangzhou, Shanghai, Beijing, Chengdu<br/>
<strong>Phase 3 (2028+):</strong> Southeast Asia, Middle East, international ESL markets</p>

<h2>6. Competitive Advantage</h2>
<ol>
  <li><strong>Structured Curriculum Depth:</strong> A full, sequenced phonics programme across 5 vowel campaigns with up to 31 levels each — comparable in depth to a professional reading programme.</li>
  <li><strong>Bilingual Instruction (English + Mandarin):</strong> Audio hints and feedback in both English and Mandarin Chinese.</li>
  <li><strong>Independent Learning Design:</strong> Children can navigate and complete lessons without adult supervision.</li>
  <li><strong>Diverse Game Mechanics:</strong> Over 12 distinct game types prevent learning fatigue while targeting different phonemic skills.</li>
  <li><strong>Cross-Platform PWA Technology:</strong> One codebase runs everywhere — iOS, Android, and desktop — reducing development costs.</li>
  <li><strong>Local Market Understanding:</strong> Built by an education consulting team based in Shenzhen, designed specifically for the Chinese English-learning context.</li>
  <li><strong>Performance Tracking:</strong> Built-in star ratings and level completion data allow schools and parents to monitor progress.</li>
</ol>

<h2>7. Development Status</h2>
<h3>7.1 Current Stage</h3>
<p>The application is currently in <strong>advanced development / late beta stage</strong>. The core platform, game engine, and campaign infrastructure are fully operational.</p>
<h3>7.2 Completed Features</h3>
<ul>
  <li>Full campaign infrastructure with 31-level progression per vowel sound</li>
  <li>Short A vowel campaign — all 31 levels complete</li>
  <li>Short I vowel campaign — all 31 levels complete</li>
  <li>All 12+ game type engines fully implemented and tested</li>
  <li>Bilingual audio system (English and Mandarin Chinese) for all game type introductions</li>
  <li>Performance tracking and star rating system</li>
  <li>Progressive Web App architecture with offline capability</li>
  <li>Flashcard and independent games hub</li>
  <li>Campaign map with visual progress tracking</li>
</ul>
<h3>7.3 Features In Progress</h3>
<ul>
  <li>Short O vowel campaign — levels in active development</li>
  <li>Short E and Short U vowel campaigns — content preparation phase</li>
  <li>Teacher/parent dashboard for class progress monitoring</li>
  <li>School admin panel for licence and student management</li>
  <li>Cloud-based progress synchronisation across devices</li>
</ul>

<h2>8. Go-to-Market Strategy</h2>
<h3>8.1 Phase 1: Shenzhen Pilot (Q3–Q4 2026)</h3>
<ul>
  <li>Identify 5–10 pilot kindergartens and primary schools in Shenzhen for free or subsidised trials</li>
  <li>Collect structured teacher and student feedback to refine the product</li>
  <li>Generate case studies and testimonials from Shenzhen-based institutions</li>
  <li>Submit application to Shenzhen Municipal Education Bureau for review and endorsement</li>
  <li>Launch parent-facing subscription through WeChat Mini Programme and direct web access</li>
</ul>
<h3>8.2 Phase 2: Guangdong Province Expansion (2027)</h3>
<ul>
  <li>Leverage Shenzhen pilot results to approach school districts in Guangzhou, Dongguan, and Foshan</li>
  <li>Appoint regional education channel partners and sales agents</li>
  <li>Participate in national education technology exhibitions</li>
  <li>Pursue procurement listing on government education platform catalogues</li>
</ul>
<h3>8.3 Phase 3: National and International Expansion (2028+)</h3>
<ul>
  <li>National rollout targeting Tier 1 and Tier 2 cities</li>
  <li>Partnerships with Chinese education publishing houses for curriculum bundling</li>
  <li>International market entry via ESL-focused education distributors in Southeast Asia and the Middle East</li>
  <li>App store presence on Apple App Store and Google Play for international consumer markets</li>
</ul>

<h2>9. Financial Projections</h2>
<h3>9.1 Estimated Development Costs</h3>
<table>
  <thead><tr><th>Cost Category</th><th>Estimated Annual Cost (RMB)</th></tr></thead>
  <tbody>
    <tr><td>Software development (platform, ongoing features)</td><td>¥150,000 – ¥250,000</td></tr>
    <tr><td>Content production (audio, illustrations, assets)</td><td>¥80,000 – ¥150,000</td></tr>
    <tr><td>Hosting and infrastructure</td><td>¥20,000 – ¥40,000</td></tr>
    <tr><td>Marketing and sales</td><td>¥50,000 – ¥100,000</td></tr>
    <tr><td>Operations and administration</td><td>¥30,000 – ¥60,000</td></tr>
    <tr><td><strong>Total Estimated Annual Operating Cost</strong></td><td><strong>¥330,000 – ¥600,000</strong></td></tr>
  </tbody>
</table>
<h3>9.2 Revenue Projections</h3>
<table>
  <thead><tr><th>Year</th><th>Institutional Licences</th><th>Subscriptions</th><th>Projected Revenue (RMB)</th></tr></thead>
  <tbody>
    <tr><td>2026 (Pilot)</td><td>3–8 schools</td><td>100–300 families</td><td>¥150,000 – ¥400,000</td></tr>
    <tr><td>2027</td><td>20–50 schools</td><td>500–2,000 families</td><td>¥600,000 – ¥2,000,000</td></tr>
    <tr><td>2028</td><td>80–150 schools</td><td>3,000–8,000 families</td><td>¥2,000,000 – ¥6,000,000</td></tr>
    <tr><td>2029</td><td>200+ schools + bureau deals</td><td>10,000+ families</td><td>¥6,000,000 – ¥15,000,000</td></tr>
  </tbody>
</table>
<p><em>* Projections are indicative estimates based on comparable EdTech market entry benchmarks. Actual results will vary.</em></p>

<h2>10. Team &amp; Company Background</h2>
<p><strong>ShenZhen Horizon Education Technology Co., Ltd.</strong> is an education consulting and technology company based in Shenzhen, Guangdong Province, People's Republic of China. The company was established with a focus on bridging the gap between international education standards and the practical needs of Chinese students and institutions.</p>
<p>The founding team brings expertise in English language education, early childhood curriculum design, and software development. The company has direct relationships with schools, education centres, and academic institutions in the Shenzhen and Greater Bay Area region.</p>
<p>The development of <em>Learn With Cody</em> represents the company's flagship technology product, drawing on years of first-hand observation of the challenges Chinese children face in acquiring English phonics skills through traditional classroom instruction alone.</p>
<p>The company is currently structured as a small, focused team and intends to grow its technical, content, and sales functions as the product reaches commercial launch stage. Recruitment of a dedicated sales lead and a curriculum advisor are planned for 2026.</p>

<h2>11. Future Roadmap</h2>
<h3>11.1 Product Development (2026–2027)</h3>
<ul>
  <li>Complete Short O, Short E, and Short U vowel campaigns</li>
  <li>Introduce long vowel campaigns (Long A, Long E, Long I, Long O, Long U)</li>
  <li>Add consonant blend and digraph modules (e.g., sh, ch, th, bl, cr)</li>
  <li>Develop teacher dashboard for class monitoring, progress reports, and assignment setting</li>
  <li>Cloud synchronisation of student progress across devices</li>
  <li>Introduce a "Reading Mode" where children decode simple decodable texts</li>
</ul>
<h3>11.2 Platform Expansion (2027–2028)</h3>
<ul>
  <li>Native iOS and Android app builds for improved performance and app store discoverability</li>
  <li>WeChat Mini Programme integration for frictionless access in the Chinese market</li>
  <li>Additional interface language support (Korean, Japanese, Vietnamese) for Southeast Asian markets</li>
  <li>AI-powered adaptive learning paths based on individual student performance data</li>
</ul>
<h3>11.3 Business Expansion (2028+)</h3>
<ul>
  <li>Partnerships with Chinese national textbook publishers for curriculum integration</li>
  <li>Licensing of the <em>Learn With Cody</em> platform to international ESL publishers</li>
  <li>Development of a "Learn With Cody" companion physical product line (flash cards, workbooks)</li>
  <li>Explore Series B funding for international market expansion</li>
</ul>

<div class="footer">
  <p>© 2026 ShenZhen Horizon Education Technology Co., Ltd. | All Rights Reserved</p>
  <p>This document is confidential and intended solely for the named recipient. Unauthorised distribution is prohibited.</p>
  <p><em>Learn With Cody — Empowering Every Child to Read</em></p>
</div>
</body></html>
`;

export default function BusinessPlan() {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const blob = new Blob([wordContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LearnWithCody_BusinessPlan.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGamesDoc = () => {
    const CODY_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/8ba99d679_ElevenLabs_image_nano-banana_iwantjust_2026-03-26T06_51_27.png";
    const CODY_TRANSPARENT = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/93a5cd462_transparent_cody.png";

    const gameBoxStyle = `
      display:inline-block; width:100%; padding:0; margin:0;
      border:2px solid #e0e0e0; border-radius:12px; overflow:hidden;
      background:#f9f9f9; page-break-inside:avoid;
    `;
    const headerStyle = `background:#1a3a5c; color:white; padding:10px 16px; font-size:13pt; font-weight:700; font-family:Calibri,sans-serif;`;
    const bodyStyle = `padding:14px 16px; font-family:Calibri,sans-serif; font-size:11pt; color:#333;`;
    const aimStyle = `margin-top:8px; padding:8px 12px; background:#EFF6FF; border-left:4px solid #1a3a5c; font-size:10pt; color:#1a3a5c;`;

    const games = [
      {
        emoji: "🖼️",
        name: "Rearrange the Pictures",
        color: "#FF6B6B",
        bg: "#FFF0F0",
        desc: "Students are shown picture slices of a CVC word displayed in scrambled order. They drag and drop each slice into the correct position to reconstruct the full image in the right phoneme sequence.",
        aim: "Aim: Develops phoneme sequencing and phonological awareness — children internalise the left-to-right letter order of spoken sounds as they reassemble each word.",
      },
      {
        emoji: "🎯",
        name: "Word Match",
        color: "#4D96FF",
        bg: "#EFF6FF",
        desc: "A spoken word and its illustration are presented. The child selects the correct written word from a set of visually similar options (e.g., 'cat', 'bat', 'hat'). Audio reinforcement confirms the correct answer.",
        aim: "Aim: Builds sight-word recognition and orthographic mapping — connecting spoken words to their printed forms under auditory support.",
      },
      {
        emoji: "✋",
        name: "Drag the Letters",
        color: "#6BCB77",
        bg: "#F0FFF4",
        desc: "A word image and its audio are presented. Individual letter tiles are scattered on screen. The student drags each letter into the correct empty box to spell the word, with audio feedback on correct placement.",
        aim: "Aim: Practises phoneme-grapheme correspondence and word construction — children must decode each sound and match it to its written letter.",
      },
      {
        emoji: "✍️",
        name: "Drag the Letters V2",
        color: "#FFD93D",
        bg: "#FFFDE7",
        desc: "An enhanced drag-and-drop spelling activity. Students arrange all letter tiles to spell the word, then press 'Submit' to check their complete answer. This reinforces self-checking and whole-word encoding.",
        aim: "Aim: Strengthens full word encoding and self-correction skills — students commit to a complete spelling before receiving feedback.",
      },
      {
        emoji: "❓",
        name: "Missing Sound",
        color: "#C77DFF",
        bg: "#FAF0FF",
        desc: "A word image is shown with one letter missing (shown as a blank). A set of letter options is displayed. The student taps the correct letter to complete the word. Audio confirms the choice.",
        aim: "Aim: Targets phonemic segmentation — students must identify and isolate a specific phoneme (initial, medial, or final) within a word.",
      },
      {
        emoji: "🔤",
        name: "Missing Sound 0.1",
        color: "#FF9F43",
        bg: "#FFF5E6",
        desc: "Similar to Missing Sound, but with an additional interactive layer: students can first tap any letter tile to hear its sound before dragging it into the blank. This supports learners who need auditory scaffolding.",
        aim: "Aim: Provides supported phoneme identification — the tap-to-hear feature helps children who are still building letter-sound associations make accurate decisions.",
      },
      {
        emoji: "🧩",
        name: "Letter Catch",
        color: "#4ECDC4",
        bg: "#E8FFFE",
        desc: "Letters fall from the top of the screen. The word to be built is shown with one letter blank. The student must tap the correct falling letter before it reaches the bottom. Wrong taps are penalised.",
        aim: "Aim: Develops rapid phoneme recognition under time pressure — a gamified way to reinforce letter-sound knowledge and build automatic recall.",
      },
      {
        emoji: "〰️",
        name: "Draw a Line",
        color: "#FF6B6B",
        bg: "#FFF0F0",
        desc: "A set of pictures is shown on the left and a set of letters on the right (or vice versa). The student hears audio cues and draws lines between matching picture-sound pairs by swiping across the screen.",
        aim: "Aim: Reinforces phoneme-grapheme correspondence in a kinesthetic way — the drawing action deepens the association between a sound and its written letter.",
      },
      {
        emoji: "🔗",
        name: "Letter-to-Sound Connection",
        color: "#4D96FF",
        bg: "#EFF6FF",
        desc: "Letters of a word are displayed across the top row. Picture slices (phoneme images) are shown in a shuffled bottom row. The student draws connecting lines between each letter and its corresponding picture slice.",
        aim: "Aim: Deepens grapheme-phoneme correspondence at the phoneme level — each letter is individually matched to its sound picture, reinforcing sub-word sound awareness.",
      },
      {
        emoji: "🎙️",
        name: "Dictation",
        color: "#FF6B6B",
        bg: "#FFF0F5",
        desc: "A word is spoken aloud (audio-only — no image shown). The student must spell the word by dragging the correct letter tiles into the blank spaces. No visual word cue is given.",
        aim: "Aim: Tests phonemic encoding (spelling from sound alone) — the highest-level phonics skill, requiring the student to convert heard sounds directly into written letters without visual support.",
      },
      {
        emoji: "✏️",
        name: "Write / Handwriting Trace",
        color: "#C77DFF",
        bg: "#FAF0FF",
        desc: "A letter is displayed with a dotted guided tracing path. The student traces the letter on the touchscreen with their finger. The app provides stroke recognition feedback, confirming correct pen direction and form.",
        aim: "Aim: Develops fine motor skills and letter formation — combining the visual, auditory, and motor memory pathways (VAK learning) to reinforce letter shapes alongside their sounds.",
      },
      {
        emoji: "✏️",
        name: "Write V2",
        color: "#C77DFF",
        bg: "#FAF0FF",
        desc: "Six letter tiles are presented. The student must identify and trace the 3 correct letters that spell the target word. Combines letter identification with handwriting in a single interactive challenge.",
        aim: "Aim: Bridges letter recognition and handwriting — students decode the word, select the correct letters, and practise writing them in sequence.",
      },
      {
        emoji: "🗺️",
        name: "Campaign Mode",
        color: "#1a3a5c",
        bg: "#E8F0FB",
        desc: "The Campaign is the core structured learning journey of Learn With Cody. Students select a vowel sound (Short A, Short I, Short O, etc.) and progress through up to 31 graded levels. Each level contains 5–6 rounds mixing different game types in a deliberate pedagogical sequence: Introduction → Practice → Review → Assessment.",
        aim: "Aim: Provides a complete, curriculum-aligned phonics programme — the campaign ensures systematic coverage of each vowel sound using spaced repetition, varied practice, and escalating challenge.",
      },
    ];

    const gamesHtml = games.map((g) => `
      <table width="100%" style="margin-bottom:24px; border-collapse:collapse; border:2px solid #ddd; border-radius:10px; overflow:hidden; page-break-inside:avoid;">
        <tr>
          <td style="background:${g.color}; padding:10px 16px; width:50px; text-align:center; font-size:22pt; vertical-align:middle;">${g.emoji}</td>
          <td style="background:${g.color}; padding:10px 16px; font-size:14pt; font-weight:700; color:white; font-family:Calibri,sans-serif; vertical-align:middle;">${g.name}</td>
        </tr>
        <tr>
          <td colspan="2" style="background:${g.bg}; padding:14px 16px; font-family:Calibri,sans-serif; font-size:11pt; color:#333; line-height:1.7;">${g.desc}</td>
        </tr>
        <tr>
          <td colspan="2" style="background:#1a3a5c; padding:10px 16px; font-family:Calibri,sans-serif; font-size:10pt; color:white; font-style:italic;">${g.aim}</td>
        </tr>
      </table>
    `).join("");

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Learn With Cody — Games Overview</title>
<style>
  body { font-family:Calibri,sans-serif; margin:2cm; font-size:11pt; color:#1a1a1a; line-height:1.6; }
  h1 { font-size:26pt; color:#1a3a5c; text-align:center; margin-bottom:4px; }
  h2 { font-size:16pt; color:#1a3a5c; border-bottom:2px solid #c07a00; padding-bottom:4px; margin:32px 0 16px; }
  p { margin:6px 0; }
  .cover { text-align:center; padding:30px 0 40px; border-bottom:3px solid #1a3a5c; margin-bottom:36px; }
  .cover .sub { font-size:13pt; color:#c07a00; font-style:italic; margin-top:6px; }
  .cover .meta { font-size:10pt; color:#666; margin-top:18px; line-height:2; }
  .footer { margin-top:48px; padding-top:14px; border-top:2px solid #1a3a5c; text-align:center; font-size:9pt; color:#888; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <p style="font-size:9pt;letter-spacing:3px;color:#888;text-transform:uppercase;margin-bottom:12px;">Product Overview Document</p>
  <p style="font-size:12pt;color:#555;">ShenZhen Horizon Education Technology Co., Ltd.</p>
  <h1>Learn With Cody</h1>
  <p class="sub">Meet Cody &amp; Game Descriptions</p>
  <div style="width:60px;height:3px;background:#c07a00;margin:16px auto;"></div>
  <div class="meta">
    <p><strong>Document Date:</strong> June 2026</p>
    <p><strong>Classification:</strong> Confidential — For Investor &amp; Partner Use</p>
  </div>
</div>

<!-- SECTION 1: WHO IS CODY? -->
<h2>1. Meet Cody — Your Phonics Learning Companion</h2>
<table width="100%" style="border-collapse:collapse; margin-bottom:24px;">
  <tr>
    <td style="width:260px; text-align:center; vertical-align:top; padding-right:24px;">
      <img src="${CODY_IMG}" width="240" style="border-radius:16px;" alt="Cody the Phonics Monster" />
      <p style="font-size:10pt; color:#888; font-style:italic; margin-top:6px;">Cody — Learn With Cody's mascot</p>
    </td>
    <td style="vertical-align:top; padding-top:8px;">
      <p style="font-size:14pt; font-weight:700; color:#1a3a5c; margin-bottom:12px;">Who is Cody?</p>
      <p>Cody is the friendly, colourful monster mascot of <em>Learn With Cody</em>. Covered in rainbow fur and wearing a vest covered in alphabet letters, Cody embodies the joy of learning to read.</p>
      <br/>
      <p>Cody serves as the child's guide throughout the entire phonics learning journey — celebrating correct answers, encouraging persistence after mistakes, and introducing each new game type with audio instructions in both <strong>English and Mandarin Chinese</strong>.</p>
      <br/>
      <p>Designed to appeal to children aged 4 to 9, Cody's warm, approachable appearance and playful personality make the often-challenging task of learning phonics feel like a fun adventure rather than a chore.</p>
      <br/>
      <p>Cody appears across the app in the <strong>Campaign Map, Games Hub, Flashcards</strong>, and as an animated companion on the Tab Bar — always present, always encouraging.</p>
      <br/>
      <table width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="background:#1a3a5c; color:white; padding:8px 12px; font-weight:700; font-size:10pt; border-radius:6px 6px 0 0;">Cody's Key Traits</td>
        </tr>
        <tr style="background:#EFF6FF;"><td style="padding:7px 12px; font-size:10pt; border-bottom:1px solid #ddd;">🌈 Rainbow-coloured fur — warm, welcoming, and fun</td></tr>
        <tr><td style="padding:7px 12px; font-size:10pt; border-bottom:1px solid #ddd;">🔤 Alphabet vest — signals learning and literacy</td></tr>
        <tr style="background:#EFF6FF;"><td style="padding:7px 12px; font-size:10pt; border-bottom:1px solid #ddd;">👋 Always waving — friendly and approachable for young learners</td></tr>
        <tr><td style="padding:7px 12px; font-size:10pt; border-bottom:1px solid #ddd;">🔊 Bilingual voice — speaks English and Mandarin Chinese</td></tr>
        <tr style="background:#EFF6FF;"><td style="padding:7px 12px; font-size:10pt;">🏆 Celebrates every win — star ratings, encouragement, completion screens</td></tr>
      </table>
    </td>
  </tr>
</table>

<!-- SECTION 2: THE GAMES -->
<h2>2. Game Types — Descriptions &amp; Learning Aims</h2>
<p style="color:#555; font-size:10pt; margin-bottom:20px;"><em>Learn With Cody</em> features 12+ distinct game types, each designed to target a specific phonics skill. Games appear both in the independent Games Hub and woven into the structured Campaign levels.</p>

${gamesHtml}

<div class="footer">
  <p>© 2026 ShenZhen Horizon Education Technology Co., Ltd. | All Rights Reserved</p>
  <p>This document is confidential and intended for authorised recipients only.</p>
  <p style="font-style:italic; margin-top:4px;">Learn With Cody — Empowering Every Child to Read</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url2 = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url2;
    a.download = "LearnWithCody_Games_Overview.doc";
    a.click();
    URL.revokeObjectURL(url2);
  };

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", background: "#f4f1eb", minHeight: "100vh", padding: "20px" }}>
      {/* Print button - hidden in print */}
      <div className="no-print" style={{ textAlign: "center", marginBottom: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={handlePrint}
          style={{ background: "#1a3a5c", color: "white", border: "none", padding: "12px 32px", fontSize: 15, borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
        >
          ⬇ Print / Save as PDF
        </button>
        <button
          onClick={handleDownloadWord}
          style={{ background: "#2e7d32", color: "white", border: "none", padding: "12px 32px", fontSize: 15, borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
        >
          📄 Download as Word (.doc)
        </button>
        <button
          onClick={handleDownloadGamesDoc}
          style={{ background: "#6a1b9a", color: "white", border: "none", padding: "12px 32px", fontSize: 15, borderRadius: 6, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
        >
          🎮 Download Games Overview (.doc)
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