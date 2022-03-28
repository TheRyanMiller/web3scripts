
const getWeb3 = require('./web3.js');
require('dotenv').config();
const web3 = getWeb3();
const fs = require('fs');
const email_alert = require('./utilities/email_alert');
const cron = require('node-cron');

let abiFilePath = "/apps/web3scripts/contract_abis/ankrethpool.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));

let ankrEthPoolAddress = "0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2";
let rethPoolAddress = "0xF9440930043eb3997fc70e1339dBb11F341de7A8";
let ankrPool = new web3.eth.Contract(abi, ankrEthPoolAddress);
let rethPool = new web3.eth.Contract(abi, rethPoolAddress);
let shouldSendAnkr = true;
let shouldSendrEth = true;

console.log(new Date());

let ankrCeiling = 1.20;
let ankrFloor = 1.01;
let rethCeiling = 1.20;
let rethFloor = 1.01;

let recurring_job = cron.schedule("* * * * *", () => {
    ankrPool.methods.get_dy(0,1,1e18.toString()).call().then(res=>{
        val = res/1e18
        console.log("aETHc",val);
        if(val < ankrFloor){
            if(shouldSendAnkr){
                msg = "1 ETH will now get you this much aETHc: " + val;
                email_alert(msg);
                shouldSendAnkr = false;
            }
        }
        else if(val > ankrCeiling){
            if(shouldSendAnkr){
                msg = "1 ETH will now get you this much aETHc: " + val;
                email_alert(msg);
                shouldSendAnkr = false;
            }
        }
        else{
            shouldSendAnkr = true;
        }
    })
    rethPool.methods.get_dy(0,1,1e18.toString()).call().then(res=>{
        console.log("rETH",res/1e18);
        if(val < rethFloor){
            if(shouldSendrEth){
                msg = "1 ETH will now get you this much rETH: " + val;
                email_alert(msg);
                shouldSendrEth = false;
            }
        }
        else if(val > rethCeiling){
            if(shouldSendrEth){
                msg = "1 ETH will now get you this much rETH: " + val;
                email_alert(msg);
                shouldSendrEth = false;
            }
        }
        else{
            shouldSendrEth = true;
        }
    });
})