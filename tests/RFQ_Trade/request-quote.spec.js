import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'
const Ajv = require('ajv')
const ajv = new Ajv()
const addFormats = require('ajv-formats')
addFormats(ajv)

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const expectedRequestQuoteResponseJson = require('../../test-data/response-json/post_quote_response_body.json')
const requestQuoteSchemaJson = require('../../test-data/response-schema/request-quote.json')

const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
let requestHeaders

test.beforeAll('Get Bearer Token', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      // `Bearer ${process.env.BEARER_TOKEN}`
      `Bearer eyJraWQiOiJBeWRrbjkrck5lSTlzdll5N3NSWjFqV3B3dGE1UlBSZTBJRXlKT0FzZHpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDlnZ242aW5qZTNpN2JzZmg2MGthODU0YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXF1YWNhbXMtZGV2XC93cml0ZSBhcXVhY2Ftcy1kZXZcL3JlYWQgY29tcGxpYW5jZVwvZGVmYXVsdCIsImF1dGhfdGltZSI6MTc0Mzk5ODc1NCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZkkxeWJTT2RDIiwiZXhwIjoxNzQ0MDAyMzU0LCJpYXQiOjE3NDM5OTg3NTQsInZlcnNpb24iOjIsImp0aSI6ImUwZWUxZWQwLWY2ZDctNDBiNC1hZjQ1LTBkZTExMTA5ZDk2MiIsImNsaWVudF9pZCI6IjUwOWdnbjZpbmplM2k3YnNmaDYwa2E4NTRiIn0.0aopRlWsf0ZZkPq26fwLUOu30otwuxVRx6fIaHIxr-R5XaTYGn787g5EmsZrt1rND_Pdcdgy4TbsMCA8zYcFgpG3CGhubypPwfKwg1hCZLx6p0q75vMTBkeI17cKts-09XWRKG7Zzl5nGGWiUdhSnGwCJitRIlZvfF7RZPASRQpaRVd0OClXPbH2QQhrYuieChV8zGTZ6yS6ifyaGY_En1Rq1RJIq355HlVlpQ7jNgelcMQNEbLmCWJiQbhAdqbj02RoTIdX-zxX0ngD2f8MEUv18jZZK3TcAjHUE0N83nu-SjtJjLrROKs-BQfZ0-u_IdbvGI6RogswHUZ8YEg-4g`
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
    const quoteId = requestQuoteResponseBody.quoteId
    const expectedRequestQuoteResponseBody = JSON.parse(
      JSON.stringify(expectedRequestQuoteResponseJson)
    )

    apiAssertions.assertThatResponseIsOk(requestQuoteResponse)
    apiAssertions.assertResponseStatus(requestQuoteResponse, 200)
    apiAssertions.assertResponseBodyHasProperty(
      requestQuoteResponseBody,
      expectedRequestQuoteResponseBody
    )
    expect(quoteId).not.toBeNull()
    expect(quoteId).not.toBe('')
    expect(quoteId).not.toBeUndefined()
  })

  test('Request Quote with missing parameter', async ({ request }) => {
    //delete 'pair' parameter from request body
    const missingParamRequestQuoteJson = { ...requestQuoteJson }
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
    const invalidRequestQuoteJson = { ...requestQuoteJson }
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
  test('Validate Request Quote response json scehma', async ({ request }) => {
    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      requestQuoteJson
    )
    const requestQuoteResponseBody = await requestQuoteResponse.json()
    apiAssertions.assertThatResponseIsOk(requestQuoteResponse)
    apiAssertions.assertResponseStatus(requestQuoteResponse, 200)

    const expectedRequestQuoteSchema = JSON.parse(
      JSON.stringify(requestQuoteSchemaJson)
    )

    // Validate the response schema with help of ajv package
    const schemaMatches = ajv.validate(
      expectedRequestQuoteSchema,
      requestQuoteResponseBody
    )

    // If the response does not match the schema, log the errors
    if (!schemaMatches) {
      console.log('Schema validation errors:', ajv.errors)
    }

    // Assert that the response body is valid according to the schema
    expect(schemaMatches).toBe(true)
  })
})
