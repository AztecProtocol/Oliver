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

const helperMacros = `
#include "add.huff"
#include "constants.huff"

#define macro ADD__PRECOMPUTE_TEST = takes(0) returns(4) {
    2P()
    P()
    0 PRECOMPUTE_TABLE_START()
    0x00 calldataload P2_LOC() mstore
    0x20 calldataload P2_LOC() 0x20 add mstore
    0x40 calldataload P2_LOC() 0x40 add mstore
    0x60 calldataload P2_LOC() 0x60 add mstore
    0x80 calldataload PRECOMPUTE_TABLE_START() mstore
    0xa0 calldataload PRECOMPUTE_TABLE_START() 0x20 add mstore
    0xc0 calldataload PRECOMPUTE_TABLE_START() 0x40 add mstore
    0xe0 calldataload PRECOMPUTE_TABLE_START() 0x60 add mstore
    ADD__PRECOMPUTE<dup2,dup3,dup4,dup5,dup6,dup7,dup8,dup9,dup10,P2_LOC,P2_LOC+0x20,P2_LOC+0x40,P2_LOC+0x60>()
    0x80 PRECOMPUTE_TABLE_START() 0x80 add return
}

#define macro GET_P = takes(0) returns(3) {
    0x20 calldataload
    P()
    0x00 calldataload
}

#define macro ADD__PROJECTIVE_TEST = takes(0) returns(1) {
    2P()
    0x60 calldataload
    0x80 calldataload
    0x40 calldataload
    ADD__PROJECTIVE<GET_P,dup10>()
    0x00 mstore
    0x40 mstore
    0x20 mstore
    0x60 0x00 return
}
`;

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

describe('BabyJubJub point addition', function describe() {
    this.timeout(3000);
    let add;
    before(async () => {
        add = new Runtime(helperMacros, pathToTestData);
    });

    it('macro ADD__PRECOMPUTE adds points in extended coordinates', async () => {
        const p1 = BabyJubJub.randomPointExtended();
        const p2 = BabyJubJub.randomPointExtended();
        const calldata = [
            { index: 0, value: p1.x },
            { index: 32, value: p1.y },
            { index: 64, value: p1.t },
            { index: 96, value: p1.z },
            { index: 128, value: p2.x },
            { index: 160, value: p2.y },
            { index: 192, value: p2.t },
            { index: 224, value: p2.z },
        ];
        const expResult = referenceCurve.point(p1.x, p1.y, p1.z).add(referenceCurve.point(p2.x, p2.y, p2.z)).normalize();
        const { returnValue, stack } = await add(vm, 'ADD__PRECOMPUTE_TEST', [], [], calldata);
        const returnStr = Buffer.from(returnValue).toString('hex');
        expect(stack.length).to.equal(4);
        expect(mload(returnStr, 0x00).toRed(pRed).redMul(mload(returnStr, 0x60).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.x.fromRed())).to.equal(true);
        expect(mload(returnStr, 0x20).toRed(pRed).redMul(mload(returnStr, 0x60).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.y.fromRed())).to.equal(true);
        expect(mload(returnStr, 0x40).toRed(pRed).redMul(mload(returnStr, 0x60).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.x.redMul(expResult.y).fromRed())).to.equal(true);
    });

    it('macro ADD__PROJECTIVE adds points in projective coordinates', async () => {
        const p1 = BabyJubJub.randomPoint();
        const p2 = BabyJubJub.randomPointExtended();
        const calldata = [
            { index: 0, value: p1.x },
            { index: 32, value: p1.y },
            { index: 64, value: p2.x },
            { index: 96, value: p2.y },
            { index: 128, value: p2.z },
        ];
        const expResult = referenceCurve.point(p1.x, p1.y).add(referenceCurve.point(p2.x, p2.y, p2.z)).normalize();
        const { returnValue, stack } = await add(vm, 'ADD__PROJECTIVE_TEST', [], [], calldata);
        const returnStr = Buffer.from(returnValue).toString('hex');
        expect(stack.length).to.equal(1);
        expect(mload(returnStr, 0x00).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.x.fromRed())).to.equal(true);
        expect(mload(returnStr, 0x20).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.y.fromRed())).to.equal(true);
    });

    it('macro ADD__PROJECTIVE can double points in projective coordinates (!)', async () => {
        const p2 = BabyJubJub.randomPointExtended();
        const p1 = BabyJubJub.toAffine(p2);
        const calldata = [
            { index: 0, value: p1.x },
            { index: 32, value: p1.y },
            { index: 64, value: p2.x },
            { index: 96, value: p2.y },
            { index: 128, value: p2.z },
        ];
        const expResult = referenceCurve.point(p1.x, p1.y).add(referenceCurve.point(p2.x, p2.y, p2.z)).normalize();
        const { returnValue, stack } = await add(vm, 'ADD__PROJECTIVE_TEST', [], [], calldata);
        const returnStr = Buffer.from(returnValue).toString('hex');
        expect(stack.length).to.equal(1);
        expect(mload(returnStr, 0x00).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.x.fromRed())).to.equal(true);
        expect(mload(returnStr, 0x20).toRed(pRed).redMul(mload(returnStr, 0x40).toRed(pRed).redInvm()).fromRed()
            .eq(expResult.y.fromRed())).to.equal(true);
    });
});
