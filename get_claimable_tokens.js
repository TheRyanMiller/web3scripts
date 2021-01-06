const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const vault_balance_by_address = require('./get_vault_balance_by_address.js');
const get_vault_balances = require('./get_vault_balances.js');
const axios = require('axios');

const ACCOUNT_ADDRESS = process.env.ETH_ADDRESS;
const url = "https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd,eth"



let abiFilePath = "contract_abis/gusd_gauge.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

//gusd
let strategyAddress = "0xD42eC70A590C6bc11e9995314fdbA45B4f74FABb";
let vaultAddress = "";
let gusdGauge = "0xc5cfada84e902ad92dd40194f0883ad49639b023";
let claimAddress = "0xf147b8125d2ef93fb6965db97d6746952a133934";

let deployBlock = 11052984;
let recentBlock = 11283161;

let count = 0;
let contract = new web3.eth.Contract(abi, gusdGauge);
let vaultBalance = 0;
let myBalance = 0;
let myShare = 0;
let harvestablecrv = 0;
let crvPrice = 0;
let govFee = 0;

console.log(new Date());
contract.methods.claimable_tokens(claimAddress).call().then(res=>{
    harvestablecrv = web3.utils.fromWei(res,'ether');
    vault_balance_by_address("crvGUSD",process.env.MY_ADDRESS).then(r => {
        myBalance = r.lpBalance;
        get_vault_balances("crvGUSD").then(r => {
            vaultBalance = r;
            myShare = myBalance / (vaultBalance);
            govFee = harvestablecrv * .10;
            console.log("Total harvestable crv:",harvestablecrv)
            console.log("Governance fee in crv:",govFee)
            console.log("My share of vault: ", (myShare*100).toFixed(2)+"%");
            console.log("My harvestable crv: ",myShare * (harvestablecrv-govFee));
            axios.get(url).then((response, error) => {    
                if(error) throw error;
                crvPrice = response.data['curve-dao-token'].usd;
                console.log("crv price in USD: $",crvPrice)
                console.log("Projected USD earnings on next harvest: $",(myShare * (harvestablecrv-govFee) * crvPrice).toFixed(2));
            })

        });
    })
    
})