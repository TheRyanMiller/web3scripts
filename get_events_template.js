require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');

const contractAddress = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325";

//const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDvault.json');
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/stethvault.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));
let contract = new web3.eth.Contract(abi, contractAddress);
abiDecoder.addABI(abi);

let deployBlock = 11654973;
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

