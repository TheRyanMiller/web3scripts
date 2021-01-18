require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');

const crvGUSDVault = "0xcC7E70A958917cCe67B4B87a8C30E6297451aE98";
const keep3r = "0x054A87DdFdE3ccb5DDB03739375329BcC1b03203";
const crvGUSDStrat = "0xD42eC70A590C6bc11e9995314fdbA45B4f74FABb";

//const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDvault.json');
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/vaultKeep3r.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));
let contract = new web3.eth.Contract(abi, keep3r);
abiDecoder.addABI(abi);

let deployBlock = 11397633;
// contract.methods.workable(crvGUSDStrat).call().then(r=>{
//     console.log(r)
// }).catch(err=>console.log(err))

// contract.methods.workable(crvGUSDStrat).call().then(r=>{
//     console.log(r)
// }).catch(err=>console.log(err))

contract.getPastEvents({},{fromBlock: deployBlock, toBlock: 'latest'}).then((events,error)=>{
    events.forEach(e=>{
        
        web3.eth.getTransaction(e.transactionHash).then(tx=>{
            console.log("-----------------")
            console.log(tx)
            console.log(new Date(tx.block.timestamp * 1000).toGMTString());
            console.log("txHash:",e.transactionHash)
            //console.log("input:",tx.input)
            let decoded_data = abiDecoder.decodeMethod(tx.input);
            if(!decoded_data) console.log({ name: "Zap", params : []});
            console.log(decoded_data)
            if(decoded_data && tx.input){
                let params = decoded_data.params;
                let param_values = [];
                for(i in params){  // loop to print parameters without unnecessary info
                    param_values.push(params[i].name + " : " + params[i].value);
                }
            console.log("param_values",param_values);
            }
        })
        //console.log(e.returnValues['0'])
    })
})

function sortByProperty(property){  
    return function(a,b){  
       if(a[property] > b[property])  
          return 1;  
       else if(a[property] < b[property])  
          return -1;  
       return 0;  
    }  
 }

