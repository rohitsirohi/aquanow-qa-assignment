import { test, expect } from '@playwright/test'
import { stringFormat } from '../../utils/common.js'

const postRequestBody = require('../../test-data/post_trade_request_body.json')
const apiAsserttions = require('../../utils/api-assertions.js')
const apiRequest = require('../../utils/api-request.js')
const bearerTokenRequestHeaders = require('../../test-data/request_headers_with_bearer_token.json')

test.describe('Request a Quote', () => {
  test('Valid Quote Request', async ({ request }) => {
    const headersWithBearerToken = stringFormat(
      JSON.stringify(bearerTokenRequestHeaders),
      `Bearer ${process.env.BEARER_TOKEN}`
    )

    // const response = await request.post(
    //   '/api/v1/quotes', {
    //   headers : {
    //     'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
    //     'Content-Type': 'application/json'
    //     // 'Accept': '*/*'
    //   },
    //     data : postRequestBody
    //   });

    // const response = await request.post(
    //   '/api/v1/quotes', {
    //   headers : JSON.parse(headersWithBearerToken),
    //     data : postRequestBody
    //   });

    const response = await apiRequest.post(
      `https://camsapi-dev.aquanow.io/api/v1/quotes`,
      JSON.parse(headersWithBearerToken),
      postRequestBody
    )

    console.log('response is ', response)
    console.log('responseBody is ', await response.json())
    // const responseBody = await response.json();
    // apiAsserttions.assertThatResponseIsOk(response);

    // expect(response.status()).toBe(200);
    // apiAsserttions.assertResponseStatus(response, 200);

    // const jsonObjectProperties = {
    //   'accountId':'82a77651-3499-4767-ac8f-f4291dde140c',
    //   'pair':'BTC-USD',
    //   'side':'BUY',
    //   'quoteQuantity':'103.06'
    // }
    // apiAsserttions.assertResponseBodyHasProperty(responseBody, jsonObjectProperties);
    // console.log('headersWithBearerToken',headersWithBearerToken)
  })
})
