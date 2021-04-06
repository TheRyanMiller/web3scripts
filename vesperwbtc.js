require('dotenv').config();
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const abiDecoder = require('abi-decoder');
const axios = require('axios');
const commaNumber = require('comma-number')

const url = "https://api.coingecko.com/api/v3/simple/price?ids=vesper-finance,wrapped-bitcoin&vs_currencies=usd,eth"
const rewardsAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/vesperrewardswbtc.json')));
const stratAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/vesperstrats.json')));
const vwbtcAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/vesperwbtc.json')));
const v2vault = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/stethvault.json')));

yvWbtcVault = "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E";         // Yearn vault
strategyVesper = "0x416647Ddee169156878DC46CD565dee99413c262";      // Strategy
strategyVesper = "0x6598d4366D5A45De4Bf2D2468D877E0b6436Ae76";      // Strategy
rewardsWbtcAddr = "0x479A8666Ad530af3054209Db74F3C74eCd295f8D";     // Vesper Rewards
vesperController = "0xa4F1671d3Aee73C05b552d57f2d16d3cfcBd0217";    // Vesper controller
vWbtcAddr = "0x4B2e76EbBc9f2923d83F5FBDe695D8733db1a17B";           // Vesper Pool



//let registryAddr = "0x0000000022D53366457F9d5E68Ec105046FC4383";
let registryAddr = "0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5";

// check rewards
let rewards = new web3.eth.Contract(rewardsAbi, rewardsWbtcAddr);
let yVault = new web3.eth.Contract(v2vault, yvWbtcVault);
let strategy = new web3.eth.Contract(stratAbi, strategyVesper);


console.log("\nTimestamp: "+new Date())
axios.get(url).then((response, error) => {
    vspPrice = response.data['vesper-finance'].usd;
    btcPrice = response.data['wrapped-bitcoin'].usd;
    yVault.methods.strategies(strategyVesper).call().then(params=>{
        let debtRatio = params['debtRatio']
        let lastReport = params['5'];
        let totalDebt = params['6'];
        timeDifference(lastReport);
        
        strategy.methods.calcWantHeldInVesper().call().then(wantInVesper=>{
            wantInVesper = wantInVesper / 1e8;
            totalDebt = totalDebt / 1e8;
            console.log("TotalDebt:",totalDebt);
            console.log("Want in Vesper:",wantInVesper);
            strategy.methods.percentKeep().call().then(percentKeep=>{
                strategy.methods.lossProtectionBalance().call().then(lossProtection=>{
                    lossProtection = lossProtection / 1e8;
                    let unrealizedGains = wantInVesper + lossProtection - totalDebt;
                    strategy.methods.calculateProtectionNeeded().call().then(p=>{
                        totalProtectionNeeded = p/1e8;
                        yVault.methods.totalAssets().call().then(totalAssets=>{
                            targetRatio = debtRatio/100;
                            actualRatio = totalDebt*1e8/totalAssets*100;
                            
                            rewards.methods.claimable(strategyVesper).call().then(res=>{
                                console.log("harvestable vsp:",res/1e18);
                                console.log("VSP price: $",vspPrice);
                                let dollarValue = vspPrice * res/1e18;
                                console.log('\x1b[36m%s\x1b[0m',"Total value: $",commaNumber((dollarValue).toFixed(2)));
                                console.log('\x1b[36m%s\x1b[0m',"BTC value: ",commaNumber((dollarValue / btcPrice).toFixed(4))," BTC");
                                console.log("---")
                                
                                console.log("Target DebtRatio:",targetRatio);
                                console.log("Actual DebtRatio:",actualRatio);
                                console.log("Total protection needed:",totalProtectionNeeded);
                                console.log("Remaining protection needed:",(totalProtectionNeeded - (unrealizedGains)));
                                //console.log("Loss protection balance:",lossProtection/1e8);
                                console.log("Percent Keep:",percentKeep/100+"%");
                                console.log();
                                if(targetRatio > actualRatio){
                                    console.log(chalk.bold.underline.green('✅ OK TO HARVEST'));
                                }
                                else{
                                    console.log(chalk.bold.red('🚫 DO NOT HARVEST!'));
                                }
                            });
                        })
                    });
                });
            });
        });
    })
    
})

function timeDifference(date2) {
    var date1 = Math.round((new Date()).getTime() / 1000);
    
    var difference = date1 - date2;

    var daysDifference = Math.floor(difference/60/60/24);

    difference -= daysDifference*60*60*24

    var hoursDifference = Math.floor(difference/60/60);
    difference -= hoursDifference*60*60

    var minutesDifference = Math.floor(difference/60);
    difference -= minutesDifference*60

    var secondsDifference = Math.floor(difference);

    console.log('last harvest: ' + 
      daysDifference + ' d ' + 
      hoursDifference + ' h ' + 
      minutesDifference + ' m ' + 
      secondsDifference + ' s ');
}
