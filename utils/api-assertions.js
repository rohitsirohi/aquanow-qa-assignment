import { expect } from '@playwright/test'

export function assertThatResponseIsOk(response) {
  expect.soft(response.ok()).toBeTruthy()
}

export function assertResponseStatus(response, status) {
  expect.soft(response.status()).toBe(status)
}

export function assertResponseErrorMessage(responseBody, errorMessage) {
  expect.soft(responseBody.error).toHaveProperty('message', errorMessage)
}

export function assertResponseBodyHasProperty(
  responseBody,
  jsonObjectProperties
) {
  for (const [key, value] of Object.entries(jsonObjectProperties)) {
    expect.soft(responseBody).toHaveProperty(key, value)
  }
}
