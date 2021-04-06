require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');
const axios = require('axios');
const commaNumber = require('comma-number')

const abiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/curveRegistry.json');

//let registryAddr = "0x0000000022D53366457F9d5E68Ec105046FC4383";
let registryAddr = "0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5";
let abi = JSON.parse(fs.readFileSync(abiPath));

let curveRegistry = new web3.eth.Contract(abi, registryAddr);
curveRegistry.methods.pool_count().call().then(res=>{
    console.log(res);
    curveRegistry.methods.pool_list(2).call().then(res=>{
        console.log(res);
    });
});
