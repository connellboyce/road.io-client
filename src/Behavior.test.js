import React from 'react'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {fireEvent, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import DataBox from './DataBox';

//Testing
const server = setupServer(
    rest.get('http://localhost:8787/api/stations/near///100', (req, res, ctx) => {
        return res(ctx.text('OKAY'))
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())


test('check pieces of the data box are present', () => {

    render(<DataBox/>)

    expect(screen.getByText('road.i')).toBeInTheDocument()
    expect(screen.getByText('EV Specs')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText('Starting point')).toBeInTheDocument()
    expect(screen.getByText('Ending point')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Current State of Charge')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('Make and Model')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
})


test('test submit', async () => {
    render(<DataBox/>)

    fireEvent.click(screen.getByText('Submit'))

})
