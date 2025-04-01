import { PlaywrightTestConfig, request, expect } from '@playwright/test'

async function globalSetup(config: PlaywrightTestConfig) {
  await setBearerToken()
}

async function setBearerToken() {
  const username = process.env.USERNAME
  const password = process.env.PASSWORD
  const url = process.env.API_TOKEN_URL ?? ''
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')

  // Make the POST request to get the Bearer token
  const requestContext = await request.newContext()
  const response = await requestContext.post(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      grant_type: 'client_credentials',
    },
  })

  const responseBody = await response.json()
  expect(response.status()).toBe(200)

  // Set the Bearer token from the response
  process.env.BEARER_TOKEN = responseBody.access_token
}

export default globalSetup
