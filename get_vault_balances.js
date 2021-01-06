const Web3 = require('web3');
require('dotenv').config();
const vaultData = require('./vault_data_collector.js');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

module.exports = (vaultAlias) => new Promise ((resolve,reject) => {
    vaultData(vaultAlias).then(vault => {
        let result = {};
        result.vault = vault;
        let contract = new web3.eth.Contract(vault.abi, vault.address);
        //Gets vault holdings. Different than "strategy holdings"
        contract.methods.totalSupply().call().then(res=>{
            resolve(res/1e18);
        })
    }).catch(err => console.log(err))
})