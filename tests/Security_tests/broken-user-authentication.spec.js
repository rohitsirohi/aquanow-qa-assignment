import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')

const invalidCredentials = Buffer.from(`username:password`).toString('base64')
const expiredBearerToken = `eyJraWQiOiJBeWRrbjkrck5lSTlzdll5N3NSWjFqV3B3dGE1UlBSZTBJRXlKT0FzZHpBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDlnZ242aW5qZTNpN2JzZmg2MGthODU0YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXF1YWNhbXMtZGV2XC93cml0ZSBhcXVhY2Ftcy1kZXZcL3JlYWQgY29tcGxpYW5jZVwvZGVmYXVsdCIsImF1dGhfdGltZSI6MTc0Mzk5ODc1NCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfZkkxeWJTT2RDIiwiZXhwIjoxNzQ0MDAyMzU0LCJpYXQiOjE3NDM5OTg3NTQsInZlcnNpb24iOjIsImp0aSI6ImUwZWUxZWQwLWY2ZDctNDBiNC1hZjQ1LTBkZTExMTA5ZDk2MiIsImNsaWVudF9pZCI6IjUwOWdnbjZpbmplM2k3YnNmaDYwa2E4NTRiIn0.0aopRlWsf0ZZkPq26fwLUOu30otwuxVRx6fIaHIxr-R5XaTYGn787g5EmsZrt1rND_Pdcdgy4TbsMCA8zYcFgpG3CGhubypPwfKwg1hCZLx6p0q75vMTBkeI17cKts-09XWRKG7Zzl5nGGWiUdhSnGwCJitRIlZvfF7RZPASRQpaRVd0OClXPbH2QQhrYuieChV8zGTZ6yS6ifyaGY_En1Rq1RJIq355HlVlpQ7jNgelcMQNEbLmCWJiQbhAdqbj02RoTIdX-zxX0ngD2f8MEUv18jZZK3TcAjHUE0N83nu-SjtJjLrROKs-BQfZ0-u_IdbvGI6RogswHUZ8YEg-4g`

test.describe('Broken User Authentication', () => {
  test('Invalid username or password', async ({ request }) => {
    const getTokenResponse = await request.post(process.env.API_TOKEN_URL, {
      headers: {
        Authorization: `Basic ${invalidCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        grant_type: 'client_credentials',
      },
    })
    const getTokenResponseBody = await getTokenResponse.json()
    apiAssertions.assertResponseStatus(getTokenResponse, 400)
    expect(getTokenResponseBody).toHaveProperty('error', 'invalid_client')
  })

  test('Request Quote using expired Bearer Token', async ({ request }) => {
    const requestHeaders = JSON.parse(
      stringFormat(
        JSON.stringify(requestHeadersJson),
        `Bearer ${expiredBearerToken}`
      )
    )
    const requestQuoteResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      requestQuoteJson
    )
    const requestQuoteResponseBody = await requestQuoteResponse.json()
    apiAssertions.assertResponseStatus(requestQuoteResponse, 401)
    apiAssertions.assertResponseErrorMessage(
      requestQuoteResponseBody,
      'Unauthorized'
    )
  })

  test.skip('Account Lockout After Multiple Failed Bearer Token Attempts', async ({
    request,
  }) => {
    const requestHeaders = JSON.parse(
      stringFormat(
        JSON.stringify(requestHeadersJson),
        `Bearer ${expiredBearerToken}`
      )
    )
    // Attempt 5 times to access the endpoint with an invalid bearer token
    for (let i = 0; i < 5; i++) {
      const requestQuoteResponse = await apiRequest.post(
        '/api/v1/quotes',
        requestHeaders,
        requestQuoteJson
      )
      const requestQuoteResponseBody = await requestQuoteResponse.json()
      apiAssertions.assertResponseStatus(requestQuoteResponse, 401)
      apiAssertions.assertResponseErrorMessage(
        requestQuoteResponseBody,
        'Unauthorized'
      )
    }

    // After 5 failed attempts, the account should be locked out
    const lockResponse = await apiRequest.post(
      '/api/v1/quotes',
      requestHeaders,
      requestQuoteJson
    )

    // Expect the account to be locked
    expect(lockResponse.status()).toBe(403) // Forbidden (Account locked)
    const lockResponseBody = await lockResponse.json()
    expect(lockResponseBody).toHaveProperty(
      'message',
      'Account is locked due to too many failed attempts.'
    )
  })
})
