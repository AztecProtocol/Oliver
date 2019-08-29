## Oliver: efficient Baby-JubJub point arithmetic for smart contracts

Oliver (full name: Oliver Twisted Edwards) is a smart contract that performs elliptic curve point multiplication on the Baby-JubJub curve.

It can multiply up to 15 points (with up to 15 distinct scalars) at once.

### Optimisations

Oliver is written in [Huff](https://github.com/AztecProtocol/huff), a low-level language that compiles to Ethereum Virtual Machine opcodes. It also uses many of the same optimisations employed by [weierstrudel](https://github.com/AztecProtocol/weierstrudel):

* Shamir's trick, which combines multiple scalar multiplications into a single double-and-add loop, fixing the number of 'point doubling' operations to ~254
* Sliding Window Non-Adjacent Form, a representation of scalar multipliers which reduces the number of 'point addition' operations to ~50 per point
* Using the difference between the Baby-JubJub curve's 254-bit field modulus and the EVM's 256 word size to defer modular reductions until absolutely necessary

Because Baby-JubJub is a Twisted Edwards curve, a couple of optimisations from weierstrudel could not be used, namely the curve endomorphism which halved the number of point doubling operations required, and the trick whereby one could pretend points in projective coordinates had a Z value of 1. For these reasons, it's a bit less efficient than weierstrudel.

### Benchmarks

Gas estimates can be obtained by running `yarn benchmark`.

| Number of points | Approximate gas cost (average of 25 runs) | Cost per point |
| ---------------- | ----------------------------------------- | -------------- |
| 1                | 82,209                                    | 82,209         |
| 2	               | 107,060                                   | 53,530         |
| 3                | 132,017                                   | 44,006         |
| 4                | 157,479                                   | 39,370         |
| 5                | 183,351                                   | 36,670         |
| 6                | 210,331                                   | 35,055         |
| 7                | 236,715                                   | 33,816         |
| 8                | 265,050                                   | 33,131         |
| 9                | 292,186                                   | 32,465         |
| 10               | 321,404                                   | 32,140         |
| 11               | 349,137                                   | 31,740         |
| 12               | 379,098                                   | 31,592         |
| 13               | 408,159                                   | 31,397         |
| 14               | 439,310                                   | 31,379         |
| 15               | 469,646                                   | 31,310         |

### Usage

1.  Run Oliver tests with `yarn test`
2.  Run Oliver benchmarks with `yarn benchmark`
