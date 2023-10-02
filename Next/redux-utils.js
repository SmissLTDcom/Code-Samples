import React from 'react'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from '../../redux/reducers'
import { mount } from 'enzyme'
import thunk from 'redux-thunk'

function render(
  Component,
  {
    initialState,
    store = createStore(reducer, initialState, applyMiddleware(thunk)),
  } = {}
) {
  return mount(<Provider store={store}>{Component}</Provider>)
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }
