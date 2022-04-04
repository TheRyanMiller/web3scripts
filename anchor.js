const getWeb3 = require('./web3.js');
require('dotenv').config();
const web3 = getWeb3();
const fs = require('fs');
const axios = require('axios');
const email_alert = require('./utilities/email_alert');
const cron = require('node-cron');

let prod = process.env.PROD == "true" ? true : false;
let botKey = process.env.WAVEY_ALERTS_BOT_KEY;
let abiFilePath = "./contract_abis/erc20.json";
let oracleAbiPath = "./contract_abis/oracle.json";
if(prod){
    abiFilePath = "/apps/web3scripts/contract_abis/erc20.json";
    oracleAbiPath = "/apps/web3scripts/contract_abis/oracle.json";
}

let abi = JSON.parse(fs.readFileSync(abiFilePath));

let markets = {
    "WBTC": {
        "token": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        "market": "0x17786f3813E6bA35343211bd8Fe18EC4de14F28b",
        "last_alert": 0,
        "usd_threshold": 1500,
        "new_balance": 0,
        "last_balance": 0,
        "balance_diff": 0,
        "usd_diff": 0,
        "last_usd_value": 0,
    },
    "ETH": {
        "token": "",
        "market": "0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8",
        "last_alert": 0,
        "usd_threshold": 1500,
        "last_balance": 0,
        "balance_diff": 0,
        "usd_diff": 0,
        "last_usd_value": 0,
    },
    "YFI": {
        "token": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
        "market": "0xde2af899040536884e062D3a334F2dD36F34b4a4",
        "last_alert": 0,
        "usd_threshold": 1500,
        "last_balance": 0,
        "balance_diff": 0,
        "usd_diff": 0,
        "last_usd_value": 0,
    }
}

let shouldAlert = true;

let recurring_job = cron.schedule("* * * * *", () => {
    console.log(new Date());
    getMarketBalances(markets);
})

async function getMarketBalances(myaccount, startBlockNumber, endBlockNumber) {
    let oracle = "0x83d95e0D5f402511dB06817Aff3f9eA88224B030";
    let oracleAbi = JSON.parse(fs.readFileSync(oracleAbiPath));
    oracle = new web3.eth.Contract(oracleAbi, oracle);

    for (const [key, value] of Object.entries(markets)) {
        token = value["token"];
        market = value["market"];
        lastAlert = value["last_alert"];
        usdThreshold = value["usd_threshold"];
        lastBalance = value["last_balance"];
        newUsdValue = 0;
        if(token == ""){
            balance = await web3.eth.getBalance(market);
            balance = balance / 10**18;
            // balance = randomIntFromInterval(1, 6);
            weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
            price = await oracle.methods.getPriceUsdcRecommended(weth).call() / 10**6
            newUsdValue = price * balance;
            prevUsdValue = price * lastBalance;
        }
        else{
            erc20 = new web3.eth.Contract(abi, token);
            balance = await erc20.methods.balanceOf(market).call();
            decimals = await erc20.methods.decimals().call();
            balance = balance / 10**decimals;
            // balance = randomIntFromInterval(1, 6);
            price = await oracle.methods.getPriceUsdcRecommended(token).call() / 10**6
            newUsdValue = price * balance;
            prevUsdValue = price * lastBalance;
        }
        console.log(key, balance, newUsdValue);
        
        if(Math.abs(newUsdValue - prevUsdValue) > usdThreshold){
            shouldAlert = true;
            markets[key]["last_alert"] = parseInt(Date.now()/1000);
        }
        // Set new vals
        usdDiff = newUsdValue - prevUsdValue;
        balDiff = balance - lastBalance;
        markets[key]["usd_diff"] = usdDiff;
        markets[key]["balance_diff"] = balDiff;
        markets[key]["last_balance"] = balance;
        markets[key]["last_usd_value"] = newUsdValue;
    }
    if(shouldAlert){
        sendAlert(markets);
    }
    else{
        console.log("No alert needed.")
    }
    shouldAlert = false;
}

function sendAlert(markets){
    let message = JSON.parse(JSON.stringify(markets));
    message = "";
    for (const [key, value] of Object.entries(markets)) {
        usdDiff = value["usd_diff"];
        console.log("usdDiff",usdDiff)
        if(Math.abs(usdDiff) > value["usd_threshold"]){
            emoji = "📉 "
            if(usdDiff > 0){
                emoji = "📈 "
            }
            message += emoji + key + " change --> $" + formatDollar(usdDiff) + "\n";
        }
        val = value["last_usd_value"];
        bal = value["last_balance"];
        if(val < .1){
            bal = 0;
            val = 0;
        }
        message += key + " balance: " + bal + "\n"
        message += key + " usd value: $" + formatDollar(val) + "\n\n------\n\n"
    }
    console.log(message)
    message = "```\n"+encodeURI(message)+"\n```"
    let chatId = "-617759416";
    let url = `https://api.telegram.org/bot${botKey}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=markdown&disable_web_page_preview=True`
    axios.post(url).then(r=>{
        console.log("message sent");
        console.log(balance)
        console.log("---")
    }).catch(err => console.log(err))
}

function formatDollar(num) {
    var p = num.toFixed(2).split(".");
    var chars = p[0].split("").reverse();
    var newstr = '';
    var count = 0;
    for (x in chars) {
        count++;
        if(count%3 == 1 && count != 1) {
            newstr = chars[x] + ',' + newstr;
        } else {
            newstr = chars[x] + newstr;
        }
    }
    return newstr + "." + p[1];
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}