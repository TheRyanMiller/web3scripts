const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));
let contractBalance;

let data = {
    "vaultName": "Curve sBTC LP Vault",
    "vaultAddress": "0x7ff566e1d69deff32a7b244ae7276b9f90e9d0f6",
    "strategyAddres": "",
    "abiFileName": "yearnsbtcvault.json",
    "priceId": "lp-sbtc-curve"
};
contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contractAbis/'+data.abiFileName);

let correctedPath = path.normalize(contractAbiPath);
let parsedABI = JSON.parse(fs.readFileSync(correctedPath));
let contract = new web3.eth.Contract(parsedABI, data.vaultAddress);

contract.methods.totalSupply().call().then(totalSupply=>{
    let supply = totalSupply / 1e18;
    console.log("totalsupply",supply)
    contract.methods.getPricePerFullShare().call().then(pps=>{
        
        let pricePerFullShare = pps / 1e18;
        console.log("ppfs",pricePerFullShare)
        console.log("----->",pricePerFullShare*supply)
    })
})

