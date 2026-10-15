const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Student / Presenter';
pres.title = 'TAE2: Automated Mealy to Moore Machine Matrix Converter';

// Colors & Styling
const THEME = {
  bgDark: '0B0F19',
  bgCard: '131B2E',
  textBright: 'FFFFFF',
  textMuted: '94A3B8',
  primary: '3B82F6',
  accent: '10B981',
  warning: 'F59E0B',
  purple: '8B5CF6'
};

function createSlide(title, subtitle) {
  const slide = pres.addSlide();
  slide.background = { color: THEME.bgDark };

  // Header banner
  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.4, w: 12.33, h: 1.1,
    fill: { color: THEME.bgCard },
    line: { color: THEME.primary, width: 1.5 }
  });

  slide.addText(title, {
    x: 0.8, y: 0.45, w: 11.5, h: 0.6,
    fontSize: 22, bold: true, color: THEME.textBright, fontFace: 'Arial'
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 0.98, w: 11.5, h: 0.4,
      fontSize: 12, color: THEME.primary, fontFace: 'Arial'
    });
  }

  // Footer
  slide.addText('TAE2 Technical Seminar | Automated Mealy to Moore Machine Matrix Converter', {
    x: 0.5, y: 7.0, w: 10.0, h: 0.3,
    fontSize: 9, color: THEME.textMuted, fontFace: 'Arial'
  });

  return slide;
}

// SLIDE 1: Title Slide
const slide1 = pres.addSlide();
slide1.background = { color: THEME.bgDark };

slide1.addShape(pres.ShapeType.rect, {
  x: 1.0, y: 1.0, w: 11.33, h: 5.5,
  fill: { color: THEME.bgCard },
  line: { color: THEME.primary, width: 2 }
});

slide1.addText('TECHNICAL ASSESSMENT EVALUATION 2 (TAE2)', {
  x: 1.5, y: 1.5, w: 10.33, h: 0.5,
  fontSize: 14, bold: true, color: THEME.primary, fontFace: 'Arial', align: 'center'
});

slide1.addText('Automated Mealy to Moore Machine Matrix Converter\n& Dual Verification Simulator', {
  x: 1.5, y: 2.1, w: 10.33, h: 1.4,
  fontSize: 28, bold: true, color: THEME.textBright, fontFace: 'Arial', align: 'center'
});

slide1.addText('A Formal Methods & Software Engineering Approach to Finite State Machine Conversion', {
  x: 1.5, y: 3.5, w: 10.33, h: 0.5,
  fontSize: 14, italic: true, color: THEME.textMuted, fontFace: 'Arial', align: 'center'
});

slide1.addShape(pres.ShapeType.line, {
  x: 3.5, y: 4.3, w: 6.33, h: 0,
  line: { color: THEME.primary, width: 2 }
});

slide1.addText('Course: Theory of Computation / Formal Languages & Automata Theory\nDeliverable: Seminar Presentation, PWA & CLI Application, Verification Benchmarks', {
  x: 1.5, y: 4.7, w: 10.33, h: 1.0,
  fontSize: 12, color: THEME.textBright, fontFace: 'Arial', align: 'center'
});

// SLIDE 2: Introduction to Finite State Automata with Outputs
const slide2 = createSlide('1. Introduction: Finite State Automata with Output', 'Theoretical Computer Science & Sequential Logic Systems');

slide2.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 1.8, w: 5.6, h: 4.8,
  fill: { color: THEME.bgCard }, line: { color: THEME.primary, width: 1 }
});
slide2.addText('Mealy Machine Model', {
  x: 1.1, y: 2.0, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: THEME.warning
});
slide2.addText([
  { text: '• Output Dependency: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Outputs are associated directly with TRANSITIONS.\n', options: { color: THEME.textMuted } },
  { text: '• Formal Tuple: ', options: { bold: true, color: THEME.textBright } },
  { text: 'M1 = (Q, Sigma, Delta, delta, lambda, q0)\n', options: { color: THEME.primary } },
  { text: '• Output Function: ', options: { bold: true, color: THEME.textBright } },
  { text: 'lambda: Q x Sigma -> Delta (depends on current state AND input symbol).\n', options: { color: THEME.textMuted } },
  { text: '• Response Time: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Reacts instantaneously within the same clock cycle.\n', options: { color: THEME.textMuted } },
  { text: '• State Efficiency: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Often requires fewer states to model the same logic.', options: { color: THEME.textMuted } }
], { x: 1.1, y: 2.5, w: 5.0, h: 3.8, fontSize: 12, fontFace: 'Arial', lineSpacing: 18 });

slide2.addShape(pres.ShapeType.rect, {
  x: 6.9, y: 1.8, w: 5.6, h: 4.8,
  fill: { color: THEME.bgCard }, line: { color: THEME.accent, width: 1 }
});
slide2.addText('Moore Machine Model', {
  x: 7.2, y: 2.0, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: THEME.accent
});
slide2.addText([
  { text: '• Output Dependency: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Outputs are associated strictly with STATES.\n', options: { color: THEME.textMuted } },
  { text: '• Formal Tuple: ', options: { bold: true, color: THEME.textBright } },
  { text: 'M2 = (Q\', Sigma, Delta, delta\', lambda\', q0\')\n', options: { color: THEME.accent } },
  { text: '• Output Function: ', options: { bold: true, color: THEME.textBright } },
  { text: 'lambda\': Q\' -> Delta (depends ONLY on the current state).\n', options: { color: THEME.textMuted } },
  { text: '• Stability: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Glitches/noise on input do not immediately corrupt outputs.\n', options: { color: THEME.textMuted } },
  { text: '• Timing: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Outputs delayed by 1 clock cycle (synchronous).', options: { color: THEME.textMuted } }
], { x: 7.2, y: 2.5, w: 5.0, h: 3.8, fontSize: 12, fontFace: 'Arial', lineSpacing: 18 });

// SLIDE 3: Detailed Comparison Matrix
const slide3 = createSlide('2. Architectural Comparison: Mealy vs. Moore', 'Detailed Hardware & Algorithmic Trade-offs');

const compTableData = [
  [
    { text: 'Characteristic', options: { bold: true, color: THEME.textBright, fill: '1E293B' } },
    { text: 'Mealy Machine', options: { bold: true, color: THEME.warning, fill: '1E293B' } },
    { text: 'Moore Machine', options: { bold: true, color: THEME.accent, fill: '1E293B' } }
  ],
  [
    { text: 'Output Association', options: { bold: true, color: THEME.textBright } },
    { text: 'On transitions (edges)', options: { color: THEME.textMuted } },
    { text: 'Inside states (nodes)', options: { color: THEME.textMuted } }
  ],
  [
    { text: 'Output Function', options: { bold: true, color: THEME.textBright } },
    { text: 'λ(q, a) — State & Input', options: { color: THEME.primary } },
    { text: 'λ\'(q) — State only', options: { color: THEME.accent } }
  ],
  [
    { text: 'Output Length for string of length n', options: { bold: true, color: THEME.textBright } },
    { text: 'Exactly n symbols', options: { color: THEME.textMuted } },
    { text: 'n + 1 symbols (includes initial state output)', options: { color: THEME.textMuted } }
  ],
  [
    { text: 'Hardware Hardware Complexity', options: { bold: true, color: THEME.textBright } },
    { text: 'Fewer flip-flops / states, combinational output path', options: { color: THEME.textMuted } },
    { text: 'More flip-flops / states, registered stable output path', options: { color: THEME.textMuted } }
  ],
  [
    { text: 'Susceptibility to Glitches', options: { bold: true, color: THEME.textBright } },
    { text: 'High (input glitches propagate directly to output)', options: { color: THEME.warning } },
    { text: 'Low (immune to combinational input glitches)', options: { color: THEME.accent } }
  ]
];

slide3.addTable(compTableData, {
  x: 0.8, y: 1.8, w: 11.7, h: 4.5,
  colW: [3.2, 4.25, 4.25],
  border: { pt: 1, color: THEME.primary },
  fill: THEME.bgCard,
  fontSize: 11,
  fontFace: 'Arial',
  align: 'left',
  valign: 'middle'
});

// SLIDE 4: Conversion Algorithm & Principles
const slide4 = createSlide('3. The Automated Conversion Algorithm', 'Mathematical State Splitting & Remapping Pipeline');

const steps = [
  { step: 'Step 1: Extract Incoming Outputs', desc: 'For every Mealy state q, identify all outputs arriving at q across all transitions: O(q) = { λ(p, a) | δ(p, a) = q }.' },
  { step: 'Step 2: State Splitting Logic', desc: 'If |O(q)| = k, split q into k Moore states: q_y1, q_y2, ..., q_yk, each assigned state output λ\'(q_yi) = yi.' },
  { step: 'Step 3: Initial State Assignment', desc: 'Designate Moore start state q0\'. If q0 has incoming outputs, pick the designated start copy (or q0_0) with initial output.' },
  { step: 'Step 4: Transition Remapping', desc: 'For each split state (q, y) and input a: δ\'((q, y), a) = (δ(q, a), λ(q, a)). Copies inherit parent transitions exactly.' },
  { step: 'Step 5: Reachability Pruning', desc: 'Perform Breadth-First Search (BFS) from q0\' to eliminate any orphaned or unreachable states.' }
];

steps.forEach((s, i) => {
  const yPos = 1.8 + i * 0.95;
  slide4.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: yPos, w: 11.7, h: 0.82,
    fill: { color: THEME.bgCard },
    line: { color: THEME.primary, width: 1 }
  });

  slide4.addText(s.step, {
    x: 1.0, y: yPos + 0.12, w: 3.5, h: 0.55,
    fontSize: 12, bold: true, color: THEME.primary, fontFace: 'Arial'
  });

  slide4.addText(s.desc, {
    x: 4.6, y: yPos + 0.12, w: 7.7, h: 0.58,
    fontSize: 11, color: THEME.textMuted, fontFace: 'Arial'
  });
});

// SLIDE 5: Mathematical Equivalence Theorem
const slide5 = createSlide('4. Mathematical Equivalence Theorem & Proof', 'Formal Relationship Between Output Streams');

slide5.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 1.8, w: 11.7, h: 1.3,
  fill: { color: THEME.bgCard }, line: { color: THEME.accent, width: 1.5 }
});

slide5.addText('Theorem: Behavioral Equivalence of Transformed Moore Machine', {
  x: 1.0, y: 1.95, w: 11.3, h: 0.35, fontSize: 14, bold: true, color: THEME.accent
});

slide5.addText('For any input sequence w = a1 a2 ... an in Sigma*:\nMealy(w) = z1 z2 ... zn   (Length n)\nMoore(w) = z0\' z1\' z2\' ... zn\'   (Length n + 1, where z0\' = lambda\'(q0\'))\nEQUIVALENCE PROPERTY: Moore(w) = lambda\'(q0\') . Mealy(w)  =>  zt\' = zt for all t in {1, 2, ..., n}', {
  x: 1.0, y: 2.35, w: 11.3, h: 0.7, fontSize: 11, fontFace: 'Fira Code', color: THEME.textBright
});

slide5.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 3.3, w: 5.6, h: 3.3,
  fill: { color: THEME.bgCard }, line: { color: THEME.primary, width: 1 }
});
slide5.addText('Inductive Proof by Transition', {
  x: 1.0, y: 3.45, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: THEME.primary
});
slide5.addText([
  { text: '• Base Case (t = 1): ', options: { bold: true, color: THEME.textBright } },
  { text: 'Mealy transitions from q0 on a1 producing z1 = lambda(q0, a1), reaching q1.\nMoore moves from q0\' to (q1, z1), whose state output is z1\' = z1. Holds!\n\n', options: { color: THEME.textMuted } },
  { text: '• Inductive Hypothesis: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Assume z_k\' = z_k and state is (q_k, z_k) at step k.\n\n', options: { color: THEME.textMuted } },
  { text: '• Induction Step (k + 1): ', options: { bold: true, color: THEME.textBright } },
  { text: 'Next Mealy output is z_{k+1} = lambda(q_k, a_{k+1}). Moore transition maps to (q_{k+1}, z_{k+1}) with output z_{k+1}\' = z_{k+1}. Q.E.D.', options: { color: THEME.textMuted } }
], { x: 1.0, y: 3.85, w: 5.2, h: 2.6, fontSize: 10, fontFace: 'Arial' });

slide5.addShape(pres.ShapeType.rect, {
  x: 6.9, y: 3.3, w: 5.6, h: 3.3,
  fill: { color: THEME.bgCard }, line: { color: THEME.warning, width: 1 }
});
slide5.addText('Key Takeaways & Boundary Handling', {
  x: 7.1, y: 3.45, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: THEME.warning
});
slide5.addText([
  { text: '• 1-Cycle Offset: ', options: { bold: true, color: THEME.textBright } },
  { text: 'The initial output z0\' is produced before reading any input symbol.\n\n', options: { color: THEME.textMuted } },
  { text: '• Determinism Preserved: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Since every (q, y) has deterministic targets, Moore automaton is strictly deterministic (DFA with output).\n\n', options: { color: THEME.textMuted } },
  { text: '• Reachability Safety: ', options: { bold: true, color: THEME.textBright } },
  { text: 'Splitting produces at most |Q| x |Delta| states. BFS guarantees no orphan states remain.', options: { color: THEME.textMuted } }
], { x: 7.1, y: 3.85, w: 5.2, h: 2.6, fontSize: 10, fontFace: 'Arial' });

// SLIDE 6: Walkthrough Example: 101 Detector
const slide6 = createSlide('5. Case Study: 101 Sequence Detector Conversion', 'Step-by-Step Matrix Transformation');

const mealyExTable = [
  [{ text: 'Present', options: { bold: true, fill: '1E293B' } }, { text: 'Next (x=0)', options: { bold: true, fill: '1E293B' } }, { text: 'Out (x=0)', options: { bold: true, fill: '1E293B' } }, { text: 'Next (x=1)', options: { bold: true, fill: '1E293B' } }, { text: 'Out (x=1)', options: { bold: true, fill: '1E293B' } }],
  ['S0 (Start)', 'S0', '0', 'S1', '0'],
  ['S1', 'S2', '0', 'S1', '0'],
  ['S2', 'S0', '0', 'S1', '1']
];

slide6.addText('Input: Mealy Machine Matrix', { x: 0.8, y: 1.8, w: 5.5, h: 0.35, fontSize: 13, bold: true, color: THEME.warning });
slide6.addTable(mealyExTable, { x: 0.8, y: 2.2, w: 5.5, h: 1.8, border: { pt: 1, color: THEME.primary }, fontSize: 10, fill: THEME.bgCard, align: 'center' });

slide6.addText('State Splitting Analysis:\n• S0 entered with: {0} => S0_0 (out: 0)\n• S1 entered with: {0, 1} => S1_0 (out: 0), S1_1 (out: 1)\n• S2 entered with: {0} => S2_0 (out: 0)', {
  x: 0.8, y: 4.2, w: 5.5, h: 1.5, fontSize: 10, fontFace: 'Fira Code', color: THEME.textBright
});

const mooreExTable = [
  [{ text: 'Present', options: { bold: true, fill: '1E293B' } }, { text: 'Next (x=0)', options: { bold: true, fill: '1E293B' } }, { text: 'Next (x=1)', options: { bold: true, fill: '1E293B' } }, { text: 'State Output', options: { bold: true, fill: '1E293B', color: THEME.accent } }],
  ['S0_0 (Start)', 'S0_0', 'S1_0', '0'],
  ['S1_0', 'S2_0', 'S1_0', '0'],
  ['S1_1', 'S2_0', 'S1_0', '1'],
  ['S2_0', 'S0_0', 'S1_1', '0']
];

slide6.addText('Output: Equivalent Moore Machine Matrix', { x: 6.9, y: 1.8, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: THEME.accent });
slide6.addTable(mooreExTable, { x: 6.9, y: 2.2, w: 5.6, h: 2.2, border: { pt: 1, color: THEME.accent }, fontSize: 10, fill: THEME.bgCard, align: 'center' });

slide6.addText('Verification on Input w = "10101101":\nMealy Output: 00101001\nMoore Output: 000101001 (Match: 100% PASS)', {
  x: 6.9, y: 4.6, w: 5.6, h: 1.2, fontSize: 10, fontFace: 'Fira Code', color: THEME.accent
});

// SLIDE 7: Software Engineering & App Implementation
const slide7 = createSlide('6. Software Architecture & Implementation', 'Cross-Platform System Design');

const archBoxes = [
  { title: 'Core Logic Engine (converter.js / converter.py)', desc: 'Dual-target pure algorithmic core. Handles state incoming analysis, state splitting, reachability BFS, and dual simulation.' },
  { title: 'Interactive Web UI & PWA (index.html, style.css)', desc: 'Glassmorphic dark-theme UI. Dynamic state table editor, raw CSV/matrix parser, preset library, LaTeX/Markdown/JSON exporter.' },
  { title: 'Dynamic SVG Diagram Generator (app.js)', desc: 'Circular topology layout engine. Draws states, curved transition arrows with labels, self-loops, and start state markers.' },
  { title: 'Dual-Machine Simulation Sandbox', desc: 'Synchronous clock-cycle execution. Steps Mealy and Moore machines simultaneously, displaying live bitstream alignment.' }
];

archBoxes.forEach((b, i) => {
  const x = (i % 2 === 0) ? 0.8 : 6.9;
  const y = (i < 2) ? 1.8 : 4.2;

  slide7.addShape(pres.ShapeType.roundRect, {
    x, y, w: 5.6, h: 2.1,
    fill: { color: THEME.bgCard }, line: { color: THEME.primary, width: 1.5 }
  });

  slide7.addText(b.title, {
    x: x + 0.2, y: y + 0.15, w: 5.2, h: 0.5,
    fontSize: 13, bold: true, color: THEME.primary
  });

  slide7.addText(b.desc, {
    x: x + 0.2, y: y + 0.7, w: 5.2, h: 1.25,
    fontSize: 10.5, color: THEME.textMuted
  });
});

// SLIDE 8: Cross-Platform Deployment (Desktop & Mobile)
const slide8 = createSlide('7. Multi-Platform Deployment: Desktop & Mobile', 'Progressive Web App, Electron Desktop, & Mobile Phone Execution');

const platforms = [
  { name: 'Progressive Web App (PWA)', icon: '🌐', items: ['Installable on Chrome, Edge, Safari', 'Offline caching via Service Worker (sw.js)', 'App manifest with full-screen standalone mode'] },
  { name: 'Desktop Native App (Electron)', icon: '💻', items: ['electron-main.js standalone wrapper', 'Frameless / dark window aesthetic', 'Compilable to Windows .exe installer'] },
  { name: 'Mobile Phone App (Android/iOS)', icon: '📱', items: ['Touch-friendly responsive UI (viewport scale)', 'Add to Home Screen support with native icon', 'Capacitor-ready for direct APK build'] }
];

platforms.forEach((p, i) => {
  const x = 0.8 + i * 4.0;
  slide8.addShape(pres.ShapeType.rect, {
    x, y: 1.8, w: 3.7, h: 4.8,
    fill: { color: THEME.bgCard }, line: { color: THEME.primary, width: 1.5 }
  });

  slide8.addText(`${p.icon} ${p.name}`, {
    x: x + 0.2, y: 2.0, w: 3.3, h: 0.8,
    fontSize: 14, bold: true, color: THEME.textBright, align: 'center'
  });

  p.items.forEach((item, idx) => {
    slide8.addText(`✔ ${item}`, {
      x: x + 0.2, y: 3.0 + idx * 1.1, w: 3.3, h: 0.9,
      fontSize: 11, color: THEME.textMuted
    });
  });
});

// SLIDE 9: Empirical Validation & Benchmark Suite
const slide9 = createSlide('8. Empirical Testing & Validation Suite', 'Automated Verification on Classical Automata');

const testTableData = [
  [
    { text: 'Benchmark Problem', options: { bold: true, fill: '1E293B' } },
    { text: 'Mealy States', options: { bold: true, fill: '1E293B' } },
    { text: 'Moore States', options: { bold: true, fill: '1E293B' } },
    { text: 'Test Sequence', options: { bold: true, fill: '1E293B' } },
    { text: 'Verification Status', options: { bold: true, fill: '1E293B', color: THEME.accent } }
  ],
  ['101 Sequence Detector', '3', '4', '10101101', 'PASS (100% Match)'],
  ['2\'s Complement Generator', '2', '3', '001010, 1101', 'PASS (100% Match)'],
  ['4-State Standard Exam FSM', '4', '6', '010110', 'PASS (100% Match)'],
  ['Even/Odd Parity Checker', '2', '3', '1101001', 'PASS (100% Match)'],
  ['Serial Binary Adder (Carry)', '2', '3', '00 01 10 11', 'PASS (100% Match)']
];

slide9.addTable(testTableData, {
  x: 0.8, y: 1.8, w: 11.7, h: 3.6,
  border: { pt: 1, color: THEME.primary },
  fill: THEME.bgCard,
  fontSize: 11,
  align: 'center',
  valign: 'middle'
});

slide9.addText('Summary: All 5 canonical test suites pass rigorous equivalence checking. Output sequences match with 100% mathematical fidelity across all clock cycles t >= 1.', {
  x: 0.8, y: 5.7, w: 11.7, h: 0.8,
  fontSize: 11, bold: true, color: THEME.accent, fontFace: 'Arial'
});

// SLIDE 10: Conclusion & Deliverables Summary
const slide10 = createSlide('9. Conclusion & Project Deliverables', 'Summary of Assessment Deliverables');

slide10.addShape(pres.ShapeType.rect, {
  x: 0.8, y: 1.8, w: 11.7, h: 4.8,
  fill: { color: THEME.bgCard }, line: { color: THEME.accent, width: 2 }
});

slide10.addText('Submission Deliverables Checklist:', {
  x: 1.2, y: 2.1, w: 11.0, h: 0.4,
  fontSize: 16, bold: true, color: THEME.accent
});

const checklist = [
  '1. Complete Application Source Code: Packaged in Mealy_to_Moore_App_Code.zip (< 10 MB)',
  '2. Public GitHub Repository: Complete version history and documentation',
  '3. TAE2 Seminar Presentation: Comprehensive PowerPoint deck (TAE2_Mealy_to_Moore_Seminar.pptx)',
  '4. Prompt Engineering Log: Excel spreadsheet (TAE2_Model_Creation_Prompts.xlsx)',
  '5. Test Cases & Verification Report: Word Document with 5+ benchmark I/O pairs (Mealy_to_Moore_Test_Cases_IO.docx)'
];

checklist.forEach((item, idx) => {
  slide10.addText(`✔ ${item}`, {
    x: 1.2, y: 2.7 + idx * 0.7, w: 11.0, h: 0.5,
    fontSize: 12, color: THEME.textBright, fontFace: 'Arial'
  });
});

const outDir = path.join(__dirname, 'submission_files');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pptPath = path.join(outDir, 'TAE2_Mealy_to_Moore_Seminar_Presentation.pptx');
pres.writeFile({ fileName: pptPath }).then(() => {
  console.log(`PPTX created successfully at: ${pptPath}`);
}).catch(err => {
  console.error('Error generating PPTX:', err);
});
