const { MealyMachine, convertMealyToMoore } = require('./converter');

console.log('=== TEST 1: Standard Textbook Example ===');
// Mealy Machine:
// States: q1, q2, q3, q4
// Alphabet: 0, 1
// Start: q1
const mealy1 = new MealyMachine(
  ['q1', 'q2', 'q3', 'q4'],
  ['0', '1'],
  'q1',
  {
    'q1': { '0': { nextState: 'q3', output: '0' }, '1': { nextState: 'q2', output: '0' } },
    'q2': { '0': { nextState: 'q1', output: '1' }, '1': { nextState: 'q4', output: '0' } },
    'q3': { '0': { nextState: 'q2', output: '1' }, '1': { nextState: 'q1', output: '1' } },
    'q4': { '0': { nextState: 'q4', output: '1' }, '1': { nextState: 'q3', output: '0' } },
  }
);

const res1 = convertMealyToMoore(mealy1, { defaultInitialOutput: '0' });
console.log('Incoming Outputs for each state:', res1.incomingOutputs);
console.log('Moore States:', res1.mooreMachine.states);
console.log('Moore Start State:', res1.mooreMachine.startState);
console.log('Moore State Outputs:', res1.mooreMachine.stateOutputs);
console.log('Moore Transitions:');
for (let s of res1.mooreMachine.states) {
  console.log(`  State ${s} (out: ${res1.mooreMachine.stateOutputs[s]}): on '0' -> ${res1.mooreMachine.transitions[s]['0']}, on '1' -> ${res1.mooreMachine.transitions[s]['1']}`);
}

// Verification by simulation
const testInputs = ['0', '1', '01', '10', '101', '01101', '1100101'];
console.log('\n--- Simulation Verification (Mealy vs Moore) ---');
for (let str of testInputs) {
  const mealyOut = mealy1.simulate(str);
  const mooreOut = res1.mooreMachine.simulate(str);
  const match = mealyOut.outputString === mooreOut.mealyEquivalentOutputString;
  console.log(`Input: "${str}" | Mealy: "${mealyOut.outputString}" | Moore: "${mooreOut.outputString}" (discarding initial: "${mooreOut.mealyEquivalentOutputString}") => Match: ${match ? 'PASS' : 'FAIL'}`);
  if (!match) throw new Error(`Equivalence failed for input ${str}`);
}

console.log('\n=== TEST 2: 2s Complement Generator ===');
// Mealy Machine for 2's Complement (processed LSB to MSB)
const mealy2 = new MealyMachine(
  ['A', 'B'],
  ['0', '1'],
  'A',
  {
    'A': { '0': { nextState: 'A', output: '0' }, '1': { nextState: 'B', output: '1' } },
    'B': { '0': { nextState: 'B', output: '1' }, '1': { nextState: 'B', output: '0' } }
  }
);

const res2 = convertMealyToMoore(mealy2, { defaultInitialOutput: '0' });
console.log('Moore States:', res2.mooreMachine.states);
for (let str of ['0010', '100', '1101', '000']) {
  const m1 = mealy2.simulate(str);
  const m2 = res2.mooreMachine.simulate(str);
  console.log(`Input: ${str} | Mealy: ${m1.outputString} | Moore: ${m2.mealyEquivalentOutputString} => ${m1.outputString === m2.mealyEquivalentOutputString ? 'PASS' : 'FAIL'}`);
}

console.log('\nAll tests passed successfully!');
