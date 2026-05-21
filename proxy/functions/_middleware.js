// Cloudflare Pages reverse proxy to Vercel deployment
export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Target Vercel deployment
  url.hostname = "weight-loss-tracker-seven.vercel.app"

  // Create modified request with correct Host header
  const modifiedHeaders = new Headers(request.headers)
  modifiedHeaders.set("Host", "weight-loss-tracker-seven.vercel.app")

  // Only include body for methods that support it
  const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"]
  const body = methodsWithBody.includes(request.method) ? request.body : undefined

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: modifiedHeaders,
    body,
    redirect: "manual",
  })

  try {
    // Forward to Vercel
    const response = await fetch(modifiedRequest)

    // Create response with original headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.delete("content-encoding")
    responseHeaders.delete("content-length")
    responseHeaders.delete("transfer-encoding")
    responseHeaders.set("x-proxied-by", "cloudflare-pages")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Proxy error",
      message: err.message,
      url: url.toString(),
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}
