# Automated Mealy to Moore Machine Converter & Dual Simulator

An automated tool and interactive web application that converts any **Mealy Machine** transition matrix into a mathematically equivalent **Moore Machine** transition matrix. Features step-by-step state splitting analysis, reachability pruning, visual SVG transition diagrams, and real-time dual-machine simulation with mathematical equivalence verification.

---

## 📖 Mathematical Foundation

### 1. Formal Definitions

- **Mealy Machine**: Defined as a 6-tuple $M_1 = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$:
  - $Q$: Finite set of states
  - $\Sigma$: Input alphabet (e.g. $\{0, 1\}$)
  - $\Delta$: Output alphabet (e.g. $\{0, 1\}$)
  - $\delta: Q \times \Sigma \to Q$: State transition function
  - $\lambda: Q \times \Sigma \to \Delta$: Output function (**output depends on present state AND input symbol**)
  - $q_0 \in Q$: Start state

- **Moore Machine**: Defined as a 6-tuple $M_2 = (Q', \Sigma, \Delta, \delta', \lambda', q_0')$:
  - $\lambda': Q' \to \Delta$: State output function (**output depends ONLY on the present state**)

---

### 2. Conversion Algorithm

1. **Incoming Output Extraction**:
   For every state $q \in Q$, collect the set of distinct outputs associated with all incoming transitions:
   $$O(q) = \{ \lambda(p, a) \mid p \in Q, a \in \Sigma \text{ such that } \delta(p, a) = q \}$$

2. **State Splitting**:
   - If $|O(q)| = k$, state $q$ is split into $k$ distinct Moore states: $q_{y_1}, q_{y_2}, \dots, q_{y_k}$ for each $y_i \in O(q)$.
   - Each split state is assigned the Moore state output:
     $$\lambda'(q_{y_i}) = y_i$$
   - If $O(q) = \emptyset$ (for instance, the initial state without incoming loops), assign a default initial output (typically `0` or `-`).

3. **Transition Function Mapping**:
   For each split state $q_y$ and each input symbol $a \in \Sigma$:
   $$\delta'(q_y, a) = \delta(q, a)_{\lambda(q, a)}$$
   The next state is the split version of the Mealy target state corresponding to the Mealy transition output $\lambda(q, a)$.

4. **Reachability Pruning**:
   Starting from the designated Moore initial state $q_0'$, run a Breadth-First Search (BFS) to identify and prune unreachable states.

---

### 3. Theorem of Mathematical Equivalence

For any non-empty input sequence $w = a_1 a_2 \dots a_n \in \Sigma^*$:
- **Mealy Machine Output**: produces $n$ output symbols:
  $$Z_{\text{Mealy}} = z_1 z_2 \dots z_n$$
- **Moore Machine Output**: produces $n + 1$ output symbols:
  $$Z_{\text{Moore}} = z_0' z_1' z_2' \dots z_n'$$
  where $z_0' = \lambda'(q_0')$ is the output generated before reading any input.

**Equivalence Property**:
$$\text{Moore}(w) = \lambda'(q_0') \circ \text{Mealy}(w)$$
By ignoring the initial output $z_0'$, the outputs for every clock cycle $t \ge 1$ are identical:
$$z_t' = z_t \quad \forall t \in \{1, 2, \dots, n\}$$

---

## 🚀 How to Run the Application

### Option A: Interactive Web Application (GUI)
1. **Directly open in browser**:
   Double click [`index.html`](file:///C:/Users/pujaj/.gemini/antigravity/scratch/mealy_to_moore_converter/index.html) in your browser (Chrome, Edge, Firefox).
2. **Or run with local server**:
   ```bash
   node server.js
   ```
   Then navigate to `http://localhost:3000`.

#### Features in the Web App:
- **Preset Library**: 1-click loading of standard problems:
  - 101 Sequence Detector (Overlapping)
  - 2's Complement Generator
  - 4-State Exam Problem
  - Parity Bit Generator
  - Serial Adder
- **Visual Matrix Table Editor**: Dynamically add/remove states, customize alphabets, edit next states and outputs.
- **Raw Matrix / Text Importer**: Paste transition tables as CSV or whitespace-separated values.
- **State Transition Diagram (SVG)**: View circular graph layouts with curved arrows, transition labels, and state outputs.
- **Dual Simulation Sandbox**: Step through clock cycles with synchronized Mealy and Moore executions.
- **Export Formats**: One-click export to LaTeX table, Markdown table, CSV, and JSON.

---

### Option B: Command Line Interface (CLI)
Run automated conversions directly from your terminal:
```bash
# Convert a preset and verify with simulation
node cli.js --preset seq101 --sim 10101101

# Run with 2's complement generator
node cli.js --preset twosComp --sim 00101

# Run with 4-state textbook problem
node cli.js --preset exam4 --sim 010110

# Export in JSON format
node cli.js --preset seq101 --json
```

---

### Option C: Python Library (`converter.py`)
If you are developing in Python or need a standalone Python module:
```bash
python converter.py
```
Or import it in your Python script:
```python
from converter import MealyMachine, convert_mealy_to_moore, format_moore_table

states = ["q1", "q2", "q3", "q4"]
alphabet = ["0", "1"]
transitions = {
    "q1": {"0": ("q3", "0"), "1": ("q2", "0")},
    "q2": {"0": ("q1", "1"), "1": ("q4", "0")},
    "q3": {"0": ("q2", "1"), "1": ("q1", "1")},
    "q4": {"0": ("q4", "1"), "1": ("q3", "0")}
}
mealy = MealyMachine(states, alphabet, "q1", transitions)
res = convert_mealy_to_moore(mealy)
print(format_moore_table(res["moore_machine"]))
```

---

## 📂 Project Structure

```
mealy_to_moore_converter/
├── index.html        # Modern responsive Web GUI
├── style.css         # Dark-mode styling, glassmorphism, responsive tables
├── app.js            # UI controller, SVG diagram generator, simulation sandbox
├── converter.js      # Core conversion engine (dual Browser & Node.js compatible)
├── cli.js            # Command-line interface with formatted ASCII tables
├── test_converter.js # Automated verification test suite
├── converter.py      # Standalone Python 3 module & test harness
├── server.js         # Zero-dependency local HTTP server
└── README.md         # Documentation & mathematical reference
```
