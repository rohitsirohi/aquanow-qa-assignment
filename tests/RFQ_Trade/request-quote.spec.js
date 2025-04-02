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
      // `Bearer ${process.env.BEARER_TOKEN}`
      'Bearer eyJraWQiOiJBeWRrbjkrck5lSTlzdll5N3NSWjFqV3B3dGE1UlBSZTBJRXlKT0FzZHpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDlnZ242aW5qZTNpN2JzZmg2MGthODU0YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXF1YWNhbXMtZGV2XC93cml0ZSBhcXVhY2Ftcy1kZXZcL3JlYWQgY29tcGxpYW5jZVwvZGVmYXVsdCIsImF1dGhfdGltZSI6MTc0MzYxNjIzNiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZkkxeWJTT2RDIiwiZXhwIjoxNzQzNjE5ODM2LCJpYXQiOjE3NDM2MTYyMzYsInZlcnNpb24iOjIsImp0aSI6ImFmNzAwYTkxLTY0YmEtNDc0Mi1hNDAzLWYxNjA2YTViYjNmZiIsImNsaWVudF9pZCI6IjUwOWdnbjZpbmplM2k3YnNmaDYwa2E4NTRiIn0.AKXQ4Mrk8KmKTnDJFsu6PSJsFXxpr6zJEFhtSpMl62xnPB0R3fFTL40UpnaMU6iYwcOKdcpp7Wh8cwn3-_loLPBvNusBBL7iM1lBkz4rBOiOCvmmT3sBuLAW8F-6ZfF3d2uDH6k-4LM_QkM7FYvyi_fzwuvPgdHdgRbUPfEnmypnuD3Z6eM6FeDuloGNnOmg_385oMK7LOc7QWQu2wEs_qZlNsGxrKDxf_5cjfifJfcoKbKQPal0vzeKtegS7ArPgByBJ3AsZX5th-kkP6xBc7EFt15C8HYrXAyMGiLoZZn7zaeu6OXCJ3kvUMOnVIBfl_1jql4A-EOch_Ai6ipHvg'
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
    const invalidRequestQuoteJson = requestQuoteJson
    delete invalidRequestQuoteJson.pair

    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      invalidRequestQuoteJson
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
