// Core converter logic for Mealy to Moore Machine
class MealyMachine {
  constructor(states, alphabet, startState, transitions) {
    this.states = states; // ['q0', 'q1', ...]
    this.alphabet = alphabet; // ['0', '1']
    this.startState = startState; // 'q0'
    // transitions: { state: { symbol: { nextState: 'q1', output: '0' } } }
    this.transitions = transitions;
  }

  simulate(inputString) {
    let currentState = this.startState;
    let outputs = [];
    let stateTrace = [currentState];
    let stepDetails = [];

    for (let char of inputString) {
      if (!this.alphabet.includes(char)) {
        throw new Error(`Symbol '${char}' not in alphabet [${this.alphabet.join(', ')}]`);
      }
      const t = this.transitions[currentState]?.[char];
      if (!t) {
        throw new Error(`Undefined transition from ${currentState} on '${char}'`);
      }
      stepDetails.push({
        fromState: currentState,
        input: char,
        nextState: t.nextState,
        output: t.output
      });
      outputs.push(t.output);
      currentState = t.nextState;
      stateTrace.push(currentState);
    }

    return {
      outputString: outputs.join(''),
      outputs,
      stateTrace,
      stepDetails
    };
  }
}

class MooreMachine {
  constructor(states, alphabet, startState, transitions, stateOutputs) {
    this.states = states; // ['q0_0', 'q0_1', ...]
    this.alphabet = alphabet; // ['0', '1']
    this.startState = startState;
    // transitions: { state: { symbol: nextState } }
    this.transitions = transitions;
    // stateOutputs: { state: output }
    this.stateOutputs = stateOutputs;
  }

  simulate(inputString) {
    let currentState = this.startState;
    let initialOutput = this.stateOutputs[currentState];
    let outputs = [initialOutput];
    let stateTrace = [currentState];
    let stepDetails = [{
      state: currentState,
      output: initialOutput,
      isInitial: true
    }];

    for (let char of inputString) {
      if (!this.alphabet.includes(char)) {
        throw new Error(`Symbol '${char}' not in alphabet [${this.alphabet.join(', ')}]`);
      }
      const next = this.transitions[currentState]?.[char];
      if (!next) {
        throw new Error(`Undefined transition from ${currentState} on '${char}'`);
      }
      currentState = next;
      const out = this.stateOutputs[currentState];
      outputs.push(out);
      stateTrace.push(currentState);
      stepDetails.push({
        input: char,
        toState: currentState,
        output: out
      });
    }

    return {
      outputString: outputs.join(''),
      outputs,
      stateTrace,
      stepDetails,
      // discarding initial output for Mealy equivalence
      mealyEquivalentOutputString: outputs.slice(1).join('')
    };
  }
}

function convertMealyToMoore(mealy, options = {}) {
  const defaultInitialOutput = options.defaultInitialOutput || '0';
  const keepOnlyReachable = options.keepOnlyReachable !== false;

  // 1. Determine incoming outputs for each state
  const incomingOutputs = {};
  for (let s of mealy.states) {
    incomingOutputs[s] = new Set();
  }

  for (let s of mealy.states) {
    for (let sym of mealy.alphabet) {
      const t = mealy.transitions[s]?.[sym];
      if (t && t.nextState !== undefined && t.output !== undefined) {
        if (!incomingOutputs[t.nextState]) {
          incomingOutputs[t.nextState] = new Set();
        }
        incomingOutputs[t.nextState].add(String(t.output));
      }
    }
  }

  // 2. State splitting
  const mooreStates = [];
  const stateOutputs = {};
  const mealyToMooreMap = {}; // originalState -> [mooreStateNames]

  for (let s of mealy.states) {
    const outputs = Array.from(incomingOutputs[s]).sort();
    mealyToMooreMap[s] = [];

    if (outputs.length === 0) {
      // No incoming transitions (e.g. only start state or isolated state)
      const outVal = (s === mealy.startState) ? defaultInitialOutput : '-';
      const mooreName = `${s}`;
      mooreStates.push(mooreName);
      stateOutputs[mooreName] = outVal;
      mealyToMooreMap[s].push({ name: mooreName, output: outVal });
    } else {
      // State is entered with one or more outputs
      // Check if start state also needs an initial state instance if start output doesn't match
      let hasStartSpecial = false;
      if (s === mealy.startState && options.distinctStartState) {
        const startName = `${s}_init`;
        mooreStates.push(startName);
        stateOutputs[startName] = defaultInitialOutput;
        mealyToMooreMap[s].push({ name: startName, output: defaultInitialOutput, isStart: true });
        hasStartSpecial = true;
      }

      for (let out of outputs) {
        const mooreName = `${s}_${out}`;
        mooreStates.push(mooreName);
        stateOutputs[mooreName] = out;
        mealyToMooreMap[s].push({ name: mooreName, output: out });
      }
    }
  }

  // Determine Moore start state
  let mooreStartState;
  if (options.distinctStartState && mealyToMooreMap[mealy.startState].some(x => x.isStart)) {
    mooreStartState = `${mealy.startState}_init`;
  } else {
    // If start state was split, pick either the one matching defaultInitialOutput or the first
    const candidates = mealyToMooreMap[mealy.startState];
    const match = candidates.find(c => c.output === defaultInitialOutput);
    mooreStartState = match ? match.name : candidates[0].name;
  }

  // 3. Build transitions for Moore machine
  const mooreTransitions = {};
  for (let mState of mooreStates) {
    mooreTransitions[mState] = {};
    // Extract base mealy state
    // state could be q0_0, q0_init, or q0
    let baseState = mealy.states.find(s => mState === s || mState.startsWith(s + '_'));
    if (!baseState) {
      baseState = mState.split('_')[0];
    }

    for (let sym of mealy.alphabet) {
      const origTrans = mealy.transitions[baseState]?.[sym];
      if (origTrans) {
        const targetBase = origTrans.nextState;
        const targetOutput = String(origTrans.output);
        // In Moore, transition must go to the target state split with targetOutput
        const targetCandidate = mealyToMooreMap[targetBase]?.find(c => c.output === targetOutput);
        if (targetCandidate) {
          mooreTransitions[mState][sym] = targetCandidate.name;
        } else {
          // Fallback to first available instance if output was not in incoming list
          mooreTransitions[mState][sym] = mealyToMooreMap[targetBase]?.[0]?.name || targetBase;
        }
      }
    }
  }

  // 4. Reachability analysis
  const reachable = new Set();
  const queue = [mooreStartState];
  reachable.add(mooreStartState);

  while (queue.length > 0) {
    const curr = queue.shift();
    for (let sym of mealy.alphabet) {
      const next = mooreTransitions[curr]?.[sym];
      if (next && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  const finalStates = keepOnlyReachable ? mooreStates.filter(s => reachable.has(s)) : mooreStates;
  const finalTransitions = {};
  const finalStateOutputs = {};

  for (let s of finalStates) {
    finalStateOutputs[s] = stateOutputs[s];
    finalTransitions[s] = {};
    for (let sym of mealy.alphabet) {
      finalTransitions[s][sym] = mooreTransitions[s]?.[sym];
    }
  }

  return {
    mooreMachine: new MooreMachine(finalStates, mealy.alphabet, mooreStartState, finalTransitions, finalStateOutputs),
    incomingOutputs: Object.fromEntries(Object.entries(incomingOutputs).map(([k, v]) => [k, Array.from(v)])),
    stateMapping: mealyToMooreMap,
    allStates: mooreStates,
    reachableStates: Array.from(reachable),
    unreachableStates: mooreStates.filter(s => !reachable.has(s))
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MealyMachine, MooreMachine, convertMealyToMoore };
}

