const path = require('path');

const BN = require('bn.js');
const BabyJubJub = require('./bjj_reference.js');
const { Runtime, getNewVM } = require('../huff/src/runtime.js');

const vm = getNewVM();

const pathToTestData = path.posix.resolve(__dirname, './huff_modules');

const main = new Runtime('main_loop.huff', pathToTestData);

async function testMultiplyNPoints(n) {
    let points = [];
    let scalars = [];
    for (let i = 0; i < n; i += 1) {
        points.push(BabyJubJub.randomPoint());
        scalars.push(BabyJubJub.randomScalar());
    }
    let calldata = [];
    for (let i = 0; i < n; i += 1) {
        calldata.push({ index: i * 96, value: points[i].x });
        calldata.push({ index: i * 96 + 32, value: points[i].y });
        calldata.push({ index: i * 96 + 64, value: scalars[i] });
    }
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
    // console.log(`JubJubread result: XYZ(0x${result.x.toString(16)}, 0x${result.y.toString(16)}, 1)`);
    // console.log(`memory: ${Buffer.from(data.memory).toString('hex')}`);
    // console.log(`stack: ${data.stack}`);
    // console.log(`returned: ${data.returnValue.toString('hex')}`);
    // console.log(`Gas used: ${data.gas}`);
    // console.log(`Expected result: XYZ(0x${expResult.x.toString(16)}, 0x${expResult.y.toString(16)}, 1)`);
    return {
        gas: data.gas,
        memory: data.memory,
        passed: (result.x.eq(expResult.x) && result.y.eq(expResult.y)),
        points,
        scalars,
    };
}

async function testN(n, numIterations) {
    let totalGas = 0;
    let allPassed = true;
    for (let i = 0; i < numIterations; i += 1) {
        const results = await testMultiplyNPoints(n);
        totalGas += parseInt(results.gas, 10);
        allPassed = allPassed && results.passed;
        if (!results.passed) {
            console.log(`Failed for points ${results.points.toString()} and scalars ${results.scalars.toString}`);
        }
    }
    if (allPassed) {
        console.log(`All ${numIterations} tests passed for ${n} points.`);
    } else {
        console.log(`Some of ${numIterations} tests failed for ${n} points.`);
    }
    console.log(`Average gas cost was ${totalGas / numIterations}, or ${totalGas / numIterations / n} per point.`);
}

async function runMainLoop(numIterations) {
    await testN(1, numIterations);
    await testN(2, numIterations);
    await testN(3, numIterations);
    await testN(4, numIterations);
    await testN(5, numIterations);
    await testN(6, numIterations);
    await testN(7, numIterations);
    await testN(8, numIterations);
    await testN(9, numIterations);
    await testN(10, numIterations);
    await testN(11, numIterations);
    await testN(12, numIterations);
    await testN(13, numIterations);
    await testN(14, numIterations);
    await testN(15, numIterations);
}

runMainLoop(10).then(() => console.log('...fin'));
