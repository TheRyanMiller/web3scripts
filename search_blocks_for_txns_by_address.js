const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const abiDecoder = require('abi-decoder');

const numBlocksToSearch = 10000; // Number of blocks to be searched. Starts this many blocks behind current chain head.

//Prep Strat ABI
const filepath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/strategycurvebtcvoterproxy.json');
let abi = JSON.parse(fs.readFileSync(filepath));
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

/*
  Define some addresses/txns that we may want to use
*/
let vaultAddress = "0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6";
let stratAddress = "0x6D6c1AD13A5000148Aa087E7CbFb53D402c81341";
let myAccount = process.env.MY_ADDRESS;
let contract = new web3.eth.Contract(abi, stratAddress);
let sampleTransaction = "0x9116c59f2ba15ebabe9f73cf6e4304dbbc6d7d3769404ed5efbf3b0579b559c2";

/*
  Check all blocks for transactions matching the address passed in
  Search will check blocks within the numBlocksToSearch range by default
  Alternatively pass in a 2nd and 3rd parameter to define block ranges to search
*/
getTransactionsByAccount(myAccount);

const getTransactionData = (transactionHash, time) => {
    web3.eth.getTransaction(transactionHash, function(err, tx){
        abiDecoder.addABI(abi);
        let tx_data = tx.input;
        console.log("----")
        let decoded_data = abiDecoder.decodeMethod(tx_data);
        if(decoded_data && tx_data){
            console.log(">> Method:",decoded_data.name);
            console.log(time)
            console.log("tx hash:",tx.hash)
            let params = decoded_data.params;
            let param_values = [];
            for(i in params){  // loop to print parameters without unnecessary info
                param_values.push(params[i].name + " : " + params[i].value);
            }
            console.log("param_values",param_values);
        }
    });
}

async function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
    if (endBlockNumber == null) {
      endBlockNumber = await web3.eth.getBlockNumber();
      console.log(endBlockNumber)
      //endBlockNumber = web3.eth.getBlockNumber().then(console.log);
      console.log("Using endBlockNumber: " + endBlockNumber);
    }
    if (startBlockNumber == null) {
      startBlockNumber = endBlockNumber - numBlocksToSearch;
      console.log("Using startBlockNumber: " + startBlockNumber);
    }
    console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);
  
    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
      var block = await web3.eth.getBlock(i, true);
      if (block != null && block.transactions != null) {
        block.transactions.forEach( function(e) {
          if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
            let time = new Date(block.timestamp * 1000).toGMTString();
            getTransactionData(e.hash,time)
            // console.log("  tx hash          : " + e.hash + "\n"
            //   + "   nonce           : " + e.nonce + "\n"
            //   + "   blockHash       : " + e.blockHash + "\n"
            //   + "   blockNumber     : " + e.blockNumber + "\n"
            //   + "   transactionIndex: " + e.transactionIndex + "\n"
            //   + "   from            : " + e.from + "\n" 
            //   + "   to              : " + e.to + "\n"
            //   + "   value           : " + e.value + "\n"
            //   + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            //   + "   gasPrice        : " + e.gasPrice + "\n"
            //   + "   gas             : " + e.gas + "\n"
            //   + "   input           : " + e.input);
            //     let tx_data = e.input;
            //     if(e.input.length>5){
            //         let input_data = '0x' + tx_data.slice(10);  // get only data without function selector
            //         let params = web3.eth.abi.decodeParameters(['bytes32', 'string', 'string', 'string'], input_data);
            //         console.log(params);
            //     }
            //     console.log("----")
          }
        })
      }
    }
  }