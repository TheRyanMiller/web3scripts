const Web3 = require('web3');
require('dotenv').config();
const vaultData = require('./vault_data_collector.js');
const get_abi = require('./utilities/get_abi.js');
const get_single_vault_balance = require('./get_vault_balance_by_address.js');
const email_alert = require('./utilities/email_alert');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));
let vaultBalance = 0;
let increment = 1;

module.exports = (vaultAlias) => {
    let myAddress = process.env.MY_ADDRESS;
    vaultData(vaultAlias).then(vault=>{
        get_abi(vault.tokenAddress).then(abi => {
            let contract = new web3.eth.Contract(abi, vault.tokenAddress);
            contract.methods.balanceOf(vault.address).call().then(res=>{
                get_single_vault_balance(vaultAlias, myAddress).then(r=>{
                    vaultBalance = res / 1e18;
                    console.log('\x1b[36m%s\x1b[0m', "Vault:", vaultAlias);
                    console.log('\x1b[36m%s\x1b[0m', "Vault Balance:", vaultBalance);
                    console.log('\x1b[36m%s\x1b[0m', "My withdrawable balance:", r.lpBalance);
                    console.log('\x1b[36m%s\x1b[0m',"Is withdrawable?:", r.lpBalance < vaultBalance);
                    let amountNeeded = r.lpBalance - (vaultBalance) < 0 ? 0 : r.lpBalance - vaultBalance;
                    let msg = "<p>Vault: "+vaultAlias+"</p>";
                    msg += "<p>My withdrawable balance:\n"+r.lpBalance+"</p>";
                    msg += "<p>Vault balance\n"+(vaultBalance)+"</p>";
                    msg += "<p>More deposits needed:\n"+amountNeeded+"</p>";
                    msg += "<p><a href='https://etherscan.io/token/0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3?a=0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6'>Etherscan Link</a></p>";
                    if(vaultBalance > increment){
                        email_alert(msg);
                        increment++;
                    }
                })
            })
        });
        
    }).catch(err => console.log(err))
}