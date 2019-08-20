const path = require('path');

const BN = require('bn.js');
const BabyJubJub = require('./bjj_reference.js');
const { Runtime, getNewVM } = require('../huff/src/runtime.js');

const vm = getNewVM();

const pathToTestData = path.posix.resolve(__dirname, './huff_modules');

const main = new Runtime('main_loop.huff', pathToTestData);

async function testMultiplyNPoints(n) {
    const points = [];
    const scalars = [];
    for (let i = 0; i < n; i += 1) {
        points.push(BabyJubJub.randomPoint());
        scalars.push(BabyJubJub.randomScalar());
    }
    const calldata = [];
    for (let i = 0; i < n; i += 1) {
        calldata.push({ index: i * 96, value: points[i].x });
        calldata.push({ index: i * 96 + 32, value: points[i].y });
        calldata.push({ index: i * 96 + 64, value: scalars[i] });
    }

    try {
        const data = await main(vm, 'OLIVER__MAIN', [], [], calldata, 0);
        const returnData = data.returnValue.toString('hex');
        const result = BabyJubJub.toAffine({
            x: new BN(returnData.slice(0, 64), 16),
            y: new BN(returnData.slice(64, 128), 16),
            z: new BN(returnData.slice(128, 192), 16),
        });
        let expResult = { x: new BN(0), y: new BN(1), z: new BN(1) };
        for (let i = 0; i < n; i += 1) {
            const r = BabyJubJub.scalarMul(points[i], scalars[i]);
            expResult = BabyJubJub.addProjective(
                expResult.x, expResult.y, expResult.z,
                r.x, r.y, r.z
            );
        }
        expResult = BabyJubJub.toAffine(expResult);
        if (result.x.eq(expResult.x) && result.y.eq(expResult.y)) {
            console.log('Test passed.');
        } else {
            console.log('Test failed.');
        }
        // console.log(`${Buffer.from(data.memory).toString('hex')}`);
        console.log(`stack: ${data.stack}`);
        console.log(`returned: ${data.returnValue.toString('hex')}`);
        console.log(`Gas used: ${data.gas}`);
        // console.log(data.bytecode);
    } catch (error) {
        console.error(error);
    }
}

testMultiplyNPoints(15).then(() => console.log('Done.'));
