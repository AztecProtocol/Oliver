/* eslint-disable new-cap */

const chai = require('chai');
const BN = require('bn.js');
const crypto = require('crypto');
const path = require('path');

const { Runtime, getNewVM } = require('../../huff/src/runtime.js');
const BabyJubJub = require('../bjj_reference');

const vm = getNewVM();

const { expect } = chai;
const { p, pRed } = BabyJubJub;

const pathToTestData = path.posix.resolve(__dirname, '../huff_modules');

describe('Modular multiplicative inverse', function desribe() {
    this.timeout(5000);
    let modinv;
    before(async () => {
        modinv = new Runtime('modinv.huff', pathToTestData);
    });

    it('macro MODINV calculates multiplicative inverse of integer k modulo p', async () => {
        const k = new BN(crypto.randomBytes(32), 16).umod(p);
        const { stack } = await modinv(vm, 'MODINV', [k]);

        const expected = k.toRed(pRed).redInvm().fromRed();

        expect(stack.length).to.equal(1);
        expect(stack[0].eq(expected)).to.equal(true);
    });
});
