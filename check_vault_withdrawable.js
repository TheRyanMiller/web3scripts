const Web3 = require('web3');
require('dotenv').config();
const vaultData = require('./vault_data_collector.js');
const get_abi = require('./utilities/get_abi.js');
const get_single_vault_balance = require('./get_vault_balance_by_address.js');
const email_alert = require('./utilities/email_alert');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

module.exports = (vaultAlias) => {
    let myAddress = process.env.MY_ADDRESS;
    vaultData(vaultAlias).then(vault=>{
        get_abi(vault.tokenAddress).then(abi => {
            let contract = new web3.eth.Contract(abi, vault.tokenAddress);
            contract.methods.balanceOf(vault.address).call().then(res=>{
                get_single_vault_balance(vaultAlias, myAddress).then(r=>{
                    console.log('\x1b[36m%s\x1b[0m', "Vault:", vaultAlias);
                    console.log('\x1b[36m%s\x1b[0m', "Vault Balance:", res / 1e18);
                    console.log('\x1b[36m%s\x1b[0m', "My withdrawable balance:", r.lpBalance);
                    console.log('\x1b[36m%s\x1b[0m',"Is withdrawable?:", r.lpBalance < res / 1e18);
                    let amountNeeded = r.lpBalance - (res / 1e18) < 0 ? 0 : r.lpBalance - (res / 1e18);
                    let msg = "<p>Vault: "+vaultAlias+"</p>";
                    msg += "<p>My withdrawable balance:\n"+r.lpBalance+"</p>";
                    msg += "<p>Vault balance\n"+(res / 1e18)+"</p>";
                    msg += "<p>More deposits needed:\n"+amountNeeded+"</p>";
                    if(amountNeeded < 0) email_alert(msg)
                })
            })
        });
        
    }).catch(err => console.log(err))
}