const cron = require('node-cron');
const moment = require('moment');
const check_vault_withdrawable = require('./check_vault_withdrawable.js');
require('dotenv').config();


let check_if_withdrawable = cron.schedule("* * * * *", () => {
    console.log("---"+new Date()+"---");
    //check_vault_withdrawable("crvGUSD");
    check_vault_withdrawable("crvBBTC");
})