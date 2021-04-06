
const getWeb3 = require('./web3.js');
require('dotenv').config();
const web3 = getWeb3();
const fs = require('fs');
const email_alert = require('./utilities/email_alert');
const cron = require('node-cron');

let abiFilePath = "contract_abis/ankrethpool.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));

let ankrEthPoolAddress = "0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2";
let rethPoolAddress = "0xF9440930043eb3997fc70e1339dBb11F341de7A8";
let ankrPool = new web3.eth.Contract(abi, ankrEthPoolAddress);
let rethPool = new web3.eth.Contract(abi, rethPoolAddress);
let shouldSendAnkr = true;
let shouldSendrEth = true;

console.log(new Date());
let recurring_job = cron.schedule("* * * * *", () => {
    ankrPool.methods.get_dy(0,1,1e18.toString()).call().then(res=>{
        val = res/1e18
        console.log("aETHc",val);
        if(val < 1.01){
            if(shouldSendAnkr){
                msg = "aETHc price = " + val;
                email_alert(msg);
                shouldSendAnkr = false;
            }
        }
        else if(val > 1.20){
            if(shouldSendAnkr){
                msg = "aETHc price = " + val;
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
        if(val < 1.01){
            if(shouldSendrEth){
                msg = "rETH price = " + val;
                email_alert(msg);
                shouldSendrEth = false;
            }
        }
        else if(val > 1.20){
            if(shouldSendrEth){
                msg = "rETH price = " + val;
                email_alert(msg);
                shouldSendrEth = false;
            }
        }
        else{
            shouldSendrEth = true;
        }
    });
})