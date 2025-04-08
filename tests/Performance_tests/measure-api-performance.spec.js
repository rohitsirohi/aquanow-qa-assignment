import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
let requestHeaders

test.beforeAll('Get Bearer Token', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      `Bearer ${process.env.BEARER_TOKEN}`
    )
  )
})

test.describe('Measure API Performance', () => {
  test('Measure Response Time for an API Call', async ({ request }) => {
    const startTime = Date.now()
    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders`,
      requestHeaders
    )
    await getOrderDetailsResponse.json()
    // calculate response time
    const responseTime = Date.now() - startTime
    console.log(`API Response Time: ${responseTime}ms`)

    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)
    // Assert response time is below an acceptable threshold (eg. 500ms)
    expect(responseTime).toBeLessThan(500)
  })
})
