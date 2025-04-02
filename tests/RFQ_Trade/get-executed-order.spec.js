import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const expectedGetOrderResponseJson = require('../../test-data/response-json/get_order_repsonse_body.json')
const executeQuoteRequestJson = require('../../test-data/request-json/execute_quote_request_body.json')
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')

let requestHeaders
let quoteId
let orderId
const invalidOrderId = '77c75471-c06a-4946-a927-14fef79715e0'

test.beforeAll('test setup', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      `Bearer ${process.env.BEARER_TOKEN}`
    )
  )
})

test.beforeEach('Request quote and fetch quote id', async () => {
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
})

test.describe('Get order details', () => {
  test('Get valid order details', async ({ request }) => {
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
      `/api/v1/orders/${orderId}`,
      requestHeaders
    )

    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertThatResponseIsOk(getOrderDetailsResponse)
    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)

    // Adding order Id to expected Json
    delete expectedGetOrderResponseJson.orderId
    expectedGetOrderResponseJson.orderId = orderId
    const expectedGetOrderResponseBody = JSON.parse(
      JSON.stringify(expectedGetOrderResponseJson)
    )

    apiAssertions.assertResponseBodyHasProperty(
      getOrderDetailsResponseBody,
      expectedGetOrderResponseBody
    )
  })

  test('Get invalid order details', async ({ request }) => {
    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders/${invalidOrderId}`,
      requestHeaders
    )

    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 404)
    apiAssertions.assertResponseErrorMessage(
      getOrderDetailsResponseBody,
      'Not found'
    )
  })
})
