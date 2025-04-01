import { request } from '@playwright/test'

export async function post(requestUrl, requestHeaders, requestBody) {
  const requestContext = await request.newContext()
  const response = await requestContext.post(requestUrl, {
    headers: requestHeaders,
    data: requestBody,
  })
  await response.body()
  return response
}
