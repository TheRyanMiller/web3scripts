const cron = require('node-cron');
const moment = require('moment');
const check_vault_withdrawable = require('./check_vault_withdrawable.js');
const susd_buffer = require('./susd_buffer.js');
const axios = require('axios');
const commaNumber = require('comma-number');
require('dotenv').config();


let token = process.env.TELEGRAM_BOT_KEY;
let chatId = process.env.TELEGRAM_DEV_MONITORING_CHAT_ID;
chatId = process.env.TELEGRAM_SUSD_CHAT_ID;

let balance = 0;

let recurring_job = cron.schedule("* * * * *", () => {
    console.log("---"+new Date()+"---");
    susd_buffer().then(bal=>{
        if(bal != balance){
            diff = bal - balance;
            balance = bal;
            message = "yvSUSD balance: $"+commaNumber((balance).toFixed(2))+"\n\n";
            message += "Change: $"+commaNumber(diff.toFixed(2))+"\n\n";
            message += "https://etherscan.io/address/0xa5cA62D95D24A4a350983D5B8ac4EB8638887396";
            console.log(message)
            let url = `https://api.telegram.org/${token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=True`
            axios.post(url).then(r=>{
                console.log("message sent");
                console.log(balance)
                console.log("---")
            }).catch(err => console.log(err))
        };
    });
})