const path = require('path');

const { Runtime, getNewVM } = require('../huff/src/runtime.js');
const BabyJubJub = require('./js_snippets/bjj_reference.js');

const vm = getNewVM();

const pathToTestData = path.posix.resolve(__dirname, './huff_modules');

const main = new Runtime('main_loop.huff', pathToTestData);

async function runMainLoop(numPoints, numIterations) {
    const iterations = [...new Array(numIterations)].map(() => {
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
        return main(vm, 'OLIVER__MAIN', [], [], calldata);
    });
    const results = await Promise.all(iterations);
    const cumulativeGas = results.reduce((acc, { gas }) => {
        return Number(acc) + Number(gas);
    }, 0);
    return Math.round(cumulativeGas / numIterations);
}

async function benchmark(i) {
    let gas;
    console.log(`Running scalar multi-exponentiation benchmarks over ${i} iterations`);

    gas = await runMainLoop(1, i);
    console.log(`average gas cost for 1 point:   ${gas} gas`);

    gas = await runMainLoop(2, i);
    console.log(`average gas cost for 2 points:  ${gas} gas`);

    gas = await runMainLoop(3, i);
    console.log(`average gas cost for 3 points:  ${gas} gas`);

    gas = await runMainLoop(4, i);
    console.log(`average gas cost for 4 points:  ${gas} gas`);

    gas = await runMainLoop(5, i);
    console.log(`average gas cost for 5 points:  ${gas} gas`);

    gas = await runMainLoop(6, i);
    console.log(`average gas cost for 6 points:  ${gas} gas`);

    gas = await runMainLoop(7, i);
    console.log(`average gas cost for 7 points:  ${gas} gas`);

    gas = await runMainLoop(8, i);
    console.log(`average gas cost for 8 points:  ${gas} gas`);

    gas = await runMainLoop(9, i);
    console.log(`average gas cost for 9 points:  ${gas} gas`);

    gas = await runMainLoop(10, i);
    console.log(`average gas cost for 10 points: ${gas} gas`);

    gas = await runMainLoop(11, i);
    console.log(`average gas cost for 11 points: ${gas} gas`);

    gas = await runMainLoop(12, i);
    console.log(`average gas cost for 12 points: ${gas} gas`);

    gas = await runMainLoop(13, i);
    console.log(`average gas cost for 13 points: ${gas} gas`);

    gas = await runMainLoop(14, i);
    console.log(`average gas cost for 14 points: ${gas} gas`);

    gas = await runMainLoop(15, i);
    console.log(`average gas cost for 15 points: ${gas} gas`);
}

benchmark(10).then(() => console.log('...fin'));
