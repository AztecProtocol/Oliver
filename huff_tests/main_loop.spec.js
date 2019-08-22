/* eslint-disable new-cap */

const chai = require('chai');
const BN = require('bn.js');
const EC = require('elliptic');
const path = require('path');

const { Runtime, getNewVM } = require('../../huff/src/runtime.js');
const BabyJubJub = require('../bjj_reference');

const vm = getNewVM();

const { expect } = chai;
const { p, n } = BabyJubJub;

const pathToTestData = path.posix.resolve(__dirname, '../huff_modules');

const referenceCurve = new EC.curve.edwards({
    a: '292fc',
    d: '292f8',
    p: p.toString(16),
    n: n.toString(16),
    c: '1',
});

describe('Oliver main loop', function describe() {
    this.timeout(10000);
    let main;
    before(async () => {
        main = new Runtime('main_loop.huff', pathToTestData);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of ONE point', async () => {
        const numPoints = 1;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of TWO points', async () => {
        const numPoints = 2;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of THREE points', async () => {
        const numPoints = 3;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of FOUR points', async () => {
        const numPoints = 4;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of FIVE points', async () => {
        const numPoints = 5;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of SIX points', async () => {
        const numPoints = 6;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of SEVEN points', async () => {
        const numPoints = 7;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of EIGHT points', async () => {
        const numPoints = 8;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of NINE points', async () => {
        const numPoints = 9;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of TEN points', async () => {
        const numPoints = 10;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of ELEVEN points', async () => {
        const numPoints = 11;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of TWELVE points', async () => {
        const numPoints = 12;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of THIRTEEN points', async () => {
        const numPoints = 13;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of FOURTEEN points', async () => {
        const numPoints = 14;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });

    it('macro OLIVER__MAIN calculates scalar multiplication of FIFTEEN points', async () => {
        const numPoints = 15;
        const points = [...new Array(numPoints)].map(() => BabyJubJub.randomPoint());
        const scalars = [...new Array(numPoints)].map(() => BabyJubJub.randomScalar());
        const calldata = [...new Array(numPoints)].reduce((acc, x, i) => {
            return [
                ...acc,
                { index: i * 3 * 32, value: points[i].x },
                { index: (i * 3 + 1) * 32, value: points[i].y },
                { index: (i * 3 + 2) * 32, value: scalars[i] },
            ];
        }, []);

        const expected = points.reduce((acc, { x, y }, i) => {
            if (!acc) {
                return referenceCurve.point(x, y).mul(scalars[i]);
            }
            return acc.add(referenceCurve.point(x, y).mul(scalars[i]));
        }, null).normalize();

        const { stack, returnValue } = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnValueStr = returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnValueStr.slice(0, 64), 16),
            y: new BN(returnValueStr.slice(64, 128), 16),
            z: new BN(returnValueStr.slice(128, 192), 16),
        });

        expect(returnValueStr.length).to.equal(192);
        expect(stack.length).to.equal(0);
        expect(result.x.eq(expected.x.fromRed())).to.equal(true);
        expect(result.y.eq(expected.y.fromRed())).to.equal(true);
    });
});
