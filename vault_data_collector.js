require('dotenv').config();
const fs = require('fs');
const path = require('path');
const get_abi = require('./utilities/get_abi.js');

module.exports = (vaultAlias) => new Promise ((resolve,reject) => {
    if(!vaultAlias) reject("No vault passed in.");
    match = false;
    const vaultData = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/vault_data/vault.data.json')));
    vaultData.forEach(v => {
        if(v.vaultAlias.toLowerCase() === vaultAlias.toLowerCase()){
            match = true;
            get_abi(v.address).then(result=>{
                v.abi = result;
                setTimeout(resolve(v), 1000);
            }).catch(err=>reject("Etherscan call failed "+err))
        }
    });
    if(!match) reject("Invalid vault alias passed.");
})