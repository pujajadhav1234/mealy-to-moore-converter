/**
 * Mealy to Moore Machine Interactive Web Application
 * Handles UI interactions, SVG state diagrams, presets, and dual simulation.
 */

// Preset Definitions
const PRESETS = {
  seq101: {
    name: "101 Sequence Detector (Overlapping)",
    states: ["S0", "S1", "S2"],
    alphabet: ["0", "1"],
    startState: "S0",
    initialOutput: "0",
    transitions: {
      "S0": { "0": { nextState: "S0", output: "0" }, "1": { nextState: "S1", output: "0" } },
      "S1": { "0": { nextState: "S2", output: "0" }, "1": { nextState: "S1", output: "0" } },
      "S2": { "0": { nextState: "S0", output: "0" }, "1": { nextState: "S1", output: "1" } }
    },
    simSample: "10101101"
  },
  twosComp: {
    name: "2's Complement Generator (LSB First)",
    states: ["A", "B"],
    alphabet: ["0", "1"],
    startState: "A",
    initialOutput: "0",
    transitions: {
      "A": { "0": { nextState: "A", output: "0" }, "1": { nextState: "B", output: "1" } },
      "B": { "0": { nextState: "B", output: "1" }, "1": { nextState: "B", output: "0" } }
    },
    simSample: "001010"
  },
  textbook4: {
    name: "4-State Standard Exam Problem",
    states: ["q1", "q2", "q3", "q4"],
    alphabet: ["0", "1"],
    startState: "q1",
    initialOutput: "0",
    transitions: {
      "q1": { "0": { nextState: "q3", output: "0" }, "1": { nextState: "q2", output: "0" } },
      "q2": { "0": { nextState: "q1", output: "1" }, "1": { nextState: "q4", output: "0" } },
      "q3": { "0": { nextState: "q2", output: "1" }, "1": { nextState: "q1", output: "1" } },
      "q4": { "0": { nextState: "q4", output: "1" }, "1": { nextState: "q3", output: "0" } }
    },
    simSample: "010110"
  },
  parity: {
    name: "Odd/Even Parity Checker",
    states: ["Even", "Odd"],
    alphabet: ["0", "1"],
    startState: "Even",
    initialOutput: "0",
    transitions: {
      "Even": { "0": { nextState: "Even", output: "0" }, "1": { nextState: "Odd", output: "1" } },
      "Odd": { "0": { nextState: "Odd", output: "1" }, "1": { nextState: "Even", output: "0" } }
    },
    simSample: "1101001"
  },
  serialAdder: {
    name: "Serial Binary Adder (Carry Bit Machine)",
    states: ["C0", "C1"],
    alphabet: ["00", "01", "10", "11"],
    startState: "C0",
    initialOutput: "0",
    transitions: {
      "C0": {
        "00": { nextState: "C0", output: "0" },
        "01": { nextState: "C0", output: "1" },
        "10": { nextState: "C0", output: "1" },
        "11": { nextState: "C1", output: "0" }
      },
      "C1": {
        "00": { nextState: "C0", output: "1" },
        "01": { nextState: "C1", output: "0" },
        "10": { nextState: "C1", output: "0" },
        "11": { nextState: "C1", output: "1" }
      }
    },
    simSample: "01"
  }
};

// Global App State
let currentMealy = null;
let currentConversion = null;
let activeDiagramMode = "moore"; // "mealy" or "moore"
let simState = {
  active: false,
  stepIndex: 0,
  inputSequence: "",
  mealyCurrent: "",
  mooreCurrent: "",
  mealyHistory: [],
  mooreHistory: []
};

// DOM References
const alphabetInput = document.getElementById("alphabet-input");
const startStateSelect = document.getElementById("start-state-select");
const initOutputVal = document.getElementById("init-output-val");
const mealyTableHead = document.getElementById("mealy-table-head");
const mealyTableBody = document.getElementById("mealy-table-body");
const mooreTableHead = document.getElementById("moore-table-head");
const mooreTableBody = document.getElementById("moore-table-body");
const chkReachable = document.getElementById("chk-reachable-only");

const statMealyCount = document.getElementById("stat-mealy-count");
const statMooreCount = document.getElementById("stat-moore-count");
const statMooreStart = document.getElementById("stat-moore-start");

const stepIncomingAnalysis = document.getElementById("step-incoming-analysis");
const stepSplittingAnalysis = document.getElementById("step-splitting-analysis");
const stepMappingAnalysis = document.getElementById("step-mapping-analysis");

const simInputString = document.getElementById("sim-input-string");
const btnRunSim = document.getElementById("btn-run-sim");
const btnStepSim = document.getElementById("btn-step-sim");
const btnResetSim = document.getElementById("btn-reset-sim");
const bodyMealySim = document.getElementById("body-mealy-sim");
const bodyMooreSim = document.getElementById("body-moore-sim");
const simMealyCurr = document.getElementById("sim-mealy-curr");
const simMooreCurr = document.getElementById("sim-moore-curr");
const simMealyStream = document.getElementById("sim-mealy-stream");
const simMooreStream = document.getElementById("sim-moore-stream");

// Initialize on Load
let deferredInstallPrompt = null;

window.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  setupPWA();
  loadPreset("seq101");
});

function setupPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA ServiceWorker registered with scope:', reg.scope))
      .catch(err => console.log('ServiceWorker registration error:', err));
  }

  // Handle PWA Install Prompt (Desktop Chrome/Edge & Mobile Android)
  const installBtn = document.getElementById("btn-install-pwa");

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        installBtn.classList.add('hidden');
      }
      deferredInstallPrompt = null;
    } else {
      // iOS or manual instructions
      alert("To install on iOS / Safari:\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap 'Add to Home Screen'\n\nOn Desktop:\nLook for the install icon in the address bar!");
    }
  });

  // If on iOS Safari, show the install button with instructions
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
  if (isIos && !isInStandaloneMode) {
    installBtn.classList.remove('hidden');
  }
}

function setupEventListeners() {
  // Preset buttons
  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadPreset(btn.dataset.preset);
    });
  });

  // Action buttons
  document.getElementById("btn-run-convert").addEventListener("click", performConversion);
  document.getElementById("btn-add-state").addEventListener("click", addMealyState);
  document.getElementById("btn-remove-state").addEventListener("click", removeLastMealyState);
  alphabetInput.addEventListener("change", refreshTableColumns);

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
      if (tab.dataset.tab === "tab-raw") {
        syncVisualToRaw();
      }
    });
  });

  document.getElementById("btn-parse-raw").addEventListener("click", parseRawMatrixInput);

  // Diagram mode toggles
  document.getElementById("btn-show-mealy-diagram").addEventListener("click", () => {
    activeDiagramMode = "mealy";
    document.getElementById("btn-show-mealy-diagram").className = "btn btn-sm btn-primary";
    document.getElementById("btn-show-moore-diagram").className = "btn btn-sm btn-outline";
    renderDiagram();
  });

  document.getElementById("btn-show-moore-diagram").addEventListener("click", () => {
    activeDiagramMode = "moore";
    document.getElementById("btn-show-moore-diagram").className = "btn btn-sm btn-primary";
    document.getElementById("btn-show-mealy-diagram").className = "btn btn-sm btn-outline";
    renderDiagram();
  });

  // Simulation controls
  btnRunSim.addEventListener("click", runFullSimulation);
  btnStepSim.addEventListener("click", stepSimulation);
  btnResetSim.addEventListener("click", resetSimulation);

  // Export dropdown
  const exportBtn = document.getElementById("btn-export-menu");
  const dropdown = document.getElementById("export-dropdown-content");
  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });
  document.addEventListener("click", () => dropdown.classList.add("hidden"));

  document.getElementById("exp-latex").addEventListener("click", () => showExportModal("LaTeX Table", exportToLaTeX()));
  document.getElementById("exp-markdown").addEventListener("click", () => showExportModal("Markdown Table", exportToMarkdown()));
  document.getElementById("exp-csv").addEventListener("click", () => showExportModal("CSV Format", exportToCSV()));
  document.getElementById("exp-json").addEventListener("click", () => showExportModal("JSON Schema", exportToJSON()));

  // Modal close
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("btn-modal-done").addEventListener("click", closeModal);
  document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
  document.getElementById("btn-modal-copy").addEventListener("click", copyModalText);

  // Quick tour / theory
  document.getElementById("btn-quick-tour").addEventListener("click", showTheoryModal);

  // Toggle steps
  document.getElementById("btn-toggle-steps").addEventListener("click", () => {
    const el = document.getElementById("steps-container");
    el.classList.toggle("hidden");
  });
}

// Preset Loader
function loadPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  alphabetInput.value = p.alphabet.join(", ");
  initOutputVal.value = p.initialOutput || "0";
  simInputString.value = p.simSample || "101";

  currentMealy = new MealyMachine(
    [...p.states],
    [...p.alphabet],
    p.startState,
    JSON.parse(JSON.stringify(p.transitions))
  );

  updateStartStateDropdown(p.states, p.startState);
  renderMealyInputTable();
  performConversion();
}

function getAlphabetList() {
  return alphabetInput.value
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function updateStartStateDropdown(states, selectedState) {
  startStateSelect.innerHTML = "";
  states.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    if (s === selectedState) opt.selected = true;
    startStateSelect.appendChild(opt);
  });
}

function renderMealyInputTable() {
  const alphabet = getAlphabetList();
  const states = currentMealy.states;

  // Render Table Head
  let headHtml = `<tr>
    <th style="width: 140px;">Present State</th>`;
  alphabet.forEach(sym => {
    headHtml += `<th>Input: <code>${sym}</code><br><span style="font-size:0.75rem; color:#94a3b8;">Next State / Output</span></th>`;
  });
  headHtml += `</tr>`;
  mealyTableHead.innerHTML = headHtml;

  // Render Table Body
  let bodyHtml = "";
  states.forEach(s => {
    const isStart = (s === currentMealy.startState);
    bodyHtml += `<tr data-state="${s}">
      <td>
        <input type="text" class="cell-input state-name-input" value="${s}" style="width: 70px; font-weight:700;">
        ${isStart ? '<span class="start-state-badge">Start</span>' : ''}
      </td>`;

    alphabet.forEach(sym => {
      const trans = currentMealy.transitions[s]?.[sym] || { nextState: s, output: "0" };
      bodyHtml += `<td>
        <input type="text" class="cell-input trans-input"
          data-from="${s}" data-sym="${sym}"
          value="${trans.nextState} / ${trans.output}"
          placeholder="State / Out" title="Format: NextState / Output (e.g. q1 / 0)">
      </td>`;
    });
    bodyHtml += `</tr>`;
  });
  mealyTableBody.innerHTML = bodyHtml;

  // Attach input listeners
  mealyTableBody.querySelectorAll(".trans-input").forEach(input => {
    input.addEventListener("change", syncTableToMealyMachine);
  });
  mealyTableBody.querySelectorAll(".state-name-input").forEach(input => {
    input.addEventListener("change", handleStateRenamed);
  });
}

function syncTableToMealyMachine() {
  const alphabet = getAlphabetList();
  const rows = mealyTableBody.querySelectorAll("tr");
  const states = [];
  const transitions = {};

  rows.forEach(row => {
    const stateName = row.querySelector(".state-name-input").value.trim();
    if (!stateName) return;
    states.push(stateName);
    transitions[stateName] = {};

    row.querySelectorAll(".trans-input").forEach(inp => {
      const sym = inp.dataset.sym;
      const rawVal = inp.value.trim();
      // Parse patterns: "q1 / 0", "q1, 0", "q1 0", "q1/0"
      const match = rawVal.match(/^([a-zA-Z0-9_-]+)\s*[\/,\s]\s*([a-zA-Z0-9_-]+)$/);
      if (match) {
        transitions[stateName][sym] = { nextState: match[1], output: match[2] };
      } else {
        transitions[stateName][sym] = { nextState: stateName, output: "0" };
      }
    });
  });

  const selectedStart = startStateSelect.value;
  const validStart = states.includes(selectedStart) ? selectedStart : states[0];

  currentMealy = new MealyMachine(states, alphabet, validStart, transitions);
  updateStartStateDropdown(states, validStart);
}

function handleStateRenamed() {
  syncTableToMealyMachine();
  renderMealyInputTable();
}

function addMealyState() {
  syncTableToMealyMachine();
  const alphabet = getAlphabetList();
  const newName = `S${currentMealy.states.length}`;
  currentMealy.states.push(newName);
  currentMealy.transitions[newName] = {};
  alphabet.forEach(sym => {
    currentMealy.transitions[newName][sym] = { nextState: newName, output: "0" };
  });
  updateStartStateDropdown(currentMealy.states, currentMealy.startState);
  renderMealyInputTable();
  performConversion();
}

function removeLastMealyState() {
  if (currentMealy.states.length <= 1) return;
  syncTableToMealyMachine();
  const removed = currentMealy.states.pop();
  delete currentMealy.transitions[removed];
  if (currentMealy.startState === removed) {
    currentMealy.startState = currentMealy.states[0];
  }
  updateStartStateDropdown(currentMealy.states, currentMealy.startState);
  renderMealyInputTable();
  performConversion();
}

function refreshTableColumns() {
  syncTableToMealyMachine();
  renderMealyInputTable();
  performConversion();
}

function syncVisualToRaw() {
  if (!currentMealy) return;
  const alphabet = currentMealy.alphabet;
  let text = `# PresentState, ` + alphabet.map(a => `Next(x=${a}), Out(x=${a})`).join(", ") + "\n";
  currentMealy.states.forEach(s => {
    let row = [s];
    alphabet.forEach(a => {
      const t = currentMealy.transitions[s]?.[a] || { nextState: s, output: "0" };
      row.push(t.nextState, t.output);
    });
    text += row.join(", ") + "\n";
  });
  document.getElementById("raw-matrix-input").value = text;
}

function parseRawMatrixInput() {
  const raw = document.getElementById("raw-matrix-input").value.trim();
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  if (lines.length === 0) return;

  const alphabet = getAlphabetList();
  const states = [];
  const transitions = {};

  lines.forEach(line => {
    const parts = line.split(/[,\t| ]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1 + alphabet.length * 2) {
      const state = parts[0];
      states.push(state);
      transitions[state] = {};
      let idx = 1;
      alphabet.forEach(sym => {
        transitions[state][sym] = { nextState: parts[idx], output: parts[idx + 1] };
        idx += 2;
      });
    }
  });

  if (states.length > 0) {
    currentMealy = new MealyMachine(states, alphabet, states[0], transitions);
    updateStartStateDropdown(states, states[0]);
    renderMealyInputTable();
    performConversion();
    // Switch to visual table
    document.querySelector('.tab-btn[data-tab="tab-visual"]').click();
  } else {
    alert("Invalid matrix format. Please check syntax.");
  }
}

// Primary Conversion Controller
function performConversion() {
  syncTableToMealyMachine();
  const initOut = initOutputVal.value.trim() || "0";
  const keepOnlyReachable = chkReachable.checked;

  try {
    currentConversion = convertMealyToMoore(currentMealy, {
      defaultInitialOutput: initOut,
      keepOnlyReachable: keepOnlyReachable
    });

    renderMooreResultTable(currentConversion.mooreMachine);
    renderStepBreakdown(currentConversion);
    renderDiagram();
    resetSimulation();
  } catch (err) {
    console.error("Conversion error:", err);
    alert("Error during conversion: " + err.message);
  }
}

function renderMooreResultTable(moore) {
  // Update stats
  statMealyCount.textContent = currentMealy.states.length;
  statMooreCount.textContent = moore.states.length;
  statMooreStart.textContent = moore.startState;

  // Head
  let headHtml = `<tr>
    <th style="width: 140px;">Moore State</th>`;
  moore.alphabet.forEach(sym => {
    headHtml += `<th>Next State (<code>${sym}</code>)</th>`;
  });
  headHtml += `<th class="moore-output-cell">State Output (\\(\\lambda'\\))</th></tr>`;
  mooreTableHead.innerHTML = headHtml;

  // Body
  let bodyHtml = "";
  moore.states.forEach(s => {
    const isStart = (s === moore.startState);
    bodyHtml += `<tr>
      <td style="font-weight:700;">
        ${s}
        ${isStart ? '<span class="start-state-badge">Start</span>' : ''}
      </td>`;
    moore.alphabet.forEach(sym => {
      const next = moore.transitions[s]?.[sym] || "-";
      bodyHtml += `<td><code>${next}</code></td>`;
    });
    const out = moore.stateOutputs[s];
    bodyHtml += `<td class="moore-output-cell"><code>${out}</code></td>`;
    bodyHtml += `</tr>`;
  });
  mooreTableBody.innerHTML = bodyHtml;
}

function renderStepBreakdown(conv) {
  // Step 1: Incoming Outputs
  let incHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">`;
  Object.entries(conv.incomingOutputs).forEach(([st, outs]) => {
    const outList = outs.length ? outs.map(o => `<span class="state-chip">${o}</span>`).join(" ") : `<i>(none - start state)</i>`;
    incHtml += `<div><b>${st}</b>: incoming outputs = { ${outList} }</div>`;
  });
  incHtml += `</div>`;
  stepIncomingAnalysis.innerHTML = incHtml;

  // Step 2: State Splitting
  let splitHtml = `<div>`;
  Object.entries(conv.stateMapping).forEach(([st, splitList]) => {
    const names = splitList.map(c => `<code>${c.name}</code> (out: <b>${c.output}</b>)`).join(", ");
    splitHtml += `<p>• State <b>${st}</b> splits into: ${names}</p>`;
  });
  splitHtml += `<p style="margin-top:8px; color:#34d399;">Selected Moore Start State: <b>${conv.mooreMachine.startState}</b> (Initial state output = <b>${conv.mooreMachine.stateOutputs[conv.mooreMachine.startState]}</b>)</p>`;
  if (conv.unreachableStates.length > 0) {
    splitHtml += `<p style="margin-top:4px; color:#f59e0b;">Unreachable states pruned: ${conv.unreachableStates.map(u => `<code>${u}</code>`).join(", ")}</p>`;
  }
  splitHtml += `</div>`;
  stepSplittingAnalysis.innerHTML = splitHtml;

  // Step 3: Transition Function Mapping
  let mapHtml = `<div style="font-size:0.8rem;">`;
  mapHtml += `<p>For every Moore state <code>q_y</code> derived from <code>q</code> and symbol <code>a</code>:<br>`;
  mapHtml += `<b>\\(\\delta'((q, y), a) = (\\delta(q, a), \\lambda(q, a))\\)</b></p>`;
  mapHtml += `<div style="margin-top:6px; color:#94a3b8;">Outputs are now associated with arriving states rather than transitions. All transitions from any copy of <code>q</code> strictly preserve the behavioral equivalence of the original Mealy machine.</div>`;
  mapHtml += `</div>`;
  stepMappingAnalysis.innerHTML = mapHtml;
}

// SVG Diagram Renderer
function renderDiagram() {
  const svg = document.getElementById("state-diagram-svg");
  const legend = document.getElementById("diagram-legend");
  svg.innerHTML = "";

  const isMealy = (activeDiagramMode === "mealy");
  const machine = isMealy ? currentMealy : currentConversion.mooreMachine;
  if (!machine) return;

  const width = svg.clientWidth || 800;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const states = machine.states;
  const n = states.length;
  const radius = Math.min(width, height) * 0.35;

  // Calculate state positions in a circle
  const positions = {};
  states.forEach((s, i) => {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2;
    positions[s] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  // SVG Definitions (Arrow markers)
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#60a5fa" />
    </marker>
    <marker id="arrow-self" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#60a5fa" />
    </marker>
  `;
  svg.appendChild(defs);

  // Group container
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // Draw Transitions (Curved lines & Self loops)
  states.forEach(s => {
    machine.alphabet.forEach(sym => {
      let target, label;
      if (isMealy) {
        const trans = machine.transitions[s]?.[sym];
        if (!trans) return;
        target = trans.nextState;
        label = `${sym} / ${trans.output}`;
      } else {
        target = machine.transitions[s]?.[sym];
        if (!target) return;
        label = `${sym}`;
      }

      if (!positions[target]) return;

      const p1 = positions[s];
      const p2 = positions[target];

      if (s === target) {
        // Self-loop
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const loopAngle = Math.atan2(p1.y - centerY, p1.x - centerX);
        const loopDist = 38;
        const lx1 = p1.x + loopDist * Math.cos(loopAngle - 0.4);
        const ly1 = p1.y + loopDist * Math.sin(loopAngle - 0.4);
        const lx2 = p1.x + loopDist * Math.cos(loopAngle + 0.4);
        const ly2 = p1.y + loopDist * Math.sin(loopAngle + 0.4);

        path.setAttribute("d", `M ${p1.x} ${p1.y} C ${lx1} ${ly1}, ${lx2} ${ly2}, ${p1.x + 5} ${p1.y + 5}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#475569");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("marker-end", "url(#arrow-self)");
        g.appendChild(path);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (lx1 + lx2) / 2);
        text.setAttribute("y", (ly1 + ly2) / 2);
        text.setAttribute("fill", "#93c5fd");
        text.setAttribute("font-size", "11");
        text.setAttribute("font-family", "Fira Code");
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        g.appendChild(text);
      } else {
        // Directed curved edge between distinct nodes
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // Offset curvature
        const curveOffset = 22;
        const nx = -dy / dist;
        const ny = dx / dist;
        const cx = midX + nx * curveOffset;
        const cy = midY + ny * curveOffset;

        path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#475569");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("marker-end", "url(#arrow)");
        g.appendChild(path);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", cx);
        text.setAttribute("y", cy);
        text.setAttribute("fill", "#93c5fd");
        text.setAttribute("font-size", "11");
        text.setAttribute("font-family", "Fira Code");
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        g.appendChild(text);
      }
    });
  });

  // Draw Start Indicator Arrow
  const startPos = positions[machine.startState];
  if (startPos) {
    const startLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    startLine.setAttribute("x1", startPos.x - 48);
    startLine.setAttribute("y1", startPos.y - 25);
    startLine.setAttribute("x2", startPos.x - 22);
    startLine.setAttribute("y2", startPos.y - 12);
    startLine.setAttribute("stroke", "#10b981");
    startLine.setAttribute("stroke-width", "2.5");
    startLine.setAttribute("marker-end", "url(#arrow)");
    g.appendChild(startLine);
  }

  // Draw State Nodes
  states.forEach(s => {
    const p = positions[s];
    const isStart = (s === machine.startState);

    // Node Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", 24);
    circle.setAttribute("fill", isStart ? "#14322d" : "#1a2542");
    circle.setAttribute("stroke", isStart ? "#10b981" : "#3b82f6");
    circle.setAttribute("stroke-width", isStart ? "2.5" : "2");
    g.appendChild(circle);

    // Label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", p.x);
    text.setAttribute("y", isMealy ? p.y + 5 : p.y - 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("font-size", "12");
    text.textContent = s;
    g.appendChild(text);

    // If Moore, render state output inside node
    if (!isMealy) {
      const outText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      outText.setAttribute("x", p.x);
      outText.setAttribute("y", p.y + 13);
      outText.setAttribute("text-anchor", "middle");
      outText.setAttribute("fill", "#38bdf8");
      outText.setAttribute("font-size", "10");
      outText.setAttribute("font-family", "Fira Code");
      outText.textContent = `/${machine.stateOutputs[s]}`;
      g.appendChild(outText);
    }
  });

  svg.appendChild(g);

  // Update Legend
  legend.innerHTML = `
    <span>🟢 <b>Start State</b>: ${machine.startState}</span>
    <span>⚡ <b>Active View</b>: ${isMealy ? 'Mealy Machine (Outputs on Transitions)' : 'Moore Machine (Outputs inside States)'}</span>
  `;
}

// Dual Simulation & Equivalence Verifier
function resetSimulation() {
  simState = {
    active: false,
    stepIndex: 0,
    inputSequence: simInputString.value.trim(),
    mealyCurrent: currentMealy.startState,
    mooreCurrent: currentConversion.mooreMachine.startState,
    mealyHistory: [],
    mooreHistory: []
  };

  simMealyCurr.textContent = currentMealy.startState;
  simMooreCurr.textContent = currentConversion.mooreMachine.startState;
  simMealyStream.textContent = "(idle)";
  simMooreStream.textContent = String(currentConversion.mooreMachine.stateOutputs[currentConversion.mooreMachine.startState]);

  bodyMealySim.innerHTML = "";
  bodyMooreSim.innerHTML = `<tr><td>0</td><td>-</td><td>${currentConversion.mooreMachine.startState}</td><td>${currentConversion.mooreMachine.stateOutputs[currentConversion.mooreMachine.startState]}</td><td>-</td></tr>`;
}

function runFullSimulation() {
  const seq = simInputString.value.trim();
  if (!seq) return;

  try {
    const mealyRes = currentMealy.simulate(seq);
    const mooreRes = currentConversion.mooreMachine.simulate(seq);

    // Update Mealy Table
    let mHtml = "";
    mealyRes.trace.forEach((step, idx) => {
      mHtml += `<tr>
        <td>${idx + 1}</td>
        <td><code>${step.input}</code></td>
        <td><b>${step.from_state}</b></td>
        <td><b>${step.next_state}</b></td>
        <td style="color:#fbbf24; font-weight:700;">${step.output}</td>
      </tr>`;
    });
    bodyMealySim.innerHTML = mHtml;

    // Update Moore Table
    let moHtml = `<tr>
      <td>0</td><td>-</td>
      <td><b>${mooreRes.trace[0].state}</b></td>
      <td style="color:#38bdf8; font-weight:700;">${mooreRes.trace[0].output}</td>
      <td>-</td>
    </tr>`;

    mooreRes.trace.slice(1).forEach((step) => {
      moHtml += `<tr>
        <td>${step.step}</td>
        <td><code>${step.input}</code></td>
        <td>-</td>
        <td style="color:#38bdf8; font-weight:700;">${step.output}</td>
        <td><b>${step.to_state}</b></td>
      </tr>`;
    });
    bodyMooreSim.innerHTML = moHtml;

    // Stream and metrics
    simMealyCurr.textContent = mealyRes.stateTrace[mealyRes.stateTrace.length - 1];
    simMooreCurr.textContent = mooreRes.stateTrace[mooreRes.stateTrace.length - 1];
    simMealyStream.textContent = mealyRes.outputString;
    simMooreStream.textContent = mooreRes.outputString;

    // Verification check
    const match = (mealyRes.outputString === mooreRes.mealyEquivalentOutputString);
    const banner = document.getElementById("sim-equivalence-banner");
    const explanation = document.getElementById("equivalence-explanation");

    if (match) {
      banner.style.borderColor = "rgba(16, 185, 129, 0.5)";
      banner.querySelector(".banner-status-icon").textContent = "✓";
      banner.querySelector(".banner-status-icon").style.background = "#10b981";
      banner.querySelector("h4").textContent = "Mathematical Equivalence Confirmed";
      explanation.innerHTML = `Mealy Output = <code>${mealyRes.outputString}</code><br>Moore Output = <code>${mooreRes.outputString}</code> (Initial state output: <code>${mooreRes.initialOutput}</code> + Equivalent tail: <code>${mooreRes.mealyEquivalentOutputString}</code>). <b>100% Match!</b>`;
    } else {
      banner.style.borderColor = "#ef4444";
      banner.querySelector(".banner-status-icon").textContent = "✕";
      banner.querySelector(".banner-status-icon").style.background = "#ef4444";
      banner.querySelector("h4").textContent = "Equivalence Discrepancy";
      explanation.textContent = "Mismatch detected on the input sequence.";
    }
  } catch (err) {
    alert("Simulation error: " + err.message);
  }
}

function stepSimulation() {
  const seq = simInputString.value.trim();
  if (!seq) return;

  if (simState.stepIndex >= seq.length) {
    alert("Simulation reached end of sequence. Click Reset to start over.");
    return;
  }

  const sym = seq[simState.stepIndex];
  const t = simState.stepIndex + 1;

  // Mealy step
  const mTrans = currentMealy.transitions[simState.mealyCurrent]?.[sym];
  if (!mTrans) return;
  const mFrom = simState.mealyCurrent;
  const mTo = mTrans.nextState;
  const mOut = mTrans.output;
  simState.mealyCurrent = mTo;
  simState.mealyHistory.push(mOut);

  // Moore step
  const moTo = currentConversion.mooreMachine.transitions[simState.mooreCurrent]?.[sym];
  if (!moTo) return;
  const moFrom = simState.mooreCurrent;
  simState.mooreCurrent = moTo;
  const moOut = currentConversion.mooreMachine.stateOutputs[moTo];
  simState.mooreHistory.push(moOut);

  simState.stepIndex++;

  // Update rows
  const mRow = document.createElement("tr");
  mRow.className = "sim-active-row";
  mRow.innerHTML = `<td>${t}</td><td><code>${sym}</code></td><td><b>${mFrom}</b></td><td><b>${mTo}</b></td><td style="color:#fbbf24; font-weight:700;">${mOut}</td>`;
  bodyMealySim.appendChild(mRow);

  const moRow = document.createElement("tr");
  moRow.className = "sim-active-row";
  moRow.innerHTML = `<td>${t}</td><td><code>${sym}</code></td><td><b>${moFrom}</b></td><td style="color:#38bdf8; font-weight:700;">${moOut}</td><td><b>${moTo}</b></td>`;
  bodyMooreSim.appendChild(moRow);

  simMealyCurr.textContent = mTo;
  simMooreCurr.textContent = moTo;
  simMealyStream.textContent = simState.mealyHistory.join("");
  simMooreStream.textContent = (initOutputVal.value || "0") + simState.mooreHistory.join("");
}

// Export Generators
function exportToLaTeX() {
  const m = currentConversion.mooreMachine;
  const alph = m.alphabet;
  let tex = `% Moore Machine Transition Table\n`;
  tex += `\\begin{table}[htbp]\n\\centering\n`;
  tex += `\\begin{tabular}{|c|` + "c|".repeat(alph.length) + `c|}\n\\hline\n`;
  tex += `Present State & ` + alph.map(a => `Next ($x=${a}$)`).join(" & ") + ` & Output \\\\\\hline\n`;

  m.states.forEach(s => {
    const isStart = (s === m.startState) ? "\\rightarrow " : "";
    const nextCols = alph.map(a => m.transitions[s]?.[a] || "-").join(" & ");
    tex += `${isStart}${s} & ${nextCols} & ${m.stateOutputs[s]} \\\\\\hline\n`;
  });

  tex += `\\end{tabular}\n\\caption{Moore Machine converted from Mealy Machine}\n\\end{table}`;
  return tex;
}

function exportToMarkdown() {
  const m = currentConversion.mooreMachine;
  const alph = m.alphabet;
  let md = `| Present State | ` + alph.map(a => `Next (x=${a})`).join(" | ") + ` | State Output |\n`;
  md += `|---|` + "---|".repeat(alph.length) + `---|\n`;

  m.states.forEach(s => {
    const isStart = (s === m.startState) ? " (Start)" : "";
    const nextCols = alph.map(a => m.transitions[s]?.[a] || "-").join(" | ");
    md += `| **${s}**${isStart} | ${nextCols} | \`${m.stateOutputs[s]}\` |\n`;
  });

  return md;
}

function exportToCSV() {
  const m = currentConversion.mooreMachine;
  const alph = m.alphabet;
  let csv = `Present State,` + alph.map(a => `Next(x=${a})`).join(",") + `,Output\n`;
  m.states.forEach(s => {
    const nextCols = alph.map(a => m.transitions[s]?.[a] || "-").join(",");
    csv += `${s},${nextCols},${m.stateOutputs[s]}\n`;
  });
  return csv;
}

function exportToJSON() {
  const m = currentConversion.mooreMachine;
  const payload = {
    type: "MooreMachine",
    states: m.states,
    alphabet: m.alphabet,
    startState: m.startState,
    stateOutputs: m.stateOutputs,
    transitions: m.transitions,
    convertedFromMealy: {
      states: currentMealy.states,
      alphabet: currentMealy.alphabet,
      startState: currentMealy.startState,
      transitions: currentMealy.transitions
    }
  };
  return JSON.stringify(payload, null, 2);
}

// Modal Utilities
function showExportModal(title, content) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-textarea").value = content;
  document.getElementById("app-modal").classList.remove("hidden");
}

function showTheoryModal() {
  const theory = `=== Mealy to Moore Machine Conversion Theory ===

1. Formal Definitions:
   - Mealy Machine: Output depends on Present State AND Current Input.
     lambda: Q x Sigma -> Delta
   - Moore Machine: Output depends ONLY on Present State.
     lambda': Q' -> Delta

2. Mathematical Conversion Algorithm:
   Step 1: For each Mealy state q in Q, determine all incoming outputs:
           O(q) = { lambda(p, a) | delta(p, a) = q }
   Step 2: If state q is entered with k distinct outputs {y1, y2, ... yk},
           split state q into k Moore states: q_y1, q_y2, ..., q_yk.
           Each copy q_yi is assigned Moore state output lambda'(q_yi) = yi.
   Step 3: Define Moore transitions:
           For any split state (q, y) and input symbol a:
           delta'((q, y), a) = (delta(q, a), lambda(q, a)).
           Notice all copies of q preserve the exact transition targets of q!
   Step 4: Reachability: Prune unreachable states from Moore start state.

3. Mathematical Equivalence:
   For any input string w of length n:
   - Mealy generates an output string of length n.
   - Moore generates an output string of length n + 1 (including q0's initial output).
   - Moore(w) = lambda'(q0') . Mealy(w).
   - Both machines are language-equivalent and functionally identical.`;
  showExportModal("Automata Theory & Conversion Specification", theory);
}

function closeModal() {
  document.getElementById("app-modal").classList.add("hidden");
}

function copyModalText() {
  const textarea = document.getElementById("modal-textarea");
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    const btn = document.getElementById("btn-modal-copy");
    const orig = btn.textContent;
    btn.textContent = "Copied! ✓";
    setTimeout(() => { btn.textContent = orig; }, 1800);
  });
}
