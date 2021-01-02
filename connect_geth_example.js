const Web3 = require('web3');
require('dotenv').config();
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

web3.eth.getBlock("latest", (error, result) => {
    console.log('error:', error);
    console.log('results', result);
});