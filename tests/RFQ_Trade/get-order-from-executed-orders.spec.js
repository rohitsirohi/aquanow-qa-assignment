import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const executeQuoteRequestJson = require('../../test-data/request-json/execute_quote_request_body.json')
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')

let requestHeaders
let quoteId
let orderId

test.beforeAll('test setup', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      `Bearer ${process.env.BEARER_TOKEN}`
    )
  )
})

test.describe('Get order from list of orders', () => {
  test('Assert if order exists in list of orders', async ({ request }) => {
    await test.step('Get Quote Id', async () => {
      const requestQuoteResponse = await apiRequest.post(
        '/api/v1/quotes',
        requestHeaders,
        requestQuoteJson
      )

      const requestQuoteResponseBody = await requestQuoteResponse.json()
      apiAssertions.assertThatResponseIsOk(requestQuoteResponse)
      apiAssertions.assertResponseStatus(requestQuoteResponse, 200)

      quoteId = requestQuoteResponseBody.quoteId
      expect(quoteId).not.toBeNull()
      expect(quoteId).not.toBe('')
      expect(quoteId).not.toBeUndefined()
    })
    await test.step('Get Order Id', async () => {
      const executeQuoteResponse = await apiRequest.post(
        '/api/v1/orders',
        requestHeaders,
        stringFormat(JSON.stringify(executeQuoteRequestJson), quoteId)
      )
      const executeQuoteResponseBody = await executeQuoteResponse.json()

      apiAssertions.assertThatResponseIsOk(executeQuoteResponse)
      apiAssertions.assertResponseStatus(executeQuoteResponse, 200)

      orderId = executeQuoteResponseBody.order.orderId
      expect(orderId).not.toBeNull()
      expect(orderId).not.toBe('')
      expect(orderId).not.toBeUndefined()
    })

    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders`,
      requestHeaders
    )

    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertThatResponseIsOk(getOrderDetailsResponse)
    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)

    expect(getOrderDetailsResponseBody.items).toBeDefined()
    const orderFound = getOrderDetailsResponseBody.items.some(
      (item) => item.orderId === orderId
    )
    expect(orderFound).toBe(true)
  })
})
