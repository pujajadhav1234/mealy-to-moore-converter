"""
Mealy to Moore Machine Automated Converter
Mathematical Formulation & Equivalence Engine

Author: Antigravity
License: MIT
"""

from typing import Dict, List, Set, Tuple, Optional
import json


class MealyMachine:
    """
    Represents a Mealy Machine M = (Q, Sigma, Delta, delta, lambda, q0)
    where:
      - Q: Finite set of states
      - Sigma: Input alphabet
      - Delta: Output alphabet
      - delta: Transition function Q x Sigma -> Q
      - lambda: Output function Q x Sigma -> Delta
      - q0: Initial state in Q
    """
    def __init__(
        self,
        states: List[str],
        alphabet: List[str],
        start_state: str,
        transitions: Dict[str, Dict[str, Tuple[str, str]]]
    ):
        self.states = states
        self.alphabet = alphabet
        self.start_state = start_state
        # transitions[state][symbol] = (next_state, output)
        self.transitions = transitions

    def simulate(self, input_sequence: str) -> Dict[str, any]:
        """
        Simulates the Mealy machine on an input string.
        Returns output string, state sequence, and step-by-step trace.
        """
        curr = self.start_state
        outputs = []
        states_visited = [curr]
        trace = []

        for symbol in input_sequence:
            if symbol not in self.alphabet:
                raise ValueError(f"Symbol '{symbol}' not in alphabet {self.alphabet}")
            next_state, out = self.transitions[curr][symbol]
            trace.append({
                "from_state": curr,
                "input": symbol,
                "next_state": next_state,
                "output": out
            })
            outputs.append(str(out))
            curr = next_state
            states_visited.append(curr)

        return {
            "input": input_sequence,
            "output_sequence": "".join(outputs),
            "state_sequence": states_visited,
            "trace": trace
        }


class MooreMachine:
    """
    Represents a Moore Machine M' = (Q', Sigma, Delta, delta', lambda', q0')
    where:
      - Q': Finite set of states
      - Sigma: Input alphabet
      - Delta: Output alphabet
      - delta': Transition function Q' x Sigma -> Q'
      - lambda': State output function Q' -> Delta
      - q0': Initial state in Q'
    """
    def __init__(
        self,
        states: List[str],
        alphabet: List[str],
        start_state: str,
        transitions: Dict[str, Dict[str, str]],
        state_outputs: Dict[str, str]
    ):
        self.states = states
        self.alphabet = alphabet
        self.start_state = start_state
        # transitions[state][symbol] = next_state
        self.transitions = transitions
        # state_outputs[state] = output
        self.state_outputs = state_outputs

    def simulate(self, input_sequence: str) -> Dict[str, any]:
        """
        Simulates the Moore machine on an input string.
        Note: Moore produces n + 1 outputs for input of length n.
        The output sequence excluding the initial output is mathematically
        equivalent to the Mealy machine output.
        """
        curr = self.start_state
        outputs = [str(self.state_outputs[curr])]
        states_visited = [curr]
        trace = [{
            "step": 0,
            "state": curr,
            "output": self.state_outputs[curr],
            "note": "Initial state output"
        }]

        for idx, symbol in enumerate(input_sequence, start=1):
            if symbol not in self.alphabet:
                raise ValueError(f"Symbol '{symbol}' not in alphabet {self.alphabet}")
            next_state = self.transitions[curr][symbol]
            curr = next_state
            out = str(self.state_outputs[curr])
            outputs.append(out)
            states_visited.append(curr)
            trace.append({
                "step": idx,
                "input": symbol,
                "to_state": curr,
                "output": out
            })

        full_output = "".join(outputs)
        mealy_equivalent = "".join(outputs[1:])

        return {
            "input": input_sequence,
            "full_output": full_output,
            "mealy_equivalent_output": mealy_equivalent,
            "initial_output": outputs[0],
            "state_sequence": states_visited,
            "trace": trace
        }


def convert_mealy_to_moore(
    mealy: MealyMachine,
    default_initial_output: str = "0",
    keep_only_reachable: bool = True
) -> Dict[str, any]:
    """
    Converts a Mealy machine into a mathematically equivalent Moore machine.

    Algorithm Steps:
    1. For each Mealy state q, identify all incoming outputs:
       O(q) = { lambda(p, a) | delta(p, a) = q }
    2. Split each state q into states (q, y) for each y in O(q).
       If a state has no incoming transitions, assign default_initial_output.
    3. Determine the Moore initial state.
    4. For each split state (q, y) and symbol a:
       delta'((q, y), a) = (delta(q, a), lambda(q, a))
       The output is lambda'((q, y)) = y.
    5. Optionally eliminate unreachable states starting from Moore start state.
    """
    # Step 1: Find incoming outputs for each state
    incoming_outputs: Dict[str, Set[str]] = {s: set() for s in mealy.states}
    for s in mealy.states:
        for sym in mealy.alphabet:
            trans = mealy.transitions.get(s, {}).get(sym)
            if trans:
                nxt, out = trans
                incoming_outputs.setdefault(nxt, set()).add(str(out))

    # Step 2: State splitting
    moore_states: List[str] = []
    state_outputs: Dict[str, str] = {}
    mealy_to_moore_map: Dict[str, List[Dict[str, str]]] = {s: [] for s in mealy.states}

    for s in mealy.states:
        outs = sorted(list(incoming_outputs[s]))
        if not outs:
            # Isolated state or start state with no self/incoming loop
            out_val = default_initial_output if s == mealy.start_state else "-"
            m_name = f"{s}"
            moore_states.append(m_name)
            state_outputs[m_name] = out_val
            mealy_to_moore_map[s].append({"name": m_name, "output": out_val})
        else:
            for out_val in outs:
                m_name = f"{s}_{out_val}"
                moore_states.append(m_name)
                state_outputs[m_name] = out_val
                mealy_to_moore_map[s].append({"name": m_name, "output": out_val})

    # Step 3: Choose initial state in Moore machine
    start_candidates = mealy_to_moore_map[mealy.start_state]
    matching = [c for c in start_candidates if c["output"] == default_initial_output]
    if matching:
        moore_start_state = matching[0]["name"]
    else:
        moore_start_state = start_candidates[0]["name"]

    # Step 4: Build Moore transitions
    raw_transitions: Dict[str, Dict[str, str]] = {}
    for m_state in moore_states:
        raw_transitions[m_state] = {}
        # Identify base state
        base_state = next(
            (s for s in mealy.states if m_state == s or m_state.startswith(f"{s}_")),
            m_state.split("_")[0]
        )

        for sym in mealy.alphabet:
            orig = mealy.transitions.get(base_state, {}).get(sym)
            if orig:
                target_base, target_out = orig
                target_out_str = str(target_out)
                # Find matching split state
                candidates = mealy_to_moore_map.get(target_base, [])
                match = next((c for c in candidates if c["output"] == target_out_str), None)
                if match:
                    raw_transitions[m_state][sym] = match["name"]
                else:
                    raw_transitions[m_state][sym] = candidates[0]["name"] if candidates else target_base

    # Step 5: Reachability Analysis
    reachable = set()
    queue = [moore_start_state]
    reachable.add(moore_start_state)

    while queue:
        curr = queue.pop(0)
        for sym in mealy.alphabet:
            nxt = raw_transitions.get(curr, {}).get(sym)
            if nxt and nxt not in reachable:
                reachable.add(nxt)
                queue.append(nxt)

    final_states = [s for s in moore_states if s in reachable] if keep_only_reachable else moore_states
    final_transitions = {s: raw_transitions[s] for s in final_states}
    final_state_outputs = {s: state_outputs[s] for s in final_states}

    moore_machine = MooreMachine(
        states=final_states,
        alphabet=mealy.alphabet,
        start_state=moore_start_state,
        transitions=final_transitions,
        state_outputs=final_state_outputs
    )

    return {
        "moore_machine": moore_machine,
        "incoming_outputs": {k: sorted(list(v)) for k, v in incoming_outputs.items()},
        "all_split_states": moore_states,
        "reachable_states": sorted(list(reachable)),
        "unreachable_states": [s for s in moore_states if s not in reachable]
    }


def format_mealy_table(mealy: MealyMachine) -> str:
    """Returns markdown table of Mealy Machine."""
    header = ["Present State"] + [f"Next State (x={a}) | Output (x={a})" for a in mealy.alphabet]
    lines = ["| " + " | ".join(header) + " |"]
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")

    for s in mealy.states:
        row = [f"**{s}**" + (" (Start)" if s == mealy.start_state else "")]
        for a in mealy.alphabet:
            trans = mealy.transitions.get(s, {}).get(a)
            if trans:
                row.append(f"{trans[0]} | {trans[1]}")
            else:
                row.append("- | -")
        lines.append("| " + " | ".join(row) + " |")

    return "\n".join(lines)


def format_moore_table(moore: MooreMachine) -> str:
    """Returns markdown table of Moore Machine."""
    header = ["Present State"] + [f"Next State (x={a})" for a in moore.alphabet] + ["Output"]
    lines = ["| " + " | ".join(header) + " |"]
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")

    for s in moore.states:
        row = [f"**{s}**" + (" (Start)" if s == moore.start_state else "")]
        for a in moore.alphabet:
            nxt = moore.transitions.get(s, {}).get(a, "-")
            row.append(nxt)
        row.append(f"`{moore.state_outputs.get(s, '-')}`")
        lines.append("| " + " | ".join(row) + " |")

    return "\n".join(lines)


if __name__ == "__main__":
    print("=== Mealy to Moore Converter Demonstration ===\n")
    # Standard textbook example
    states = ["q1", "q2", "q3", "q4"]
    alphabet = ["0", "1"]
    start = "q1"
    transitions = {
        "q1": {"0": ("q3", "0"), "1": ("q2", "0")},
        "q2": {"0": ("q1", "1"), "1": ("q4", "0")},
        "q3": {"0": ("q2", "1"), "1": ("q1", "1")},
        "q4": {"0": ("q4", "1"), "1": ("q3", "0")}
    }

    mealy = MealyMachine(states, alphabet, start, transitions)
    print("--- Original Mealy Machine ---")
    print(format_mealy_table(mealy))

    res = convert_mealy_to_moore(mealy)
    moore = res["moore_machine"]

    print("\n--- Converted Moore Machine ---")
    print(format_moore_table(moore))

    print("\n--- Incoming Outputs Analysis ---")
    for s, outs in res["incoming_outputs"].items():
        print(f"State {s}: incoming outputs = {outs}")

    print("\n--- Verification through Simulation ---")
    test_seq = "10110"
    m_sim = mealy.simulate(test_seq)
    mo_sim = moore.simulate(test_seq)
    print(f"Input string:               {test_seq}")
    print(f"Mealy machine output:       {m_sim['output_sequence']}")
    print(f"Moore machine full output:  {mo_sim['full_output']}")
    print(f"Moore equivalent output:    {mo_sim['mealy_equivalent_output']}")
    print(f"Equivalence verified:       {m_sim['output_sequence'] == mo_sim['mealy_equivalent_output']}")
