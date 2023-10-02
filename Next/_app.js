import App from 'next/app'
import React from 'react'
import { Router } from 'next/router'
import { createWrapper } from 'next-redux-wrapper'
import { Provider } from 'react-redux'

import store from '../redux/store'
import PageContainer from '../components/shared/PageContainer'
import Spinner from '../components/shared/Spinner'

import '../styles/index.scss'
import 'pure-react-carousel/dist/react-carousel.es.css'
import '../components/assets/css/slick.css'
import '../components/assets/css/slick-theme.css'

class MyApp extends App {
  state = {
    loading: false,
  }

  componentDidMount() {
    Router.events.on('routeChangeStart', () => this.setState({ loading: true }))

    Router.events.on('routeChangeComplete', () => {
      window.scrollTo(0, 0)
      this.setState({ loading: false })
    })

    Router.events.on('routeChangeError', (err, url) => {
      if (err.cancelled) {
        console.log(`Route to ${url} was cancelled!`)
      }
    })
  }

  render() {
    const { Component, pageProps, router } = this.props
    if (this.state.loading) return <Spinner addClass="global" />
    if (router.pathname.includes('/care-providers')) {
      return (
        <Provider store={store}>
          <PageContainer>
            <Component {...pageProps} />
          </PageContainer>
        </Provider>
      )
    }
  }
}

const makeStore = () => store
const wrapper = createWrapper(makeStore)

export default wrapper.withRedux(MyApp)
