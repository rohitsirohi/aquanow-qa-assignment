import { expect } from '@playwright/test'

export function assertThatResponseIsOk(response) {
  expect(response.ok()).toBeTruthy()
}

export function assertResponseStatus(response, status) {
  expect(response.status()).toBe(status)
}

export function assertResponseErrorMessage(responseBody, errorMessage) {
  expect(responseBody.error).toHaveProperty('message', errorMessage)
}

export function assertResponseBodyHasProperty(
  responseBody,
  jsonObjectProperties
) {
  for (const [key, value] of Object.entries(jsonObjectProperties)) {
    expect(responseBody).toHaveProperty(key, value)
  }
}
