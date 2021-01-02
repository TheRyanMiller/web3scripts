const axios = require('axios').default;
const web3 = require('web3');
const moment = require('moment');
const database = require('../database/dbSchemas');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


// Connection URL
const mongoUrl = 'mongodb://user:ryan@192.168.1.99:27017/deposit-contract';
// Database Name
const dbName = 'deposit-contract';
// Use connect method to connect to the server

let depositContractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
let startBlock = "0";
let endBlock = "99999999";
let url = "https://api.etherscan.io/api?module=account&action=balance&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&tag=latest&apikey=YourApiKeyToken";
url = "https://api.etherscan.io/api?module=account&action=txlist&address="+depositContractAddress+"&startblock=0&endblock="+endBlock+"&sort=asc&apikey=YourApiKeyToken";
url = "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock="+startBlock+"&toBlock=latest&address="+depositContractAddress+"&topic0=0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5&apikey=YourApiKeyToken"

MongoClient.connect(mongoUrl,{useUnifiedTopology: true}, (err, client)=>{
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection('txlogs');
  axios.get(url).then(resp => {
    let log;
    console.log(resp.data.result.length);
    for(let i=0;i<resp.data.result.length;i++){
        log=resp.data.result[i];
        //console.log(Number(web3.utils.fromWei(tx.value)).toFixed(2));
        //console.log(tx.value)
        if(i==50) console.log(log)
        //tx.value = Number(web3.utils.fromWei(tx.value)).toFixed(2);
        // if(Number(web3.utils.fromWei(tx.value))<32){
        //     //console.log(tx.from, Number(web3.utils.fromWei(tx.value)),moment(new Date(tx.timeStamp * 1000)).format("MM.DD"));
        // }
    }
    
    

    // 

    // collection.deleteMany({}).then(deleteResult=>{
    //     console.log("TXNS DELETED")
    //     collection.insertMany(resp.data.result).then((err, result)=>{
    //         console.log("INSTERTED ALL TXNS!!!\n");
    //     });
        
    // })
    
    
   });
});


