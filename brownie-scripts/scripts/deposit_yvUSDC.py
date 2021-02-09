from brownie import *

def main():
    whale = accounts.at('0xcc85D3B7fb301d347Ff4b6139e47f5a65A09b709', force=True)
    usdcVault = Contract.from_explorer("0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e")
    usdcToken = Contract.from_explorer("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")

    whale_balance_before = usdcToken.balanceOf(whale)

    usdcToken.approve(usdcVault.address,100*1e18,{"from": whale})
    usdcVault.deposit(23*1e6,{"from":whale})

    whale_balance_vault = usdcVault.balanceOf(whale)
    whale_balance_after = usdcToken.balanceOf(whale)

    print("Original Balance:", whale_balance_before)
    #print("Balance after deposit:", whale_balance_before - whale_balance_after)
    print("----")
    usdcVault.withdraw(usdcVault.balanceOf(whale),{"from":whale})
    #print("Withdraw amount", usdcToken.balanceOf(whale) - whale_balance_after)
    print("Final amount", usdcToken.balanceOf(whale))


