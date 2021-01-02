const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');

let abiFilePath = "contract_abis/eth2_deposit_contract.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

let contractAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
var depositContract = new web3.eth.Contract(abi, contractAddress);

let deployBlock = 11052984;
let recentBlock = 11283161;

let count = 0;

depositContract.getPastEvents("DepositEvent",{fromBlock: deployBlock, toBlock: recentBlock})//toBlock: 'latest'})
.then((events,error)=>{
    console.log(events[50].returnValues['amount']); // Total number of deposit transactions
    events.forEach(e=>{
        if(e.returnValues['amount']!="0x0040597307000000"){
            count++;
            console.log(count+".---------");
            console.log("Amount: "+e.returnValues['amount']);
            console.log("PubKey: "+e.returnValues['pubkey']);
            console.log("Withdrawal: "+e.returnValues['withdrawal_credentials']);
            console.log("Amount: "+web3.utils.hexToAscii('0x0040597307000000'));
        }
    })
    console.log("COUNT: ",count);
})
