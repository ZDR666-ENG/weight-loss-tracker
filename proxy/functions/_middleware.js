// Cloudflare Pages reverse proxy to Vercel deployment
// This file goes in proxy/functions/_middleware.js

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Target Vercel deployment
  url.hostname = "weight-loss-tracker-seven.vercel.app"

  // Create modified request with correct Host header
  const modifiedHeaders = new Headers(request.headers)
  modifiedHeaders.set("Host", "weight-loss-tracker-seven.vercel.app")

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: modifiedHeaders,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    redirect: "manual",
  })

  // Forward to Vercel
  const response = await fetch(modifiedRequest)

  // Create response with original headers
  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-encoding") // Let Cloudflare handle compression
  responseHeaders.delete("content-length")
  responseHeaders.set("x-proxied-by", "cloudflare-pages")

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}
