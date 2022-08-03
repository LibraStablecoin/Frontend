import React from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
// import { BDEI_TOKEN } from 'constants/tokens'
// import { StablePools } from 'constants/sPools'
import { StakingPools } from 'constants/stakings'
import Staking from 'components/App/deiPool/Staking'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`
const MainWrapper = styled.div`
  position: relative;
`

const ComingSoon = styled.span`
  position: absolute;
  margin: 0 auto;
  padding: 20px 15px;
  justify-content: center;
  top: 39%;
  left: 43%;
  transform: translate(0, -50%);
  z-index: 2;
  font-size: 21px;
`
export default function Pools() {
  // const pool = StablePools[0]
  // const bdeiCurrency = BDEI_TOKEN
  // const lpCurrency = pool.lpToken

  return (
    <Container>
      <Hero>
        <div>Staking</div>
      </Hero>
      <MainWrapper style={{ pointerEvents: 'none' }}>
      <ComingSoon> Coming soon... </ComingSoon>
      <Staking pool={StakingPools[0]} />
      {/* {StakingPools.map((pool) => {
        return <Staking key={pool.pid} pool={pool} />
      })} */}
            </MainWrapper>

      <Disclaimer />
    </Container>
    
  )
}
