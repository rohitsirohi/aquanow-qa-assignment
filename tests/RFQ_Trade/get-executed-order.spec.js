import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'
const Ajv = require('ajv')
const ajv = new Ajv()
const addFormats = require('ajv-formats')
addFormats(ajv)

const requestHeadersJson = require('../../test-data/request-json/request_headers.json')
const requestQuoteJson = require('../../test-data/request-json/post_quote_request_body.json')
const expectedGetOrderResponseJson = require('../../test-data/response-json/get_order_repsonse_body.json')
const executeQuoteRequestJson = require('../../test-data/request-json/execute_quote_request_body.json')
const apiAssertions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
const getOrderSchemaJson = require('../../test-data/response-schema/get-order.json')
const getOrdersSchemaJson = require('../../test-data/response-schema/get-orders.json')

let requestHeaders
let quoteId
let orderId
const invalidOrderId = '77c75471-c06a-4946-a927-14fef79715e0'

test.beforeAll('Get Bearer Token', async () => {
  requestHeaders = JSON.parse(
    stringFormat(
      JSON.stringify(requestHeadersJson),
      `Bearer ${process.env.BEARER_TOKEN}`
    )
  )
})

test.beforeEach('Get quote id and order id', async () => {
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
  await test.step('Get Order Id', async () => {
    const executeQuoteRequest = { ...executeQuoteRequestJson }
    const executeQuoteResponse = await apiRequest.post(
      '/api/v1/orders',
      requestHeaders,
      stringFormat(JSON.stringify(executeQuoteRequest), quoteId)
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

  test('Assert if order exists in list of orders', async ({ request }) => {
    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders`,
      requestHeaders
    )

    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertThatResponseIsOk(getOrderDetailsResponse)
    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)

    expect(getOrderDetailsResponseBody.items).toBeDefined()
    const orderFound = getOrderDetailsResponseBody.items.some(
      (item) => item.orderId === orderId
    )
    expect(orderFound).toBe(true)
  })

  test('Validate Get Order response json scehma', async ({ request }) => {
    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders/${orderId}`,
      requestHeaders
    )
    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertThatResponseIsOk(getOrderDetailsResponse)
    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)

    const expectedGetOrderSchemaJson = JSON.parse(
      JSON.stringify(getOrderSchemaJson)
    )

    // Validate the response schema with help of ajv package
    const schemaMatches = ajv.validate(
      expectedGetOrderSchemaJson,
      getOrderDetailsResponseBody
    )

    // If the response does not match the schema, log the errors
    if (!schemaMatches) {
      console.log('Schema validation errors:', ajv.errors)
    }

    // Assert that the response body is valid according to the schema
    expect(schemaMatches).toBe(true)
  })

  test('Validate Get Order list response json scehma', async ({ request }) => {
    const getOrderDetailsResponse = await apiRequest.get(
      `/api/v1/orders`,
      requestHeaders
    )
    const getOrderDetailsResponseBody = await getOrderDetailsResponse.json()

    apiAssertions.assertThatResponseIsOk(getOrderDetailsResponse)
    apiAssertions.assertResponseStatus(getOrderDetailsResponse, 200)

    const expectedGetOrdersSchemaJson = JSON.parse(
      JSON.stringify(getOrdersSchemaJson)
    )

    // Validate the response schema with help of ajv package
    const schemaMatches = ajv.validate(
      expectedGetOrdersSchemaJson,
      getOrderDetailsResponseBody
    )

    // If the response does not match the schema, log the errors
    if (!schemaMatches) {
      console.log('Schema validation errors:', ajv.errors)
    }

    // Assert that the response body is valid according to the schema
    expect(schemaMatches).toBe(true)
  })
})
