const Web3 = require('web3');
require('dotenv').config();
const vaultData = require('./vault_data_collector.js');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));
let vaultAlias = "crvSBTC";

module.exports = (vaultAlias, myAddress) => new Promise ((resolve,reject) => {
    vaultData(vaultAlias).then(vault => {
        let result = {};
        result.vault = vault;
        let contract = new web3.eth.Contract(vault.abi, vault.address);
        contract.methods.balanceOf(myAddress).call().then(res=>{
            let yBalance = res / 1e18;
            result.yBalance = yBalance;
            contract.methods.getPricePerFullShare().call().then(res=>{
                let lpBalance = res / 1e18 * yBalance;
                result.pps = res / 1e18;
                result.lpBalance = lpBalance;
                resolve(result);
            })
        })
    }).catch(err => console.log(err))
})