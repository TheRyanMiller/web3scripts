require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');
const axios = require('axios');

const url = "https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd,eth"

const usdnGauge = "0xF98450B5602fa59CC66e1379DFfB6FDDc724CfC4";
const usdnVault = "0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3";
const sethGauge = "0x3C0FFFF15EA30C35d7A85B85c0782D6c94e1d238";
const sethVault = "0x986b4AFF588a109c09B50A03f42E4110E29D353F";
const gusdGauge = "0xC5cfaDA84E902aD92DD40194f0883ad49639b023";
const gusdVault = "0xcC7E70A958917cCe67B4B87a8C30E6297451aE98";
const bbtcGauge = "0xdFc7AdFa664b08767b735dE28f9E84cd30492aeE";
const bbtcVault = "0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D";
const voter = "0xF147b8125d2ef93FB6965Db97D6746952a133934";
const a3crvGauge = "0xd662908ada2ea1916b3318327a97eb18ad588b5d";
const a3crvVault = "0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab";
let gauge = sethGauge;
let vault = sethVault;
let isv2 = true;

const args = process.argv.slice(2);
let gaugeName = args[0];
if(gaugeName == "usdn"){
    gauge = usdnGauge;
    vault = usdnVault;
    isv2 = false;
}
if(gaugeName == "seth"){
    gauge = sethGauge;
    vault = sethVault;
    isv2 = true;
}
if(gaugeName == "gusd"){
    gauge = gusdGauge;
    vault = gusdVault;
    isv2 = false;
}
if(gaugeName == "bbtc"){
    gauge = bbtcGauge;
    vault = bbtcVault;
    isv2 = false;
}
if(gaugeName == "a3crv"){
    gauge = a3crvGauge;
    vault = a3crvVault;
    isv2 = false;
}

//const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDvault.json');
const normalizedPathGauge = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvUSDNgauge.json');
let normalizedPathVault;
if(isv2){
    normalizedPathVault = path.normalize(path.dirname(require.main.filename)+'/contract_abis/stethvault.json');
}
else{
    normalizedPathVault = path.normalize(path.dirname(require.main.filename)+'/contract_abis/genericv1vault.json');
}

const gaugeAbi = JSON.parse(fs.readFileSync(normalizedPathGauge));
const vaultAbi = JSON.parse(fs.readFileSync(normalizedPathVault));
let gaugeContract = new web3.eth.Contract(gaugeAbi, gauge);
let vaultContract = new web3.eth.Contract(vaultAbi, vault);

axios.get(url).then((response, error) => {
    crvPrice = response.data['curve-dao-token'].usd;
    gaugeContract.methods.claimable_tokens(voter).call().then(result=>{
        console.log("\nTimestamp: "+new Date())
        let crvAmt = result / 1e18;
        console.log("\n--- Strategy ---")
        console.log(crvAmt + " Harvestable CRV balance");
        console.log("Current harvestable Value (USD): $"+(crvPrice*crvAmt).toFixed(2))
        if(isv2){
            vaultContract.methods.pricePerShare().call().then(ppfs=>{
                vaultContract.methods.balanceOf(process.env.MY_ADDRESS).call().then(mybalance=>{
                    console.log("pricePerShare:",ppfs/1e18)
                    console.log("\n--- My Holdings ---")
                    console.log('\x1b[36m%s\x1b[0m',"My Balance:", (ppfs/1e18)*(mybalance/1e18))
                })
            })
        }
        if(!isv2){
            vaultContract.methods.getPricePerFullShare().call().then(ppfs=>{
                vaultContract.methods.balanceOf(process.env.MY_ADDRESS).call().then(mybalance=>{
                    console.log("\n--- My Holdings ---")
                    console.log('\x1b[36m%s\x1b[0m',"My Balance:", (ppfs/1e18)*(mybalance/1e18))
                })
            })
        }
    })
})