require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');

const gauge = "0xF98450B5602fa59CC66e1379DFfB6FDDc724CfC4";
const user = "0xF147b8125d2ef93FB6965Db97D6746952a133934";

//const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDvault.json');
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvUSDNgauge.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));
let contract = new web3.eth.Contract(abi, gauge);
abiDecoder.addABI(abi);
contract.methods.claimable_tokens(user).call().then(result=>{
    console.log(result / 1e18);
})