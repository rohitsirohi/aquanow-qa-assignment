import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const expectedRequestQuoteResponseJson = require('../../test-data/response-json/post_quote_response_body.json')

const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
let requestHeaders

test.beforeAll('test setup', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      `Bearer ${process.env.BEARER_TOKEN}`
    )
  )
})

test.describe('Request a Quote', () => {
  test('Valid Quote Request', async ({ request }) => {
    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      requestQuoteJson
    )

    const requestQuoteResponseBody = await requestQuoteResponse.json()
    const expectedRequestQuoteResponseBody = JSON.parse(
      JSON.stringify(expectedRequestQuoteResponseJson)
    )

    apiAssertions.assertThatResponseIsOk(requestQuoteResponse)
    apiAssertions.assertResponseStatus(requestQuoteResponse, 200)
    apiAssertions.assertResponseBodyHasProperty(
      requestQuoteResponseBody,
      expectedRequestQuoteResponseBody
    )

    const quoteId = requestQuoteResponseBody.quoteId
    expect(quoteId).not.toBeNull()
    expect(quoteId).not.toBe('')
    expect(quoteId).not.toBeUndefined()
  })

  test('Request Quote with missing parameter', async ({ request }) => {
    //delete 'pair' parameter from request body
    const missingParamRequestQuoteJson = requestQuoteJson
    delete missingParamRequestQuoteJson.pair

    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      missingParamRequestQuoteJson
    )

    const requestQuoteResponseBody = await requestQuoteResponse.json()
    apiAssertions.assertResponseStatus(requestQuoteResponse, 400)
    apiAssertions.assertResponseErrorMessage(
      requestQuoteResponseBody,
      'pair is required'
    )
  })

  test('Request Quote with invalid parameter', async ({ request }) => {
    //delete 'side' parameter from request body & adding invalid value to side parameter
    const invalidRequestQuoteJson = requestQuoteJson
    delete invalidRequestQuoteJson.side
    invalidRequestQuoteJson.side = 'test'

    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      invalidRequestQuoteJson
    )

    const requestQuoteResponseBody = await requestQuoteResponse.json()
    apiAssertions.assertResponseStatus(requestQuoteResponse, 400)
    apiAssertions.assertResponseErrorMessage(
      requestQuoteResponseBody,
      'side must be one of BUY SELL'
    )
  })
})
