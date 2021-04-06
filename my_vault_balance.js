require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');
const axios = require('axios');
const commaNumber = require('comma-number')

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
const obtcVault = "0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797";
const obtcGauge = "0x11137B10C210b579405c21A07489e28F3c040AB1";
const usdpVault = "0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75";
const usdpGauge = "0x055be5DDB7A925BfEF3417FC157f53CA77cA7222";
const usdp2Vault = "0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417";
const usdp2Gauge = "0x055be5DDB7A925BfEF3417FC157f53CA77cA7222";
const hbtcVault = "0x625b7DF2fa8aBe21B0A976736CDa4775523aeD1E";
const hbtcGauge = "0x4c18E409Dc8619bFb6a1cB56D114C3f592E0aE79";
const musdStrat = "0x6f1EbF5BBc5e32fffB6B3d237C3564C15134B8cF";
const musdGauge = "0x6f1EbF5BBc5e32fffB6B3d237C3564C15134B8cF";
const musdVault = "0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7";
const triVault = "0x3d980e50508cfd41a13837a60149927a11c03731";
const triGauge = "0x6955a55416a06839309018a8b0cb72c4ddc11f15";

let gauge = sethGauge;
let vault = sethVault;
let isv2 = true;

const args = process.argv.slice(2);
let gaugeName = args[0];
if(gaugeName == "tri"){
    gauge = triGauge;
    vault = triVault;
    isv2 = true;
}
if(gaugeName == "usdn"){
    gauge = usdnGauge;
    vault = usdnVault;
    isv2 = false;
}
if(gaugeName == "obtc"){
    gauge = obtcGauge;
    vault = obtcVault;
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
if(gaugeName == "usdp"){
    gauge = usdp2Gauge;
    vault = usdp2Vault;
    isv2 = true;
}
if(gaugeName == "usdp1"){
    gauge = usdpGauge;
    vault = usdpVault;
    isv2 = false;
}
if(gaugeName == "usdn"){
    gauge = usdnGauge;
    vault = usdnVault;
    isv2 = false;
}
if(gaugeName == "hbtc"){
    gauge = hbtcGauge;
    vault = hbtcVault;
    isv2 = true;
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
let strat = "0x91cBf0014a966615e1050c90A1aBf1d1d5d8cffd";
axios.get(url).then((response, error) => {
    crvPrice = response.data['curve-dao-token'].usd;
    gaugeContract.methods.claimable_tokens(voter).call().then(result=>{
        console.log("\nTimestamp: "+new Date())
        let crvAmt = result / 1e18;
        console.log("\n--- Strategy ---")
        console.log(commaNumber(crvAmt.toFixed(2)) + " Harvestable CRV balance");
        console.log("Current harvestable Value (USD): $"+commaNumber((crvPrice*crvAmt).toFixed(2)))
        if(isv2){
            vaultContract.methods.pricePerShare().call().then(ppfs=>{
                if(!!strat){
                    vaultContract.methods.strategies(strat).call().then(res=>{
                        timeDifference(res['5'])
                        
                    })
                }
                vaultContract.methods.balanceOf(process.env.MY_ADDRESS).call().then(mybalance=>{
                    if(mybalance > 0){
                        console.log("pricePerShare:",ppfs/1e18)
                        console.log("\n--- My Holdings ---")
                        console.log('\x1b[36m%s\x1b[0m',"My Balance:", commaNumber((ppfs/1e18)*(mybalance/1e18)))
                        if(gaugeName == "seth") console.log('\x1b[36m%s\x1b[0m',"My Earnings:", (ppfs/1e18)*(mybalance/1e18) - (43893334701427720181/1e18))
                    }
                })
            })
        }
        if(!isv2){
            vaultContract.methods.getPricePerFullShare().call().then(ppfs=>{
                vaultContract.methods.balanceOf(process.env.MY_ADDRESS).call().then(mybalance=>{
                    if(mybalance > 0){
                        console.log("\n--- My Holdings ---")
                        console.log('\x1b[36m%s\x1b[0m',"My Balance:", mybalance/1e18*ppfs/1e18)
                        if(gaugeName == "bbtc") console.log('\x1b[36m%s\x1b[0m',"My Earnings:", (ppfs/1e18)*(mybalance/1e18) - (4096439165277762450/1e18) + 0.99)
                        if(gaugeName == "usdp") console.log('\x1b[36m%s\x1b[0m',"My Earnings:", (ppfs/1e18)*(mybalance/1e18) - (22863141355369100000000/1e18))
                        if(gaugeName == "usdn") console.log('\x1b[36m%s\x1b[0m',"My Earnings:", (ppfs/1e18)*(mybalance/1e18) - (21278051802994373007965*1060792785694076177/1e18/1e18))
                    }
                })
            })
        }
    })
})

function timeDifference(date2) {
    var date1 = Math.round((new Date()).getTime() / 1000);
    
    var difference = date1 - date2;

    var daysDifference = Math.floor(difference/60/60/24);
    difference -= daysDifference*60*60*24

    var hoursDifference = Math.floor(difference/60/60);
    difference -= hoursDifference*60*60

    var minutesDifference = Math.floor(difference/60);
    difference -= minutesDifference*60

    var secondsDifference = Math.floor(difference);

    console.log('difference = ' + 
      daysDifference + ' d ' + 
      hoursDifference + ' h ' + 
      minutesDifference + ' m ' + 
      secondsDifference + ' s ');
}