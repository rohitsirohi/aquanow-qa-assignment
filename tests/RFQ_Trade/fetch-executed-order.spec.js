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
let executeQuoteRequestBody
let orderId
const invalidOrderId = '77c75471-c06a-4946-a927-14fef79715e0'

test.beforeAll('test setup', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      // `Bearer ${process.env.BEARER_TOKEN}`
      'Bearer eyJraWQiOiJBeWRrbjkrck5lSTlzdll5N3NSWjFqV3B3dGE1UlBSZTBJRXlKT0FzZHpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDlnZ242aW5qZTNpN2JzZmg2MGthODU0YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXF1YWNhbXMtZGV2XC93cml0ZSBhcXVhY2Ftcy1kZXZcL3JlYWQgY29tcGxpYW5jZVwvZGVmYXVsdCIsImF1dGhfdGltZSI6MTc0MzYxNjIzNiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZkkxeWJTT2RDIiwiZXhwIjoxNzQzNjE5ODM2LCJpYXQiOjE3NDM2MTYyMzYsInZlcnNpb24iOjIsImp0aSI6ImFmNzAwYTkxLTY0YmEtNDc0Mi1hNDAzLWYxNjA2YTViYjNmZiIsImNsaWVudF9pZCI6IjUwOWdnbjZpbmplM2k3YnNmaDYwa2E4NTRiIn0.AKXQ4Mrk8KmKTnDJFsu6PSJsFXxpr6zJEFhtSpMl62xnPB0R3fFTL40UpnaMU6iYwcOKdcpp7Wh8cwn3-_loLPBvNusBBL7iM1lBkz4rBOiOCvmmT3sBuLAW8F-6ZfF3d2uDH6k-4LM_QkM7FYvyi_fzwuvPgdHdgRbUPfEnmypnuD3Z6eM6FeDuloGNnOmg_385oMK7LOc7QWQu2wEs_qZlNsGxrKDxf_5cjfifJfcoKbKQPal0vzeKtegS7ArPgByBJ3AsZX5th-kkP6xBc7EFt15C8HYrXAyMGiLoZZn7zaeu6OXCJ3kvUMOnVIBfl_1jql4A-EOch_Ai6ipHvg'
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
    executeQuoteRequestBody = stringFormat(
      JSON.stringify(executeQuoteRequestJson),
      quoteId
    )
  })
  await test.step('Get Order Id', async () => {
    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      executeQuoteRequestBody
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertThatResponseIsOk(executeQuoteResponse)
    apiAssertions.assertResponseStatus(executeQuoteResponse, 200)

    orderId = executeQuoteResponseBody.order.orderId
    expect(orderId).not.toBeNull()
    expect(orderId).not.toBe('')
    expect(orderId).not.toBeUndefined()
  })
})

test.describe('Get order details', () => {
  test('Get valid order details', async ({ request }) => {
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
