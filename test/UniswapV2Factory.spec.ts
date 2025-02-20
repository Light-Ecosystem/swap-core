import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'

import { getCreate2Address } from './shared/utilities'
import { factoryFixture, pairFixture } from './shared/fixtures'

import UniswapV2Pair from '../build/UniswapV2Pair.json'

chai.use(solidity)

const TEST_ADDRESSES: [string, string] = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000'
]

describe('UniswapV2Factory', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      chain: {
        hardfork: 'istanbul',
        chainId: 1
      },
      wallet: {
        mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn'
      },
      miner: {
        blockGasLimit: 9999999
      }
    }
  })
  const [wallet, other] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet, other], provider)

  let factory: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(factoryFixture)
    factory = fixture.factory
  })

  it('feeTo, feeToSetter, allPairsLength', async () => {
    expect(await factory.feeTo()).to.eq(AddressZero)
    expect(await factory.feeToSetter()).to.eq(wallet.address)
    expect(await factory.allPairsLength()).to.eq(0)
  })

  async function createPair(tokens: [string, string]) {
    const bytecode = `0x${UniswapV2Pair.evm.bytecode.object}`
    const create2Address = getCreate2Address(factory.address, tokens, bytecode)
    await expect(factory.createPair(...tokens))
      .to.emit(factory, 'PairCreated')
      .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, BigNumber.from(1))

    await expect(factory.createPair(...tokens)).to.be.reverted // UniswapV2: PAIR_EXISTS
    await expect(factory.createPair(...tokens.slice().reverse())).to.be.reverted // UniswapV2: PAIR_EXISTS
    expect(await factory.getPair(...tokens)).to.eq(create2Address)
    expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address)
    expect(await factory.allPairs(0)).to.eq(create2Address)
    expect(await factory.allPairsLength()).to.eq(1)

    const pair = new Contract(create2Address, JSON.stringify(UniswapV2Pair.abi), provider)
    expect(await pair.factory()).to.eq(factory.address)
    expect(await pair.token0()).to.eq(TEST_ADDRESSES[0])
    expect(await pair.token1()).to.eq(TEST_ADDRESSES[1])
  }

  it('printInitCodeHash', async () => {
    const bytecode = `0x${UniswapV2Pair.evm.bytecode.object}`
    const initCodeHash = keccak256(bytecode)
    expect(initCodeHash).to.eq('0x0fe0976a8394a59cb43ce8ed266ed3ad7b48c0538114ef1bea17c3f7f4138f2c')
  })

  it('createPair', async () => {
    await createPair(TEST_ADDRESSES)
  })

  it('createPair:reverse', async () => {
    await createPair(TEST_ADDRESSES.slice().reverse() as [string, string])
  })

  it('createPair:checkTokenApproved', async () => {
    const fixture = await loadFixture(pairFixture)
    await factory.setApprovedTokenManager(fixture.approvedTokenManager.address)

    var tokens: [string, string]
    if (fixture.token1.address > fixture.token2.address) {
      tokens = [fixture.token1.address, fixture.token2.address]
    } else {
      tokens = [fixture.token2.address, fixture.token1.address]
    }
    await expect(factory.createPair(tokens[0], tokens[1])).to.be.revertedWith('HopeSwap: FORBIDDEN')
    await fixture.approvedTokenManager.approveToken(fixture.token1.address, true)
    await fixture.approvedTokenManager.approveToken(fixture.token2.address, true)

    await expect(factory.createPair(tokens[0], tokens[1])).to.emit(factory, 'PairCreated')
  })

  it('createPair:gas', async () => {
    const tx = await factory.createPair(...TEST_ADDRESSES)
    const receipt = await tx.wait()
    expect(receipt.gasUsed).to.eq(2986813)
  })

  it('setFeeTo', async () => {
    await expect(factory.connect(other).setFeeTo(other.address)).to.be.revertedWith('HopeSwap: FORBIDDEN')
    await factory.setFeeTo(wallet.address)
    expect(await factory.feeTo()).to.eq(wallet.address)
  })

  it('setFeeToSetter', async () => {
    await expect(factory.connect(other).setFeeToSetter(other.address)).to.be.revertedWith('HopeSwap: FORBIDDEN')
    await factory.setFeeToSetter(other.address)
    expect(await factory.feeToSetter()).to.eq(other.address)
    await expect(factory.setFeeToSetter(wallet.address)).to.be.revertedWith('HopeSwap: FORBIDDEN')
  })

  it('setApprovedTokenManager', async () => {
    const fixture = await loadFixture(pairFixture)
    await expect(
      factory.connect(other).setApprovedTokenManager(fixture.anotherApprovedTokenManager.address)
    ).to.be.revertedWith('HopeSwap: FORBIDDEN')
    await factory.setApprovedTokenManager(fixture.anotherApprovedTokenManager.address)
    expect(await factory.approvedTokenManager()).to.eq(fixture.anotherApprovedTokenManager.address)
  })
})
