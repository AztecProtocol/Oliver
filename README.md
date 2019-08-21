## **Oliver**: efficient Baby-JubJub point arithmetic for smart contracts

Oliver (full name: Oliver Twisted Edwards) is a smart contract that performs elliptic curve point multiplication on the Baby-JubJub curve.

It can multiply up to 15 points (with distinct scalars) at once.

### **Benchmarks**

Gas estimates can be obtained by running `yarn benchmark`.

| Number of points | Approximate gas cost (average of 10 runs) | Cost per point |
| ---------------- | ----------------------------------------- | -------------- |
| 1                | 82,601                                    | 82,601         |
| 2	               | 107,543                                   | 53,772         |
| 3                | 132,417                                   | 44,139         |
| 4                | 158,485                                   | 39,621         |
| 5                | 184,672                                   | 36,934         |
| 6                | 210,932                                   | 35,155         |
| 7                | 238,180                                   | 34,026         |
| 8                | 267,181                                   | 33,398         |
| 9                | 294,501                                   | 32,722         |
| 10               | 321,973                                   | 32,197         |
| 11               | 352,063                                   | 32,006         |
| 12               | 381,345                                   | 31,779         |
| 13               | 412,065                                   | 31,697         |
| 14               | 441,876                                   | 31,563         |
| 15               | 474,110                                   | 31,607         |

### **Usage**

1.  Run Oliver tests with `yarn test`
2.  Run Oliver benchmarks with `yarn benchmark`
