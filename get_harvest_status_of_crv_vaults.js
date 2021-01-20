require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();

const crvStrategyKeep3rAddress = "0xd0aC37E3524F295D141d3839d5ed5F26A40b589D";

const vaultData = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/vault_data/vault.data.json')));
const contractAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvStrategyKeep3r.json');
const normalizedPath = path.normalize(contractAbiPath); // Windows + Linux friendly
const abi = JSON.parse(fs.readFileSync(normalizedPath));

const stratAbiPath = path.normalize(path.dirname(require.main.filename)+'/contract_abis/crvGUSDstrategy.json');
const normalizedPath2 = path.normalize(stratAbiPath); // Windows + Linux friendly
const stratAbi = JSON.parse(fs.readFileSync(normalizedPath2));

let contract = new web3.eth.Contract(abi, crvStrategyKeep3rAddress);
let harvestableCrvVaults = [];
let vault = {};
let deployBlock = 11191799;

contract.getPastEvents("StrategyAdded",{fromBlock: deployBlock, toBlock: 'latest'}).then((events,error)=>{
    let calculateHarvestPromises = [];
    let requiredHarvestPromises = [];
    let withdrawFeePromises = [];
    events.forEach(e=>{
        vaultData.forEach(v => {
            if(v.strategyAddress === e.returnValues['0']){
                vault.vaultAlias = v.vaultAlias;
                vault.vaultAddress = v.address;
            }
        });
        vault.strategyAddress = e.returnValues['0'];
        vault.requiredHarvest = e.returnValues['1'];
        harvestableCrvVaults.push(vault);
        calculateHarvestPromises.push(contract.methods.calculateHarvest(vault.strategyAddress).call());
        requiredHarvestPromises.push(contract.methods.requiredHarvest(vault.strategyAddress).call());
        let strat = new web3.eth.Contract(stratAbi, vault.strategyAddress);
        withdrawFeePromises.push(strat.methods.withdrawalFee().call());
        vault = {};
    })

    Promise.all(calculateHarvestPromises).then(values=>{
        for(let i=0;i<values.length;i++){
            harvestableCrvVaults[i].currentHarvestableCrv = values[i] / 1e18;
        }
        Promise.all(requiredHarvestPromises).then(values=>{
            for(let i=0;i<values.length;i++){
                harvestableCrvVaults[i].requiredHarvest = values[i]  / 1e18;
                harvestableCrvVaults[i].remainingUntilHarvest = 
                    harvestableCrvVaults[i].requiredHarvest - harvestableCrvVaults[i].currentHarvestableCrv > 0 ?
                    harvestableCrvVaults[i].requiredHarvest - harvestableCrvVaults[i].currentHarvestableCrv : 0;
                harvestableCrvVaults[i].workable = harvestableCrvVaults[i].remainingUntilHarvest === 0 && harvestableCrvVaults[i].requiredHarvest > 0;
            }
            Promise.all(withdrawFeePromises).then(values=>{
                for(let i=0;i<values.length;i++){
                    harvestableCrvVaults[i].withdrawalFee = values[i];
                }
                harvestableCrvVaults.sort(sortByProperty("remainingUntilHarvest")) // Sort remaining until harvest towards the top
                console.log(harvestableCrvVaults);
                console.log((new Date()).toLocaleString("en-US", {timeZone: "America/New_York"}))
            })
        })
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


