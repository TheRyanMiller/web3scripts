require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();


let want = '0xc5bddf9843308380375a611c18b50fb9341f502a';

function getClaimable3Crv() public view returns (uint256) {
    IyveCRV YveCrv = IyveCRV(address(want));
    uint256 claimable = YveCrv.claimable(address(this));
    uint256 claimableToAdd = (YveCrv.index().sub(YveCrv.supplyIndex(address(this))))
        .mul(YveCrv.balanceOf(address(this)))
        .div(1e18);
    return claimable.mul(1e18).add(claimableToAdd);
}

