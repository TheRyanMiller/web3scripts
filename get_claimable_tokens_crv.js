require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');
const axios = require('axios');

const url = "https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd,eth"

let usdnGauge = "0xF98450B5602fa59CC66e1379DFfB6FDDc724CfC4";
const sethGauge = "0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238";
const gusdGauge = "0xC5cfaDA84E902aD92DD40194f0883ad49639b023";
const voter = "0xF147b8125d2ef93FB6965Db97D6746952a133934";
gauge = sethGauge;

const args = process.argv.slice(2);
let gaugeName = args[0];
if(gaugeName == "usdn") gauge = usdnGauge;
if(gaugeName == "seth") gauge = sethGauge;
if(gaugeName == "gusd") gauge = gusdGauge;

//const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDvault.json');
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvUSDNgauge.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));
let contract = new web3.eth.Contract(abi, gauge);
abiDecoder.addABI(abi);

axios.get(url).then((response, error) => {
    crvPrice = response.data['curve-dao-token'].usd;
    contract.methods.claimable_tokens(voter).call().then(result=>{
        console.log(new Date())
        let crvAmt = result / 1e18;
        console.log(crvAmt + " CRV balance");
        console.log('\x1b[36m%s\x1b[0m',"USD Value: $"+(crvPrice*crvAmt).toFixed(2))
    })
})