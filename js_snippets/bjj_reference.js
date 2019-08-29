/* eslint-disable object-curly-newline */
/* eslint-disable no-underscore-dangle */

const BN = require('bn.js');
const crypto = require('crypto');

const p = new BN('30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001', 16);
const n = new BN('60c89ce5c263405370a08b6d0302b0bab3eedb83920ee0a677297dc392126f1', 16);
const pRed = BN.red(p);
const nRed = BN.red(n);

// BabyJubJub formula: a.x^2 + y^2 = 1 + d.x^2.y^2 (mod p)
const a = new BN('292fc', 16).toRed(pRed);
const d = new BN('292f8', 16).toRed(pRed);

const BabyJubJub = {};

BabyJubJub.a = a;
BabyJubJub.d = d;
BabyJubJub.p = p;
BabyJubJub.pRed = pRed;
BabyJubJub.n = n;
BabyJubJub.nRed = nRed;

BabyJubJub._doubleProjective = function _doubleProjective({ x, y, z }) {
    const A = x.redSqr();
    const B = y.redSqr();
    const C = z.redSqr().redMul(new BN(2).toRed(pRed));
    const D = A.redMul(a);
    const E = x.redAdd(y).redSqr().redSub(A.redAdd(B));
    const G = D.redAdd(B);
    const F = G.redSub(C);
    const H = D.redSub(B);
    const x3 = E.redMul(F);
    const y3 = G.redMul(H);
    const z3 = F.redMul(G);
    return { x: x3, y: y3, z: z3 };
};

BabyJubJub._doubleProjectiveToExtended = function _doubleProjectiveToExtended({ x, y, z }) {
    const A = x.redSqr();
    const B = y.redSqr();
    const C = z.redSqr().redMul(new BN(2).toRed(pRed));
    const D = A.redMul(a);
    const E = x.redAdd(y).redSqr().redSub(A.redAdd(B));
    const G = D.redAdd(B);
    const F = G.redSub(C);
    const H = D.redSub(B);
    const x3 = E.redMul(F);
    const y3 = G.redMul(H);
    const t3 = E.redMul(H);
    const z3 = F.redMul(G);
    return { x: x3, y: y3, t: t3, z: z3 };
};

BabyJubJub._addProjective = function _addProjective(
    { x1, y1, z1 }, { x2, y2, z2 }
) {
    const A = z1.redMul(z2);
    const B = A.redSqr();
    const C = x1.redMul(x2);
    const D = y1.redMul(y2);
    const E = d.redMul(C).redMul(D);
    const F = B.redSub(E);
    const G = B.redAdd(E);
    const x3 = A.redMul(F).redMul(x1.redAdd(y1).redMul(x2.redAdd(y2)).redSub(C.redAdd(D)));
    const y3 = A.redMul(G).redMul(D.redSub(a.redMul(C)));
    const z3 = F.redMul(G);
    return { x: x3, y: y3, z: z3 };
};

BabyJubJub._addExtendedToProjective = function _addExtendedToProjective(
    { x1, y1, t1, z1 }, { x2, y2, t2, z2 }
) {
    const A = x1.redMul(x2);
    const B = y1.redMul(y2);
    const C = z1.redMul(t2);
    const D = t1.redMul(z2);
    const E = D.redAdd(C);
    const F = x1.redSub(y1).redMul(x2.redAdd(y2)).redAdd(B).redSub(A);
    const G = A.redMul(a).redAdd(B);
    const H = D.redSub(C);
    const x3 = E.redMul(F);
    const y3 = G.redMul(H);
    const z3 = F.redMul(G);
    return { x: x3, y: y3, z: z3 };
};

BabyJubJub.isEqual = function isEqual(x1, y1, z1, x2, y2, z2) {
    const z1Red = z1.toRed(pRed);
    const z2Red = z2.toRed(pRed);
    return (
        x1.toRed(pRed).redMul(z2Red).fromRed().eq(x2.toRed(pRed).redMul(z1Red).fromRed())
        && y1.toRed(pRed).redMul(z2Red).fromRed().eq(y2.toRed(pRed).redMul(z1Red).fromRed())
    );
};

BabyJubJub.doubleProjective = (x, y, z) => {
    const xRed = x.toRed(pRed);
    const yRed = y.toRed(pRed);
    const zRed = z.toRed(pRed);
    const result = BabyJubJub._doubleProjective({ x: xRed, y: yRed, z: zRed });
    return {
        x: result.x.fromRed(),
        y: result.y.fromRed(),
        z: result.z.fromRed(),
    };
};

BabyJubJub.doubleProjectiveToExtended = (x, y, z) => {
    const xRed = x.toRed(pRed);
    const yRed = y.toRed(pRed);
    const zRed = z.toRed(pRed);
    const result = BabyJubJub._doubleProjectiveToExtended({ x: xRed, y: yRed, z: zRed });
    return {
        x: result.x.fromRed(),
        y: result.y.fromRed(),
        t: result.t.fromRed(),
        z: result.z.fromRed(),
    };
};

BabyJubJub.addProjective = (x1, y1, z1, x2, y2, z2) => {
    const x1Red = x1.toRed(pRed);
    const y1Red = y1.toRed(pRed);
    const z1Red = z1.toRed(pRed);
    const x2Red = x2.toRed(pRed);
    const y2Red = y2.toRed(pRed);
    const z2Red = z2.toRed(pRed);
    const result = BabyJubJub._addProjective(
        { x1: x1Red, y1: y1Red, z1: z1Red },
        { x2: x2Red, y2: y2Red, z2: z2Red }
    );
    return {
        x: result.x.fromRed(),
        y: result.y.fromRed(),
        z: result.z.fromRed(),
    };
};

BabyJubJub.addExtendedToProjective = (x1, y1, t1, z1, x2, y2, t2, z2) => {
    const x1Red = x1.toRed(pRed);
    const y1Red = y1.toRed(pRed);
    const t1Red = t1.toRed(pRed);
    const z1Red = z1.toRed(pRed);
    const x2Red = x2.toRed(pRed);
    const y2Red = y2.toRed(pRed);
    const t2Red = t2.toRed(pRed);
    const z2Red = z2.toRed(pRed);
    const result = BabyJubJub._addExtendedToProjective(
        { x1: x1Red, y1: y1Red, t1: t1Red, z1: z1Red },
        { x2: x2Red, y2: y2Red, t2: t2Red, z2: z2Red }
    );
    return {
        x: result.x.fromRed(),
        y: result.y.fromRed(),
        z: result.z.fromRed(),
    };
};

BabyJubJub.isOnCurve = function isOnCurve(X, Y, Z) {
    const zInv = Z.redInvm();
    const x = X.redMul(zInv);
    const y = Y.redMul(zInv);
    return (y.redSqr().redAdd(x.redSqr().redMul(a)).fromRed().eq(
        y.redMul(x).redSqr().redMul(d).redAdd(new BN(1).toRed(pRed))
    ));
};

BabyJubJub.randomPointInternal = () => {
    const x = new BN(crypto.randomBytes(32), 16).toRed(pRed);
    const y2Num = x.redSqr().redMul(a).redSub(new BN(1).toRed(pRed));
    const y2Den = x.redSqr().redMul(d).redSub(new BN(1).toRed(pRed));
    const y2 = y2Num.redMul(y2Den.redInvm());
    let y;
    try {
        y = y2.redSqrt();
    } catch (error) {
        return BabyJubJub.randomPointInternal();
    }
    if (BabyJubJub.isOnCurve(x, y, new BN(1).toRed(pRed))) {
        return { x, y };
    }
    return BabyJubJub.randomPointInternal();
};

BabyJubJub.randomPoint = () => {
    const { x, y } = BabyJubJub.randomPointInternal();
    return { x: x.fromRed(), y: y.fromRed() };
};

BabyJubJub.randomPointExtended = () => {
    let { x, y } = BabyJubJub.randomPointInternal();
    let z = new BN(crypto.randomBytes(32), 16);
    z = z.toRed(pRed);
    const t = x.redMul(y).redMul(z);
    x = x.redMul(z);
    y = y.redMul(z);
    return {
        x: x.fromRed(),
        y: y.fromRed(),
        t: t.fromRed(),
        z: z.fromRed(),
    };
};

BabyJubJub.randomScalar = () => {
    return new BN(crypto.randomBytes(32), 16).umod(n);
};

BabyJubJub.randomFieldElement = () => {
    return new BN(crypto.randomBytes(32), 16).umod(p);
};

BabyJubJub.scalarMul = (point, scalar) => {
    const x = point.x.toRed(pRed);
    const y = point.y.toRed(pRed);
    const z = (point.z ? point.z : new BN(1)).toRed(pRed);
    const zInv = z.redInvm();
    if (!BabyJubJub.isOnCurve(x, y, z)) {
        throw new Error(`(${x.toString(16)} : ${y.toString(16)} : ${z.toString(16)}) is not on curve.`);
    }

    let accumulator = {
        x: (new BN(0)).toRed(pRed),
        y: (new BN(1)).toRed(pRed),
        z: (new BN(1)).toRed(pRed),
    };
    let i = 256;

    while (i > 0) {
        i -= 1;

        if (scalar.testn(i)) {
            accumulator = BabyJubJub._doubleProjectiveToExtended(accumulator);
            accumulator = BabyJubJub._addExtendedToProjective(
                {
                    x1: accumulator.x,
                    y1: accumulator.y,
                    t1: accumulator.t,
                    z1: accumulator.z,
                },
                {
                    x2: x,
                    y2: y,
                    t2: x.redMul(y).redMul(zInv), // T = XY/Z
                    z2: z,
                }
            );
        } else {
            accumulator = BabyJubJub._doubleProjective(accumulator);
        }
    }

    return { x: accumulator.x.fromRed(), y: accumulator.y.fromRed(), z: accumulator.z.fromRed() };
};

BabyJubJub.toAffine = (point) => {
    const zInv = point.z.toRed(pRed).redInvm();
    const x = point.x.toRed(pRed).redMul(zInv).fromRed();
    const y = point.y.toRed(pRed).redMul(zInv).fromRed();
    return { x, y };
};

module.exports = BabyJubJub;
