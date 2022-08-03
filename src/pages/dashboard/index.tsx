import React, { useState } from 'react'
import styled from 'styled-components'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { NavigationTypes } from 'components/App/Dashboard'
import DeiStats from 'components/App/Dashboard/DeiStats'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
`

export default function Dashboard() {
  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.DEI)

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.DEI) {
      return <DeiStats />
    }
   
    return <DeiStats />
  }

  return (
    <Container>
      <Hero>
        <div>Dashboard</div>
        <HeroSubtext>Important stats about LIBRA </HeroSubtext>
      </Hero>

      {getAppComponent()}

      <Disclaimer />
    </Container>
  )
}