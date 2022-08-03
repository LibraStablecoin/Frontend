import { Loader } from 'components/Icons'
import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import { StakingPools, vDeusStakingPools } from 'constants/stakings'
import { useTokenPerBlock } from 'hooks/useBdeiStakingPage'
import { useBonderData, useGetRedeemTime } from 'hooks/useBondsPage'
import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import useDebounce from 'hooks/useDebounce'
import { useDeiStats } from 'hooks/useDeiStats'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'
import { useRedeemData } from 'hooks/useRedemptionPage'
import { useMemo } from 'react'
import { useModalOpen, useDashboardModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useBorrowPools } from 'state/borrow/hooks'
import styled from 'styled-components'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { getRemainingTime } from 'utils/time'
import { Dashboard } from './DeiStats'
import Link from 'next/link'
import { getMaximumDate } from 'utils/vest'
import { useVestedAPY } from 'hooks/useVested'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { useGetApr, usePoolInfo } from 'hooks/useVDeusStaking'
import { useGetApy } from 'hooks/useStakingInfo'

const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 1rem;
`};

  > div {
    margin: 4px 0px;
  }
`

const ModalInfoWrapper = styled(RowBetween)<{
  active?: boolean
}>`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 250px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      padding: 0.75rem 1rem;
      width: 90%;
      min-width: 265px;
    `}
  ${({ theme, active }) =>
    active &&
    `
    border: 1px solid ${theme.text1};
  `}
`

const ModalItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

const ItemWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.25rem;
`

const SecondaryLabel = styled.span`
  color: ${({ theme }) => theme.yellow3};
`

export default function StatsModal({ stat }: { stat: Dashboard }) {
  const dashboardModalOpen = useModalOpen(ApplicationModal.DASHBOARD)
  const toggleDashboardModal = useDashboardModalToggle()

  const {price} = useDeiPrice()

  const { deiBonded } = useBonderData()
  const { totalDeposited } = useTokenPerBlock()

  const pools = useBorrowPools()
  const { borrowedElastic } = useGlobalDEIBorrowed(pools)

  const debouncedAmountIn = useDebounce('', 500)
  const { redeemTime } = useGetRedeemTime(debouncedAmountIn || '0')
  const { day, hours } = getRemainingTime(redeemTime)
  const roundedDays = day + (hours > 12 ? 1 : 0) //adds 1 more day if remained hours is above 12 hours.

  const { pid: deiPID } = StakingPools[0] //bDEI single staking pool
  const bDeiSingleStakingAPR = useGetApy(deiPID)

  const { pid: deibDeiPID } = StakingPools[1] //bDEI-DEI staking pool
  const bDeiDeiStakingAPR = useGetApy(deibDeiPID)

  const {
    totalSupply, 
    totalProtocolHoldings,
    circulatingSupply,
    usdcReserves1,
    daiReserves, 
    totalReserves,
  } = useDeiStats()

  const usdcBackingPerDei = useMemo(() => {
    return totalReserves / totalSupply
  }, [totalReserves, totalSupply])

  const showLoader = false

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const { numberOfVouchers, listOfVouchers } = useVDeusStats()

  const vDEUS3MonthsPool = vDeusStakingPools[0] // vDEUS staked for 3 Months
  const { totalDeposited: totalDepositedFor3Months } = usePoolInfo(vDEUS3MonthsPool.pid)
  const apr3Month = useGetApr(vDEUS3MonthsPool.pid)

  const vDEUS6MonthsPool = vDeusStakingPools[1] // vDEUS staked for 6 Months
  const { totalDeposited: totalDepositedFor6Months } = usePoolInfo(vDEUS6MonthsPool.pid)
  const apr6Month = useGetApr(vDEUS6MonthsPool.pid)

  const vDEUS12MonthsPool = vDeusStakingPools[2] // vDEUS staked for 12 Months
  const { totalDeposited: totalDepositedFor12Months } = usePoolInfo(vDEUS12MonthsPool.pid)
  const apr12Month = useGetApr(vDEUS12MonthsPool.pid)

  const totalvDeusStaked = useMemo(() => {
    return totalDepositedFor3Months + totalDepositedFor6Months + totalDepositedFor12Months
  }, [totalDepositedFor3Months, totalDepositedFor6Months, totalDepositedFor12Months])

  function getModalBody() {
    switch (stat) {
      case Dashboard.EMPTY:
        return null
      case Dashboard.DEI_PRICE:
        return (
          <ModalWrapper>
            <div>
              Price as sourced by:
             
            </div>
            <ModalInfoWrapper>
              <p>Price</p>
              {price === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatDollarAmount(price)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.DEI_TOTAL_SUPPLY:
        return (
          <ModalWrapper>
            <div>
              Total Supply as shown on :{' '}
              <a
                href="https://ftmscan.com/token/0x0fA9604dC5cCC62462CC330d2605D036d5C28275"
                target={'_blank'}
                rel={'noreferrer'}
              >
                LIBRA Token
              </a>
            </div>
            <ModalInfoWrapper>
              <p>Total Supply</p>
              {totalSupply === null ? <Loader /> : <ModalItemValue>{formatAmount(totalSupply, 2)}</ModalItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.DEI_PROTOCOL_HOLDINGS:
        return (
          <ModalWrapper>
            <div>DEI Protocol holdings are held in two wallets.</div>
            <div>Below is the DEI holdings in each wallet.</div>
            <ModalInfoWrapper>
              <a
                href="https://ftmscan.com/token/0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3?a=0x0b99207afbb08ec101b5691e7d5c6faadd09a89b"
                target={'_blank'}
                rel={'noreferrer'}
              >
                Protocol Holdings 1
              </a>
              
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <a
                href="https://ftmscan.com/token/0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3?a=0x68c102aba11f5e086c999d99620c78f5bc30ecd8"
                target={'_blank'}
                rel={'noreferrer'}
              >
                Protocol Holdings 2
              </a>
             
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Total holdings</p>
              {totalProtocolHoldings === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(totalProtocolHoldings, 2)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.TOTAL_DEI_BONDED:
        return (
          <ModalWrapper>
            <div>Total DEI Bonded in the Bonding Contract.</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/token/0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3?a=0x958C24d5cDF94fAF47cF4d66400Af598Dedc6e62"
                target={'_blank'}
                rel={'noreferrer'}
              >
                DEI Bonding Contract
              </a>
            </div>
            <ModalInfoWrapper>
              <p>Total DEI Bonded</p>
              {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.DEI_CIRCULATING_SUPPLY:
        return (
          <ModalWrapper>
            <div>DEI Circulating Supply is calculated as below: </div>
            <ItemValue>Circulating Supply = Total Supply - Protocol Holdings - Total DEI Bonded</ItemValue>
            <ModalInfoWrapper>
              <p>Total Supply</p>
              {totalSupply === null ? <Loader /> : <ItemValue>{formatAmount(totalSupply, 2)}</ItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p>Protocol Holdings</p>
              {totalProtocolHoldings === null ? (
                <Loader />
              ) : (
                <ItemValue>{formatAmount(totalProtocolHoldings, 2)}</ItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p>Total DEI Bonded</p>
              {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Circulating Supply</p>
              {circulatingSupply === null ? <Loader /> : <ItemValue>{formatAmount(circulatingSupply, 2)}</ItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.TOTAL_USDC_RESERVES:
        return (
          <ModalWrapper>
            <div>DEI Protocol USDC Reserves are held in two wallets.</div>
            <div>Below is the USDC holdings in each wallet.</div>
            <ModalInfoWrapper>
              <a
                href="https://ftmscan.com/token/0x04068da6c83afcfa0e13ba15a6696662335d5b75?a=0x76DC5f7F64089be86cCB3879b2cb5151CBE09E6d"
                target={'_blank'}
                rel={'noreferrer'}
              >
                USDC Reserve 
              </a>
              {usdcReserves1 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves1, 2)}</ModalItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <a
                href="https://ftmscan.com/token/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E?a=0x6f4b08886040396C7BFE01563FE90fD5442579A7"
                target={'_blank'}
                rel={'noreferrer'}
              >
                Dai Reserve 
              </a>
              {daiReserves === null ? <Loader /> : <ModalItemValue>{formatAmount(daiReserves, 2)}</ModalItemValue>}

            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Total Reserves</p>
              {totalReserves === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(totalReserves, 2)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.USDC_BACKING_FOR_DEI:
        return (
          <ModalWrapper>
            <div>Value Backing Per LIBRA is calculated as: </div>
            <ItemValue>Backing Per LIBRA = Total Reserves / LIBRA Circulating Supply</ItemValue>
            <ModalInfoWrapper>
              <p>Total Value Reserves</p>
              {totalReserves === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(totalReserves, 2)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p>Circulating Supply</p>
              {circulatingSupply === null ? <Loader /> : <ItemValue>{formatAmount(totalSupply, 2)}</ItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Backing Per LIBRA</p>
              {usdcBackingPerDei === null ? (
                <Loader />
              ) : (
                <ItemValue>{formatDollarAmount(usdcBackingPerDei, 2)}</ItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.GLOBAL_DEI_BORROWED:
        return (
          <ModalWrapper>
            <div>Total DEI Borrowed from the DEI Money markets</div>
            <div>
              Link to Borrow :{' '}
              <Link href="/borrow" passHref>
                DEI Money Markets
              </Link>
            </div>
            <ModalInfoWrapper>
              <p>Global DEI Borrowed</p>
              {borrowedElastic === null ? (
                <Loader />
              ) : (
                <ItemValue>{formatAmount(parseFloat(borrowedElastic))}</ItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.TOTAL_DEI_REDEEMED:
        return (
          <ModalWrapper>
            <div>DEI gets burned from total supply whenever a user redeems it for underlying USDC and vDEUS.</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/address/0xfd74e924dc96c72ba52439e28ce780908a630d13"
                target={'_blank'}
                rel={'noreferrer'}
              >
                DEI Redeemer Contract
              </a>
            </div>
            <ModalInfoWrapper>
              <p>Total DEI Redeemed</p>
              {showLoader ? <Loader /> : <ItemValue>{formatAmount(0)}</ItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.REDEMPTION_PER_DEI:
        return (
          <ModalWrapper>
            <div>Users can redeem DEI for underlying USDC and vDEUS.</div>
            <div>USDC paid out is based on the amount of DEI already redeemed.</div>
            <div>vDEUS is a voucher which can be redeemed for DEUS in future.</div>
            <div>The amount of USDC and vDEUS given per DEI is explained in detail in the below Medium Article</div>
            <div>
              Link to Medium article :{' '}
              <a
                href="https://lafayettetabor.medium.com/dynamic-redemption-tranches-fedc69df4e3"
                target={'_blank'}
                rel={'noreferrer'}
              >
                Dynamic Redemption Tranches
              </a>
            </div>
           
          </ModalWrapper>
        )
      case Dashboard.TOTAL_BDEI_STAKED:
        return (
          <ModalWrapper>
            <div>Total bDEI that is being staked for DEUS rewards.</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/address/0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8"
                target={'_blank'}
                rel={'noreferrer'}
              >
                bDEI Staking Contract
              </a>
            </div>
            <ModalInfoWrapper>
              <p>Total bDEI Staked</p>
              {totalDeposited == 0 ? <Loader /> : <ItemValue>{formatAmount(totalDeposited)}</ItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.BDEI_STAKING_APR:
        return (
          <ModalWrapper>
            <div>bDEI Single Staking APR where rewards are paid out in DEUS</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/address/0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8"
                target={'_blank'}
                rel={'noreferrer'}
              >
                bDEI Staking Contract
              </a>
            </div>
            <ModalInfoWrapper>
              <p>bDEI Staking APR</p>
              {bDeiSingleStakingAPR == 0 ? <Loader /> : <ItemValue>{bDeiSingleStakingAPR.toFixed(2)}%</ItemValue>}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.DEI_LIQUIDITY:
        return (
          <ModalWrapper>
            <div>DEI Liqudity in bDEI-DEI Pool</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/address/0x9cac3ce5d8327aa5af54b1b4e99785f991885bf3"
                target={'_blank'}
                rel={'noreferrer'}
              >
                bDEI-DEI Liqudity Pool
              </a>
            </div>
            <ModalInfoWrapper>
              <a
                href="https://ftmscan.com/token/0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3?a=0x9cac3ce5d8327aa5af54b1b4e99785f991885bf3"
                target={'_blank'}
                rel={'noreferrer'}
              >
                DEI Liquidity
              </a>
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.BDEI_LIQUIDITY:
        return (
          <ModalWrapper>
            <div>bDEI Liqudity in bDEI-DEI Pool</div>
            <div>
              Contract Address :{' '}
              <a
                href="https://ftmscan.com/address/0x9cac3ce5d8327aa5af54b1b4e99785f991885bf3"
                target={'_blank'}
                rel={'noreferrer'}
              >
                bDEI-DEI Liqudity Pool
              </a>
            </div>
          
           
          </ModalWrapper>
        )
    
    }
  }

  function getModalContent() {
    return (
      <>
        <ModalHeader title={stat} onClose={toggleDashboardModal} />
        {getModalBody()}
      </>
    )
  }

  return (
    <Modal
      width="500px"
      isOpen={dashboardModalOpen}
      onBackgroundClick={toggleDashboardModal}
      onEscapeKeydown={toggleDashboardModal}
    >
      {getModalContent()}
    </Modal>
  )
}
