/* eslint-disable new-cap */

const chai = require('chai');
const BN = require('bn.js');
const EC = require('elliptic');
const path = require('path');

const { expect } = chai;

const { Runtime, getNewVM } = require('../../huff/src/runtime.js');

const vm = getNewVM();

const BabyJubJub = require('../js_snippets/bjj_reference.js');

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
    return new BN(Buffer.from(memory).toString('hex').slice(position * 2, position * 2 + 64), 16);
}

const helperMacros = `
#include "constants.huff"
#include "precompute_table.huff"
#include "main_loop.huff"
#include "validate.huff"

#define macro PRECOMPUTE_TABLE__TABLE_PROPERTIES = takes(0) returns(2) {
    PRECOMPUTE_TABLE_START()
    PRECOMPUTE_TABLE_LENGTH() // per point
}

#define macro PRECOMPUTE_TABLE__TEST = takes(0) returns(2) {
    SET_CONSTANTS()
    VALIDATE__CALLVALUE_AND_INPUT_SIZE()
    2P()
    P()
    PRECOMPUTE_TABLE__COMPUTE()
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
    };
}

function validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint) {
    for (let i = 0; i < numPoints; i += 1) {
        for (let j = 0; j < 8; j += 1) {
            const expPoint = referenceCurve.point(points[i].x, points[i].y).mul(new BN(2 * j + 1)).normalize();
            const positiveResult = {
                x: mload(memory, tableStartLocation + tableLengthPerPoint * i + 0x80 * j),
                y: mload(memory, tableStartLocation + tableLengthPerPoint * i + 0x80 * j + 0x20),
            };
            const negativeResult = {
                x: mload(memory, tableStartLocation + tableLengthPerPoint * i + 0x80 * (16 - j - 1)),
                y: mload(memory, tableStartLocation + tableLengthPerPoint * i + 0x80 * (16 - j - 1) + 0x20),
            };
            expect(expPoint.x.fromRed().eq(positiveResult.x)).to.equal(true);
            expect(expPoint.y.fromRed().eq(positiveResult.y)).to.equal(true);
            expect(p.sub(expPoint.x.fromRed()).eq(negativeResult.x)).to.equal(true);
            expect(expPoint.y.fromRed().eq(negativeResult.y)).to.equal(true);
        }
    }
}

describe('Oliver lookup table', function describe() {
    this.timeout(5000);
    let precomputeTable;
    let tableStartLocation;
    let tableLengthPerPoint;
    before(async () => {
        precomputeTable = new Runtime(helperMacros, pathToTestData);
        const constStack = (await precomputeTable(vm, 'PRECOMPUTE_TABLE__TABLE_PROPERTIES', [], [], [])).stack;
        tableStartLocation = constStack[0].toNumber();
        tableLengthPerPoint = constStack[1].toNumber();
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for ONE point', async () => {
        const numPoints = 1;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for TWO points', async () => {
        const numPoints = 2;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for THREE points', async () => {
        const numPoints = 3;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for FOUR points', async () => {
        const numPoints = 4;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for FIVE points', async () => {
        const numPoints = 5;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for SIX points', async () => {
        const numPoints = 6;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for SEVEN points', async () => {
        const numPoints = 7;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for EIGHT points', async () => {
        const numPoints = 8;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for NINE points', async () => {
        const numPoints = 9;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for TEN points', async () => {
        const numPoints = 10;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for ELEVEN points', async () => {
        const numPoints = 11;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for TWELVE points', async () => {
        const numPoints = 12;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for THIRTEEN points', async () => {
        const numPoints = 13;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for FOURTEEN points', async () => {
        const numPoints = 14;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });

    it('macro PRECOMPUTE_TABLE__COMPUTE calculates lookup table for FIFTEEN point', async () => {
        const numPoints = 15;
        const { points, calldata } = generateCalldata(numPoints);
        const { memory, stack } = await precomputeTable(vm, 'PRECOMPUTE_TABLE__TEST', [], [], calldata);
        expect(stack.length).to.equal(2);
        validateTables(numPoints, points, memory, tableStartLocation, tableLengthPerPoint);
    });
});
