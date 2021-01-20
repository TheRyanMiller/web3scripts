require('dotenv').config();
const Maker = require('@makerdao/dai');
const { McdPlugin } = require('@makerdao/dai-plugin-mcd');
const mgr = maker.service('mcd:cdpManager');
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();

//let makerContract="0x81FE72B5A8d1A857d176C3E7d5Bd2679A9B85763"; // Mat
let makerContract = "0x74CB42EfE280B14A7F7BaA31d4146528686ff197"
web3.eth.getStorageAt(makerContract).then(res=>{
    price = res;
    console.log(res)
});

work()

async function work() {
    const vault = await mgr.getCdp(111);
    console.log(vault)
}

//console.log(web3.fromWei(web3.toInt(price.slice(16-price.length-1)), 'ether'))

