#!/usr/bin/env node

/**
 * Command-Line Interface (CLI) for Mealy to Moore Machine Automated Converter
 * Usage:
 *   node cli.js --preset seq101
 *   node cli.js --preset twosComp --sim 00101
 *   node cli.js --help
 */

const fs = require('fs');
const { MealyMachine, convertMealyToMoore } = require('./converter');

const PRESETS = {
  seq101: {
    name: "101 Sequence Detector",
    states: ["S0", "S1", "S2"],
    alphabet: ["0", "1"],
    startState: "S0",
    transitions: {
      "S0": { "0": { nextState: "S0", output: "0" }, "1": { nextState: "S1", output: "0" } },
      "S1": { "0": { nextState: "S2", output: "0" }, "1": { nextState: "S1", output: "0" } },
      "S2": { "0": { nextState: "S0", output: "0" }, "1": { nextState: "S1", output: "1" } }
    }
  },
  twosComp: {
    name: "2's Complement Generator",
    states: ["A", "B"],
    alphabet: ["0", "1"],
    startState: "A",
    transitions: {
      "A": { "0": { nextState: "A", output: "0" }, "1": { nextState: "B", output: "1" } },
      "B": { "0": { nextState: "B", output: "1" }, "1": { nextState: "B", output: "0" } }
    }
  },
  exam4: {
    name: "4-State Standard Exam Problem",
    states: ["q1", "q2", "q3", "q4"],
    alphabet: ["0", "1"],
    startState: "q1",
    transitions: {
      "q1": { "0": { nextState: "q3", output: "0" }, "1": { nextState: "q2", output: "0" } },
      "q2": { "0": { nextState: "q1", output: "1" }, "1": { nextState: "q4", output: "0" } },
      "q3": { "0": { nextState: "q2", output: "1" }, "1": { nextState: "q1", output: "1" } },
      "q4": { "0": { nextState: "q4", output: "1" }, "1": { nextState: "q3", output: "0" } }
    }
  }
};

function printHelp() {
  console.log(`
Mealy to Moore Machine Automated Converter (CLI)
=================================================
Usage:
  node cli.js [options]

Options:
  --preset <name>       Load preset: seq101, twosComp, exam4 (default: seq101)
  --sim <sequence>      Simulate binary input sequence on both machines
  --init <output>       Moore initial state output (default: 0)
  --all-states          Include unreachable states in Moore table
  --json                Output result in JSON format
  --help                Display this help message
`);
}

function printTable(headers, rows) {
  const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i] || '').length)) + 2);
  const divider = '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+';
  const formatRow = row => '|' + row.map((cell, i) => ` ${String(cell || '').padEnd(colWidths[i] - 1)}`).join('|') + '|';

  console.log(divider);
  console.log(formatRow(headers));
  console.log(divider);
  rows.forEach(r => console.log(formatRow(r)));
  console.log(divider);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  let presetKey = 'seq101';
  let simSeq = null;
  let initOut = '0';
  let keepOnlyReachable = true;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--preset' && args[i + 1]) presetKey = args[++i];
    else if (args[i] === '--sim' && args[i + 1]) simSeq = args[++i];
    else if (args[i] === '--init' && args[i + 1]) initOut = args[++i];
    else if (args[i] === '--all-states') keepOnlyReachable = false;
    else if (args[i] === '--json') jsonOutput = true;
  }

  const preset = PRESETS[presetKey] || PRESETS.seq101;
  const mealy = new MealyMachine(preset.states, preset.alphabet, preset.startState, preset.transitions);
  const result = convertMealyToMoore(mealy, { defaultInitialOutput: initOut, keepOnlyReachable });
  const moore = result.mooreMachine;

  if (jsonOutput) {
    console.log(JSON.stringify({
      mealy: { states: mealy.states, alphabet: mealy.alphabet, startState: mealy.startState, transitions: mealy.transitions },
      moore: { states: moore.states, alphabet: moore.alphabet, startState: moore.startState, transitions: moore.transitions, outputs: moore.stateOutputs },
      incomingOutputs: result.incomingOutputs
    }, null, 2));
    return;
  }

  console.log(`\n======================================================`);
  console.log(`MEALY TO MOORE AUTOMATED CONVERTER`);
  console.log(`Preset: ${preset.name}`);
  console.log(`======================================================\n`);

  console.log(`1. ORIGINAL MEALY MACHINE MATRIX:`);
  const mHeaders = ['Present State', ...mealy.alphabet.map(a => `Next(x=${a}) / Out`)];
  const mRows = mealy.states.map(s => {
    const isStart = (s === mealy.startState) ? ' (Start)' : '';
    const cols = mealy.alphabet.map(a => {
      const t = mealy.transitions[s]?.[a];
      return t ? `${t.nextState} / ${t.output}` : '-';
    });
    return [s + isStart, ...cols];
  });
  printTable(mHeaders, mRows);

  console.log(`\n2. INCOMING OUTPUTS ANALYSIS:`);
  Object.entries(result.incomingOutputs).forEach(([st, outs]) => {
    console.log(`   - State ${st.padEnd(6)}: incoming outputs = { ${outs.join(', ') || 'none'} }`);
  });

  console.log(`\n3. CONVERTED MOORE MACHINE MATRIX:`);
  const moHeaders = ['Present State', ...moore.alphabet.map(a => `Next(x=${a})`), 'Output'];
  const moRows = moore.states.map(s => {
    const isStart = (s === moore.startState) ? ' (Start)' : '';
    const cols = moore.alphabet.map(a => moore.transitions[s]?.[a] || '-');
    return [s + isStart, ...cols, moore.stateOutputs[s]];
  });
  printTable(moHeaders, moRows);

  if (simSeq) {
    console.log(`\n4. DUAL SIMULATION VERIFICATION (Input: "${simSeq}"):`);
    const mealySim = mealy.simulate(simSeq);
    const mooreSim = moore.simulate(simSeq);

    console.log(`   - Mealy Output:           "${mealySim.outputString}"`);
    console.log(`   - Moore Full Output:      "${mooreSim.outputString}" (Initial: "${mooreSim.outputs[0]}")`);
    console.log(`   - Moore Equivalent Tail:  "${mooreSim.mealyEquivalentOutputString}"`);
    const match = (mealySim.outputString === mooreSim.mealyEquivalentOutputString);
    console.log(`   => Mathematical Equivalence: ${match ? 'VERIFIED (PASS ✓)' : 'FAILED ✕'}\n`);
  }
}

if (require.main === module) {
  main();
}
