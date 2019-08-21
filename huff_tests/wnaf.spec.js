/* eslint-disable new-cap */

const chai = require('chai');
const BN = require('bn.js');
const EC = require('elliptic');
const path = require('path');

const { expect } = chai;

const { Runtime, getNewVM } = require('../../huff/src/runtime.js');

const vm = getNewVM();

const BabyJubJub = require('../bjj_reference.js');

const pathToTestData = path.posix.resolve(__dirname, '../huff_modules');

const { p, n } = BabyJubJub;

const referenceCurve = new EC.curve.edwards({
    a: '292fc',
    d: '292f8',
    p: p.toString(16),
    n: n.toString(16),
    c: '1',
});

function mload(memory, position) {
    return new BN(memory.slice(position * 2, position * 2 + 64), 16);
}

function mloadNum(memory, position) {
    return parseInt(memory.slice(position * 2, position * 2 + 64), 16);
}

const helperMacros = `
#include "constants.huff"
#include "main_loop.huff"
#include "validate.huff"
#include "precompute_table.huff"
#include "wnaf.huff"

#define macro WNAF__TEST = takes(0) returns(4) {
    SET_CONSTANTS()
    VALIDATE__CALLVALUE_AND_INPUT_SIZE()

    WNAF_WIDTH() 0 sub

    2P()
    P()

    PRECOMPUTE_TABLE__COMPUTE()

    WNAF()
    WNAF_START() WNAF_WIDTH() 256 mul add
    WNAF_WIDTH()
    WNAF_START()
}
`;

function generateCalldata(numPoints) {
    const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
    const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
    return {
        calldata: [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []),
        points,
        scalars,
    };
}

function getPoint(memory, index, i) {
    const x = mload(memory, mloadNum(memory, index + (i + 1) * 0x20));
    const y = mload(memory, mloadNum(memory, index + (i + 1) * 0x20) + 0x20);
    return referenceCurve.point(x, y);
}

describe('WNAF table', function describe() {
    this.timeout(10000);
    let wnaf;
    before(async () => {
        wnaf = new Runtime(helperMacros, pathToTestData);
    });

    it('macro WNAF computes WNAF table for ONE point', async () => {
        const numPoints = 1;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for TWO points', async () => {
        const numPoints = 2;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for THREE points', async () => {
        const numPoints = 3;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for FOUR points', async () => {
        const numPoints = 4;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for FIVE points', async () => {
        const numPoints = 5;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for SIX points', async () => {
        const numPoints = 6;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for SEVEN points', async () => {
        const numPoints = 7;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for EIGHT points', async () => {
        const numPoints = 8;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for NINE points', async () => {
        const numPoints = 9;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for TEN points', async () => {
        const numPoints = 10;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for ELEVEN points', async () => {
        const numPoints = 11;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for TWELVE points', async () => {
        const numPoints = 12;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for THIRTEEN points', async () => {
        const numPoints = 13;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for FOURTEEN points', async () => {
        const numPoints = 14;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });

    it('macro WNAF computes WNAF table for FIFTEEN points', async () => {
        const numPoints = 15;
        const { calldata, points, scalars } = generateCalldata(numPoints);
        const { stack, memory: rawMemory } = await wnaf(vm, 'WNAF__TEST', [], [], calldata);
        const memory = Buffer.from(rawMemory).toString('hex');

        expect(stack.length).to.equal(6);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        let acc = referenceCurve.point(new BN(0), new BN(1));
        let index = stack[3].toNumber();
        const wnafWidth = stack[4].toNumber();
        const wnafStart = stack[5].toNumber();

        while (mloadNum(memory, index) !== 0x200) {
            const numPointsToAdd = (mloadNum(memory, index) || 0) / 32;
            for (let i = 0; i < numPointsToAdd; i += 1) {
                const pointToAdd = getPoint(memory, index, i);
                acc = acc.add(pointToAdd);
            }
            index -= wnafWidth;
            acc = acc.dbl();
        }

        const numPointsToAdd = mloadNum(memory, wnafStart - 0x20) / 32;
        for (let i = 0; i < numPointsToAdd; i += 1) {
            const pointToAdd = getPoint(memory, index, i);
            acc = acc.add(pointToAdd);
        }

        acc = acc.normalize();
        expect(expected.x.fromRed().eq(acc.x.fromRed())).to.equal(true);
    });
});
