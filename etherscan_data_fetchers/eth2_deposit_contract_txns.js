const axios = require('axios').default;
const web3 = require('web3');
const moment = require('moment');
const database = require('../dbSchemas');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


// Connection URL
const mongoUrl = 'mongodb://user:ryan@192.168.1.99:27017/deposit-contract';
// Database Name
const dbName = 'deposit-contract';
// Use connect method to connect to the server

let depositContractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
let startblock = "0";
let endBlock = "99999999";
let url = "https://api.etherscan.io/api?module=account&action=balance&address=0x00000000219ab540356cBB839Cbe05303d7705Fa&tag=latest&apikey="+process.env.ETHERSCAN_API_KEY;
url = "https://api.etherscan.io/api?module=account&action=txlist&address="+depositContractAddress+"&startblock=0&endblock="+endBlock+"&sort=asc&apikey="+process.env.ETHERSCAN_API_KEY;
url = "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock="+startBlock+"&toBlock=latest&address="+depositContractAddress+"&topic0=0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545&apikey="+process.env.ETHERSCAN_API_KEY;

MongoClient.connect(mongoUrl,{useUnifiedTopology: true}, (err, client)=>{
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const collection = db.collection('transactions');
  axios.get(url).then(resp => {
    let tx;
    for(let i=0;i<resp.data.result.length;i++){
        tx=resp.data.result[i];
        //console.log(Number(web3.utils.fromWei(tx.value)).toFixed(2));
        //console.log(tx.value)
        resp.data.result[i].value=Number(tx.value/1000000000000000000);
        
        //tx.value = Number(web3.utils.fromWei(tx.value)).toFixed(2);
        // if(Number(web3.utils.fromWei(tx.value))<32){
        //     //console.log(tx.from, Number(web3.utils.fromWei(tx.value)),moment(new Date(tx.timeStamp * 1000)).format("MM.DD"));
        // }
    }
    
    

    // 

    let uniqueAddresses = [{ $match:{isError:"0"}},{$group:{_id: "$from", total: { $sum: "$value"}}},{ $match: { total: {$gte: 32} } }];
    let total32Validators = 0;
    collection.deleteMany({}).then(deleteResult=>{
        console.log("TXNS DELETED")
        collection.insertMany(resp.data.result).then((err, result)=>{
            console.log("INSTERTED ALL TXNS!!!\n");
            collection.aggregate(uniqueAddresses).toArray().then(data=>{
                let total = 0;
                data.forEach(d=>
                    total+=(d.total - (d.total % 32))
                )
                console.log("Unique addrs: "+data.length);
                console.log("Total txns: "+resp.data.result.length);
                console.log("Total ETH:"+total);
                console.log("Total Validators:"+total/32);
            });
        });
        
    })
    
    
   });
});


