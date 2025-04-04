import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const executeQuoteRequestJson = require('../../test-data/request-json/execute_quote_request_body.json')
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')

const invalidQuoteId = '0d097c11-90ea-4bbb-a176-aab836dd22f5'
const executedQuoteId = '18504c4d-5b8a-4790-b8c7-906781c1a6c3'
let requestHeaders
let quoteId

test.beforeAll('Get Bearer Token', async () => {
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

test.describe('Execute a Quote', () => {
  test('Valid Quote Execution', async ({ request }) => {
    const executeQuoteRequest = { ...executeQuoteRequestJson }
    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      stringFormat(JSON.stringify(executeQuoteRequest), quoteId)
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()
    const orderId = executeQuoteResponseBody.order.orderId
    apiAssertions.assertThatResponseIsOk(executeQuoteResponse)
    apiAssertions.assertResponseStatus(executeQuoteResponse, 200)
    expect(orderId).not.toBeNull()
    expect(orderId).not.toBe('')
    expect(orderId).not.toBeUndefined()
  })

  test('Execute Quote with invalid Quote Id', async ({ request }) => {
    //delete 'quoteId' parameter from request body and add invalid quote id
    const invalidExecuteQuoteRequestJson = { ...executeQuoteRequestJson }
    delete invalidExecuteQuoteRequestJson.quoteId
    invalidExecuteQuoteRequestJson.quoteId = invalidQuoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      invalidExecuteQuoteRequestJson
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertResponseStatus(executeQuoteResponse, 404)
    apiAssertions.assertResponseErrorMessage(
      executeQuoteResponseBody,
      'Quote does not exist'
    )
  })

  test('Execute Quote with no Quote Id', async ({ request }) => {
    //delete 'quoteId' parameter from request body
    const invalidExecuteQuoteRequestJson = { ...executeQuoteRequestJson }
    delete invalidExecuteQuoteRequestJson.quoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      invalidExecuteQuoteRequestJson
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertResponseStatus(executeQuoteResponse, 400)
    apiAssertions.assertResponseErrorMessage(
      executeQuoteResponseBody,
      'quoteId is required'
    )
  })

  test('Execute Quote with already executed Quoted Id', async ({ request }) => {
    //delete 'quoteId' parameter from request body and add invalid quote id
    const invalidExecuteQuoteRequestJson = { ...executeQuoteRequestJson }
    delete invalidExecuteQuoteRequestJson.quoteId
    invalidExecuteQuoteRequestJson.quoteId = executedQuoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      invalidExecuteQuoteRequestJson
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertResponseStatus(executeQuoteResponse, 409)
    apiAssertions.assertResponseErrorMessage(
      executeQuoteResponseBody,
      'Quote already accepted'
    )
  })
})
