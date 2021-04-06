import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
} from 'ethereum-multicall';
import Web3 from 'web3';

const web3 = new Web3('http://192.168.1.102:8545');
const fs = require('fs');

let abiFilePath = "contract_abis/usdcv030.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));

const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });

const contractCallContext: ContractCallContext[] = [
    {
        reference: 'testContract',
        contractAddress: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
        abi: abi,
        // abi: [ { name: 'foo', type: 'function', inputs: [ { name: 'example', type: 'uint256' } ], outputs: [ { name: 'amounts', type: 'uint256' }] } ],
        calls: [
            { reference: 'assets', methodName: 'totalAssets', methodParameters: [] },
            { reference: 'queue1', methodName: 'withdrawalQueue', methodParameters: [0] },
            { reference: 'queue2', methodName: 'withdrawalQueue', methodParameters: [1] },
            { reference: 'queue3', methodName: 'withdrawalQueue', methodParameters: [2] },
            { reference: 'queue3', methodName: 'withdrawalQueue', methodParameters: [3] },
            { reference: 'queue3', methodName: 'withdrawalQueue', methodParameters: [4] },
            { reference: 'queue3', methodName: 'withdrawalQueue', methodParameters: [5] },
            { reference: 'queue3', methodName: 'withdrawalQueue', methodParameters: [6] },
        ]
    }
];

const test = async () => {
    const results: ContractCallResults = await multicall.call(contractCallContext);
    console.log(results);
    let resultsArray = results.results.testContract.callsReturnContext;
    for(let i=0; i < resultsArray.length; i++){
        console.log(resultsArray[i].returnValues);
    }
};

test()
console.log()