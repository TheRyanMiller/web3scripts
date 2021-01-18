
const check_vault_withdrawable = require('./check_vault_withdrawable.js');
const check_vault_balances = require('./get_vault_balances.js');
const get_vault_balance_by_address = require('./get_vault_balance_by_address.js');
require('dotenv').config();
//check_vault_withdrawable("crvSBTC");
//check_vault_balances("crvGUSD");
get_vault_balance_by_address("crvGUSD",process.env.MY_ADDRESS).then(r => {
    delete r.vault;
    console.log(r)
});