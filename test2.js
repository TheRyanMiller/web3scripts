
const getWeb3 = require('./web3.js');
require('dotenv').config();
const web3 = getWeb3();
const fs = require('fs');
const vault_balance_by_address = require('./get_vault_balance_by_address.js');
const get_vault_balances = require('./get_vault_balances.js');
const axios = require('axios');

const ACCOUNT_ADDRESS = process.env.ETH_ADDRESS;
const url = "https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd,eth"


let contractAddress = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325";

let abiFilePath = "contract_abis/crvVault.json";
let abi = JSON.parse(fs.readFileSync(abiFilePath));
let contract = new web3.eth.Contract(abi, contractAddress);
//gusd

contract.methods.token().call().then(a=>console.log(a))