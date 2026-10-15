const docx = require('docx');
const fs = require('fs');
const path = require('path');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = docx;

function createCell(text, isHeader = false, widthPct = 20, align = AlignmentType.CENTER) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: isHeader ? { fill: '1E293B', type: ShadingType.CLEAR } : undefined,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text),
            bold: isHeader,
            color: isHeader ? 'FFFFFF' : '000000',
            size: 20, // 10pt
            font: 'Arial'
          })
        ]
      })
    ]
  });
}

function createTable(headers, rows, widths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => createCell(h, true, widths[i]))
  });

  const bodyRows = rows.map(r => new TableRow({
    children: r.map((c, i) => createCell(c, false, widths[i]))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Arial', size: 22 }
      }
    }
  },
  sections: [
    {
      properties: {},
      children: [
        // Title Block
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'TECHNICAL ASSESSMENT EVALUATION 2 (TAE2)',
              bold: true,
              size: 28,
              color: '1E3A8A'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Automated Mealy to Moore Machine Matrix Converter\nBenchmark Test Suite: Inputs & Desired Outputs Report',
              bold: true,
              size: 24,
              color: '3B82F6'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'Course: Theory of Computation / Formal Languages & Automata Theory\nSubmission: 5+ Comprehensive Automata Benchmark Test Cases',
              italic: true,
              size: 20,
              color: '64748B'
            })
          ]
        }),
        new Paragraph({ text: '' }),

        // Executive Summary
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: '1. Theoretical Framework & Equivalence Principle', bold: true, size: 24, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'In finite automata theory, a Mealy machine produces outputs associated with its state transitions (λ: Q × Σ → Δ), whereas a Moore machine produces outputs associated strictly with its states (λ\': Q\' → Δ). To convert a Mealy machine to an equivalent Moore machine, each state q is split into k distinct states if q is entered with k distinct outputs: O(q) = { λ(p, a) | δ(p, a) = q }.\n\n'
            }),
            new TextRun({
              text: 'Mathematical Equivalence Property: ',
              bold: true
            }),
            new TextRun({
              text: 'For any input string w = a1 a2 ... an of length n, the Mealy machine generates n outputs, while the Moore machine generates n + 1 outputs (including the initial state output λ\'(q0\')). Disregarding this initial output, the output sequences are identical: Moore(w) = λ\'(q0\') · Mealy(w). Below are 5 canonical benchmark test cases verifying this automated conversion.'
            })
          ]
        }),
        new Paragraph({ text: '' }),

        // TEST CASE 1
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Test Case 1: 101 Sequence Detector (Overlapping)', bold: true, size: 22, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Description: ', bold: true }),
            new TextRun({ text: 'Detects occurrences of the bit pattern "101" in an input stream. Outputs 1 upon detecting "101", 0 otherwise. Supports overlapping detection.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'INPUT: Mealy Machine Matrix Table', bold: true, color: '2563EB' })] }),
        createTable(
          ['Present State', 'Next State (x=0)', 'Output (x=0)', 'Next State (x=1)', 'Output (x=1)'],
          [
            ['S0 (Start)', 'S0', '0', 'S1', '0'],
            ['S1', 'S2', '0', 'S1', '0'],
            ['S2', 'S0', '0', 'S1', '1']
          ],
          [24, 19, 19, 19, 19]
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Conversion Trace: ', bold: true }),
            new TextRun({ text: 'Incoming outputs: O(S0)={0}, O(S1)={0, 1}, O(S2)={0}. State S1 splits into S1_0 (out: 0) and S1_1 (out: 1).' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'DESIRED OUTPUT: Equivalent Moore Machine Matrix Table', bold: true, color: '059669' })] }),
        createTable(
          ['Moore State', 'Next State (x=0)', 'Next State (x=1)', 'State Output (λ\')'],
          [
            ['S0_0 (Start)', 'S0_0', 'S1_0', '0'],
            ['S1_0', 'S2_0', 'S1_0', '0'],
            ['S1_1', 'S2_0', 'S1_0', '1'],
            ['S2_0', 'S0_0', 'S1_1', '0']
          ],
          [28, 24, 24, 24]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: 'Verification Sample: ', bold: true }),
            new TextRun({ text: 'Input w = "10101101" | Mealy Output = "00101001" | Moore Output = "000101001" (Tail Match: 100% PASS)' })
          ]
        }),
        new Paragraph({ text: '' }),

        // TEST CASE 2
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Test Case 2: 2\'s Complement Generator (LSB First)', bold: true, size: 22, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Description: ', bold: true }),
            new TextRun({ text: 'Computes the two\'s complement of a binary number presented least significant bit (LSB) first. Bits are preserved until the first 1, after which all subsequent bits are inverted.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'INPUT: Mealy Machine Matrix Table', bold: true, color: '2563EB' })] }),
        createTable(
          ['Present State', 'Next State (x=0)', 'Output (x=0)', 'Next State (x=1)', 'Output (x=1)'],
          [
            ['A (Start)', 'A', '0', 'B', '1'],
            ['B', 'B', '1', 'B', '0']
          ],
          [24, 19, 19, 19, 19]
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Conversion Trace: ', bold: true }),
            new TextRun({ text: 'Incoming outputs: O(A)={0}, O(B)={0, 1}. State B splits into B_0 (out: 0) and B_1 (out: 1).' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'DESIRED OUTPUT: Equivalent Moore Machine Matrix Table', bold: true, color: '059669' })] }),
        createTable(
          ['Moore State', 'Next State (x=0)', 'Next State (x=1)', 'State Output (λ\')'],
          [
            ['A_0 (Start)', 'A_0', 'B_1', '0'],
            ['B_0', 'B_1', 'B_0', '0'],
            ['B_1', 'B_1', 'B_0', '1']
          ],
          [28, 24, 24, 24]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: 'Verification Sample: ', bold: true }),
            new TextRun({ text: 'Input w = "001010" | Mealy Output = "001101" | Moore Output = "0001101" (Tail Match: 100% PASS)' })
          ]
        }),
        new Paragraph({ text: '' }),

        // TEST CASE 3
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Test Case 3: 4-State Standard Textbook / Exam Problem', bold: true, size: 22, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Description: ', bold: true }),
            new TextRun({ text: 'A classic 4-state Mealy finite state machine commonly featured in GATE / University automata exams to test state splitting on multiple states simultaneously.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'INPUT: Mealy Machine Matrix Table', bold: true, color: '2563EB' })] }),
        createTable(
          ['Present State', 'Next State (x=0)', 'Output (x=0)', 'Next State (x=1)', 'Output (x=1)'],
          [
            ['q1 (Start)', 'q3', '0', 'q2', '0'],
            ['q2', 'q1', '1', 'q4', '0'],
            ['q3', 'q2', '1', 'q1', '1'],
            ['q4', 'q4', '1', 'q3', '0']
          ],
          [24, 19, 19, 19, 19]
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Conversion Trace: ', bold: true }),
            new TextRun({ text: 'Incoming outputs: O(q1)={1}, O(q2)={0, 1}, O(q3)={0}, O(q4)={0, 1}. Both q2 and q4 split into two states each.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'DESIRED OUTPUT: Equivalent Moore Machine Matrix Table', bold: true, color: '059669' })] }),
        createTable(
          ['Moore State', 'Next State (x=0)', 'Next State (x=1)', 'State Output (λ\')'],
          [
            ['q1_1 (Start)', 'q3_0', 'q2_0', '1'],
            ['q2_0', 'q1_1', 'q4_0', '0'],
            ['q2_1', 'q1_1', 'q4_0', '1'],
            ['q3_0', 'q2_1', 'q1_1', '0'],
            ['q4_0', 'q4_1', 'q3_0', '0'],
            ['q4_1', 'q4_1', 'q3_0', '1']
          ],
          [28, 24, 24, 24]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: 'Verification Sample: ', bold: true }),
            new TextRun({ text: 'Input w = "010110" | Mealy Output = "010101" | Moore Output = "1010101" (Tail Match: 100% PASS)' })
          ]
        }),
        new Paragraph({ text: '' }),

        // TEST CASE 4
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Test Case 4: Odd/Even Parity Bit Generator', bold: true, size: 22, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Description: ', bold: true }),
            new TextRun({ text: 'Tracks the running parity of 1s in a bitstream. Outputs 1 when the cumulative count of 1s is odd, and 0 when even.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'INPUT: Mealy Machine Matrix Table', bold: true, color: '2563EB' })] }),
        createTable(
          ['Present State', 'Next State (x=0)', 'Output (x=0)', 'Next State (x=1)', 'Output (x=1)'],
          [
            ['Even (Start)', 'Even', '0', 'Odd', '1'],
            ['Odd', 'Odd', '1', 'Even', '0']
          ],
          [24, 19, 19, 19, 19]
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Conversion Trace: ', bold: true }),
            new TextRun({ text: 'Incoming outputs: O(Even)={0}, O(Odd)={1}. Splitting produces Even_0 and Odd_1.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'DESIRED OUTPUT: Equivalent Moore Machine Matrix Table', bold: true, color: '059669' })] }),
        createTable(
          ['Moore State', 'Next State (x=0)', 'Next State (x=1)', 'State Output (λ\')'],
          [
            ['Even_0 (Start)', 'Even_0', 'Odd_1', '0'],
            ['Odd_1', 'Odd_1', 'Even_0', '1']
          ],
          [28, 24, 24, 24]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: 'Verification Sample: ', bold: true }),
            new TextRun({ text: 'Input w = "1101001" | Mealy Output = "1001110" | Moore Output = "01001110" (Tail Match: 100% PASS)' })
          ]
        }),
        new Paragraph({ text: '' }),

        // TEST CASE 5
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Test Case 5: Serial Binary Adder (Carry Bit State Machine)', bold: true, size: 22, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Description: ', bold: true }),
            new TextRun({ text: 'Adds two binary numbers bit-by-bit from LSB to MSB. Input alphabet is pairs of bits {00, 01, 10, 11}. State C0 represents Carry=0, state C1 represents Carry=1.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'INPUT: Mealy Machine Matrix Table', bold: true, color: '2563EB' })] }),
        createTable(
          ['State', 'Next/Out (00)', 'Next/Out (01)', 'Next/Out (10)', 'Next/Out (11)'],
          [
            ['C0 (Start)', 'C0 / 0', 'C0 / 1', 'C0 / 1', 'C1 / 0'],
            ['C1', 'C0 / 1', 'C1 / 0', 'C1 / 0', 'C1 / 1']
          ],
          [20, 20, 20, 20, 20]
        ),
        new Paragraph({ text: '' }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Conversion Trace: ', bold: true }),
            new TextRun({ text: 'Incoming outputs: O(C0)={0, 1}, O(C1)={0, 1}. Both carry states split into sum output 0 and sum output 1.' })
          ]
        }),
        new Paragraph({ children: [new TextRun({ text: 'DESIRED OUTPUT: Equivalent Moore Machine Matrix Table', bold: true, color: '059669' })] }),
        createTable(
          ['Moore State', 'Next (00)', 'Next (01)', 'Next (10)', 'Next (11)', 'State Output'],
          [
            ['C0_0 (Start)', 'C0_0', 'C0_1', 'C0_1', 'C1_0', '0'],
            ['C0_1', 'C0_0', 'C0_1', 'C0_1', 'C1_0', '1'],
            ['C1_0', 'C0_1', 'C1_0', 'C1_0', 'C1_1', '0'],
            ['C1_1', 'C0_1', 'C1_0', 'C1_0', 'C1_1', '1']
          ],
          [20, 16, 16, 16, 16, 16]
        ),
        new Paragraph({
          children: [
            new TextRun({ text: 'Verification Sample: ', bold: true }),
            new TextRun({ text: 'Input sequence (01, 11, 00) => (A=1+3=4) | Mealy Output = "101" | Moore Output = "0101" (Tail Match: 100% PASS)' })
          ]
        }),
        new Paragraph({ text: '' }),

        // Summary Table
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: 'Conclusion & Benchmark Summary', bold: true, size: 24, color: '1E3A8A' })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'All 5 benchmark test cases rigorously demonstrate the correctness of the automated conversion algorithm. In every test case, the output sequences generated by the Moore machine match the Mealy machine exactly across all clock cycles after the initial state offset, confirming complete mathematical and behavioral equivalence.'
            })
          ]
        })
      ]
    }
  ]
});

const outDir = path.join(__dirname, 'submission_files');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const docxPath = path.join(outDir, 'Mealy_to_Moore_Test_Cases_and_IO.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  console.log(`Word document created successfully at: ${docxPath}`);
}).catch(err => {
  console.error('Error generating DOCX:', err);
});
