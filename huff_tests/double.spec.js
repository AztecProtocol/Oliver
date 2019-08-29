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

const { p, n, pRed } = BabyJubJub;

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

const helperMacros = `
#include "constants.huff"
#include "double.huff"

#define macro DOUBLE__PROJECTIVE_TEST = takes(0) returns(2) {
    2P()
    P()
    0x20 calldataload
    0x40 calldataload
    0x00 calldataload
    DOUBLE__PROJECTIVE<dup4,dup5,dup8>()
    0x00 mstore
    0x40 mstore
    0x20 mstore
    0x60 0x00 return
}
`;

describe('BabyJubJub point doubling', () => {
    let double;
    before(async () => {
        double = new Runtime(helperMacros, pathToTestData);
    });

    it('macro DOUBLE__PROJECTIVE doubles point in projective coordinates', async () => {
        const point = BabyJubJub.randomPointExtended();
        const calldata = [
            { index: 0, value: point.x },
            { index: 32, value: point.y },
            { index: 64, value: point.z },
        ];
        const expResult = referenceCurve.point(point.x, point.y, point.z).dbl().normalize();
        const { returnValue, stack } = await double(vm, 'DOUBLE__PROJECTIVE_TEST', [], [], calldata);
        const returnStr = Buffer.from(returnValue).toString('hex');
        expect(stack.length).to.equal(2);
        expect(mload(returnStr, 0x00).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.x.fromRed())).to.equal(true);
        expect(mload(returnStr, 0x20).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.y.fromRed())).to.equal(true);
    });
});
