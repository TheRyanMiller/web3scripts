import pytest
from brownie import config, Contract


@pytest.fixture
def dev(accounts):
    yield accounts[1]

@pytest.fixture
def whale(accounts):
    whale = accounts.at('0xcc85D3B7fb301d347Ff4b6139e47f5a65A09b709', force=True)
    yield whale


@pytest.fixture
def usdcVault(interface):
    yield Contract.from_explorer("0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e")


@pytest.fixture
def usdc(interface):
    yield Contract.from_explorer("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
