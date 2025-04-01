import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const requestHeaders = require('../../test-data/request-json/request_headers.json')
const postQuoteRequestBody = require('../../test-data/request-json/post_quote_request_body.json')
const expectedPostQuoteResponseBody = require('../../test-data/response-json/post_quote_response_body.json')

const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')

let requestHeadersWithBearerToken

test.beforeAll('test setup', async () => {
  requestHeadersWithBearerToken = stringFormat(
    JSON.stringify(requestHeaders),
    `Bearer ${process.env.BEARER_TOKEN}`
  )
})

test.describe('Request a Quote', () => {
  test('Valid Quote Request', async ({ request }) => {
    const response = await apiRequest.post(
      '/api/v1/quotes',
      JSON.parse(requestHeadersWithBearerToken),
      postQuoteRequestBody
    )

    const responseBody = await response.json()
    const jsonResponseObjectProperties = JSON.parse(
      JSON.stringify(expectedPostQuoteResponseBody)
    )
    apiAssertions.assertThatResponseIsOk(response)
    apiAssertions.assertResponseStatus(response, 200)
    apiAssertions.assertResponseBodyHasProperty(
      responseBody,
      jsonResponseObjectProperties
    )

    const quoteId = responseBody.quoteId
    expect(quoteId).not.toBeNull()
    expect(quoteId).not.toBe('')
    expect(quoteId).not.toBeUndefined()
  })

  test('Invalid Quote Request with missing parameter', async ({ request }) => {
    //delete 'pair' parameter from request body
    delete postQuoteRequestBody.pair

    const response = await apiRequest.post(
      '/api/v1/quotes',
      JSON.parse(requestHeadersWithBearerToken),
      postQuoteRequestBody
    )

    const responseBody = await response.json()
    apiAssertions.assertResponseStatus(response, 400)
    apiAssertions.assertResponseErrorMessage(responseBody, 'pair is required')
  })

  test('Invalid Quote Request with invalid parameter', async ({ request }) => {
    //delete 'side' parameter from request body & adding invalid value to side parameter
    delete postQuoteRequestBody.side
    postQuoteRequestBody.side = 'test'

    const response = await apiRequest.post(
      '/api/v1/quotes',
      JSON.parse(requestHeadersWithBearerToken),
      postQuoteRequestBody
    )

    const responseBody = await response.json()
    apiAssertions.assertResponseStatus(response, 400)
    apiAssertions.assertResponseErrorMessage(
      responseBody,
      'side must be one of BUY SELL'
    )
  })
})
