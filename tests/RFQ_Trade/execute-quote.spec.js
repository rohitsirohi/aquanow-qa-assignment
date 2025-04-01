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
let executeQuoteRequestBody

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
})

test.describe('Execute a Quote', () => {
  test('Valid Quote Execution', async ({ request }) => {
    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      executeQuoteRequestBody
    )
    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertThatResponseIsOk(executeQuoteResponse)
    apiAssertions.assertResponseStatus(executeQuoteResponse, 200)

    const orderId = executeQuoteResponseBody.order.orderId
    expect(orderId).not.toBeNull()
    expect(orderId).not.toBe('')
    expect(orderId).not.toBeUndefined()
  })

  test('Execute Quote with invalid Quote Id', async ({ request }) => {
    //delete 'quoteId' parameter from request body and add invalid quote id
    const invalidExecuteQuoteRequestJson = executeQuoteRequestJson
    delete invalidExecuteQuoteRequestJson.quoteId
    invalidExecuteQuoteRequestJson.quoteId = invalidQuoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      executeQuoteRequestJson
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
    const invalidExecuteQuoteRequestJson = executeQuoteRequestJson
    delete invalidExecuteQuoteRequestJson.quoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      executeQuoteRequestJson
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
    const invalidExecuteQuoteRequestJson = executeQuoteRequestJson
    delete invalidExecuteQuoteRequestJson.quoteId
    invalidExecuteQuoteRequestJson.quoteId = executedQuoteId

    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      executeQuoteRequestJson
    )

    const executeQuoteResponseBody = await executeQuoteResponse.json()

    apiAssertions.assertResponseStatus(executeQuoteResponse, 409)
    apiAssertions.assertResponseErrorMessage(
      executeQuoteResponseBody,
      'Quote already accepted'
    )
  })
})
