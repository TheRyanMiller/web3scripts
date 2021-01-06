const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GETH_NODE));

const crvStrategyKeep3rAddress = "0xd0aC37E3524F295D141d3839d5ed5F26A40b589D";

const vaultData = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/vault_data/vault.data.json')));
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvStrategyKeep3r.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));

let contract = new web3.eth.Contract(abi, crvStrategyKeep3rAddress);
let harvestableCrvVaults = [];
let vault = {};
let deployBlock = 11191799;

contract.getPastEvents("StrategyAdded",{fromBlock: deployBlock, toBlock: 'latest'}).then((events,error)=>{
    let calculateHarvestPromises = [];
    let requriedHarvestPromises = [];
    events.forEach(e=>{
        vault.strategyAddress = e.returnValues['0'];
        vault.requiredHarvest = e.returnValues['1'];
        vaultData.forEach(v => {
            if(v.strategyAddress === vault.strategyAddress){
                vault.vaultAlias = v.vaultAlias;
                vault.vaultAddress = v.address;
            }
        });
        harvestableCrvVaults.push(vault);
        calculateHarvestPromises.push(contract.methods.calculateHarvest(vault.strategyAddress).call());
        requriedHarvestPromises.push(contract.methods.requiredHarvest(vault.strategyAddress).call());
        vault = {};
    })

    Promise.all(calculateHarvestPromises).then(values=>{
        for(let i=0;i<values.length;i++){
            harvestableCrvVaults[i].currentHarvestableCrv = values[i] / 1e18;
        }
        Promise.all(requriedHarvestPromises).then(values=>{
            for(let i=0;i<values.length;i++){
                harvestableCrvVaults[i].requiredHarvest = values[i]  / 1e18;
                harvestableCrvVaults[i].remainingUntilHarvest = 
                    harvestableCrvVaults[i].requiredHarvest - harvestableCrvVaults[i].currentHarvestableCrv > 0 ?
                    harvestableCrvVaults[i].requiredHarvest - harvestableCrvVaults[i].currentHarvestableCrv : 0;
                harvestableCrvVaults[i].workable = harvestableCrvVaults[i].remainingUntilHarvest === 0 && harvestableCrvVaults[i].requiredHarvest > 0;
            }
            console.log(harvestableCrvVaults);
        })
    })
})


