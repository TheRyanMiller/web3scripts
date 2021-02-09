from brownie import Wei


def test_deposit(usdc, usdcVault, whale):
    print(usdc.balanceOf(whale))
    whale_balance_before = usdc.balanceOf(whale)
    print("Before balance:", whale_balance_before)
    usdc.approve(usdcVault.address,100*1e18,{"from": whale})
    usdcVault.deposit(23*1e6,{"from":whale})

    whale_balance_vault = usdcVault.balanceOf(whale)
    whale_balance_after = usdc.balanceOf(whale)

    print("Balance after deposit:", usdc.balanceOf(whale))
    #print("Balance after deposit:", whale_balance_before - whale_balance_after)
    print("----")
    #usdcVault.withdraw(usdcVault.balanceOf(whale),{"from":whale})
    #print("Withdraw amount", usdcToken.balanceOf(whale) - whale_balance_after)
    #print("Final amount", usdc.balanceOf(whale))

def test_new_check(usdc, usdcVault, whale):
    print("Balance:", usdc.balanceOf(whale))