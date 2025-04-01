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
      //   `Bearer
      //   eyJraWQiOiJBeWRrbjkrck5lSTlzdll5N3NSWjFqV3B3dGE1UlBSZTBJRXlKT0FzZHpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDlnZ242aW5qZTNpN2JzZmg2MGthODU0YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXF1YWNhbXMtZGV2XC93cml0ZSBhcXVhY2Ftcy1kZXZcL3JlYWQgY29tcGxpYW5jZVwvZGVmYXVsdCIsImF1dGhfdGltZSI6MTc0MzU0NDY3NCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZkkxeWJTT2RDIiwiZXhwIjoxNzQzNTQ4Mjc0LCJpYXQiOjE3NDM1NDQ2NzQsInZlcnNpb24iOjIsImp0aSI6IjExOWM5Njg1LTk2MGUtNGVjYy04MzUwLTc0YmQ0NTZlZmJmYyIsImNsaWVudF9pZCI6IjUwOWdnbjZpbmplM2k3YnNmaDYwa2E4NTRiIn0.TQsCBu0HUDFyyDVY7DOdlahgbEhKTChja_K4WgxSYTnwyeKSGXp036mExK9vPMIrlayqZ4240co8-jn-oybCNYqNp329u86rgVeSO7bVmzBC4idF364F6-Oh38RHBN14Vrct_OdoebrQu4q2n5e7zp3OvBTk7LlVwPB1jce61-wCC7imEagcVWNrio9ECZyspT1l71AhqI0_dbGJlIwgfZzrcgyaOdkibe-tq8__dnccqr4pfQ4f1zfpg29tieML3kIWkw2oh6h2LaMSg2DDR2AIItf1U7ehktKSF0M6ypE4309P_p8t4UYYd95LlnhvQXbnBX4ninhBHknFZyQghA
      //   `
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
      requestQuoteJson
    )

    const requestQuoteResponseBody = await requestQuoteResponse.json()
    apiAssertions.assertResponseStatus(requestQuoteResponse, 400)
    apiAssertions.assertResponseErrorMessage(
      requestQuoteResponseBody,
      'side must be one of BUY SELL'
    )
  })
})
