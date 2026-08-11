import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { load } from "cheerio"

export interface ScrapedGift {
  title: string | null
  image_url: string | null
  price: string | null
  description: string | null
}

const FETCH_TIMEOUT_MS = 8000
const MAX_BYTES = 2_000_000 // 2 MB cap on HTML we'll read
const USER_AGENT =
  "Mozilla/5.0 (compatible; FamilyGiftRegistryBot/1.0; +https://github.com/jpatrickb/family-gift-registry)"

/**
 * Returns true when the given IP address is loopback, private, link-local, or
 * otherwise not a public unicast address. Used to block SSRF against internal
 * infrastructure.
 */
function isBlockedIp(ip: string): boolean {
  const kind = isIP(ip)
  if (kind === 4) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 0) return true // 0.0.0.0/8
    if (a === 10) return true // 10.0.0.0/8
    if (a === 127) return true // loopback
    if (a === 169 && b === 254) return true // link-local
    if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
    if (a === 192 && b === 168) return true // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT 100.64.0.0/10
    if (a >= 224) return true // multicast / reserved
    return false
  }
  if (kind === 6) {
    const v = ip.toLowerCase()
    if (v === "::1" || v === "::") return true // loopback / unspecified
    if (v.startsWith("fe80")) return true // link-local
    if (v.startsWith("fc") || v.startsWith("fd")) return true // unique local
    // IPv4-mapped IPv6 (::ffff:a.b.c.d) — re-check the embedded v4 address
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isBlockedIp(mapped[1])
    return false
  }
  return true // not a recognizable IP
}

/**
 * Validates a user-supplied URL and guards against SSRF by resolving the
 * hostname and rejecting private/loopback targets. Throws on invalid input.
 */
async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new ScrapeError("That doesn't look like a valid URL.", 400)
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ScrapeError("Only http and https links are supported.", 400)
  }

  const host = url.hostname
  // Literal IPs: check directly. Hostnames: resolve then check every address.
  if (isIP(host)) {
    if (isBlockedIp(host)) {
      throw new ScrapeError("That link points to a private address.", 400)
    }
  } else {
    if (host === "localhost" || host.endsWith(".localhost")) {
      throw new ScrapeError("That link points to a private address.", 400)
    }
    let records: { address: string }[]
    try {
      records = await lookup(host, { all: true })
    } catch {
      throw new ScrapeError("Couldn't resolve that site's address.", 400)
    }
    if (records.length === 0 || records.some((r) => isBlockedIp(r.address))) {
      throw new ScrapeError("That link points to a private address.", 400)
    }
  }

  return url
}

export class ScrapeError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = "ScrapeError"
    this.status = status
  }
}

/** Reads the response body up to MAX_BYTES, decoding as UTF-8 text. */
async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return await res.text()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      total += value.length
      chunks.push(value)
      if (total >= MAX_BYTES) {
        await reader.cancel()
        break
      }
    }
  }
  return new TextDecoder("utf-8").decode(concat(chunks))
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

/** Picks the first non-empty string from the candidates, trimmed. */
function firstText(...vals: (string | undefined | null)[]): string | null {
  for (const v of vals) {
    const t = v?.trim()
    if (t) return t
  }
  return null
}

/**
 * Fetches a product page and extracts a best-effort title, image, price, and
 * description from Open Graph / Twitter Card / standard meta tags.
 */
export async function scrapeGift(rawUrl: string): Promise<ScrapedGift> {
  const url = await assertSafeUrl(rawUrl)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ScrapeError("The site took too long to respond.", 504)
    }
    throw new ScrapeError("Couldn't reach that site.", 502)
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    throw new ScrapeError(
      `The site returned an error (${res.status}). You can still enter details manually.`,
      502
    )
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("html")) {
    throw new ScrapeError("That link isn't a web page we can read.", 415)
  }

  const html = await readCapped(res)
  const $ = load(html)

  const meta = (selector: string) => $(selector).attr("content")?.trim()

  const title = firstText(
    meta('meta[property="og:title"]'),
    meta('meta[name="twitter:title"]'),
    meta('meta[name="title"]'),
    $("title").first().text(),
    $("h1").first().text()
  )

  const rawImage = firstText(
    meta('meta[property="og:image:secure_url"]'),
    meta('meta[property="og:image:url"]'),
    meta('meta[property="og:image"]'),
    meta('meta[name="twitter:image"]'),
    meta('meta[name="twitter:image:src"]'),
    $('link[rel="image_src"]').attr("href")
  )

  const description = firstText(
    meta('meta[property="og:description"]'),
    meta('meta[name="twitter:description"]'),
    meta('meta[name="description"]')
  )

  const rawPrice = firstText(
    meta('meta[property="product:price:amount"]'),
    meta('meta[property="og:price:amount"]'),
    meta('meta[itemprop="price"]'),
    $('[itemprop="price"]').attr("content"),
    $('[itemprop="price"]').first().text()
  )

  // Resolve a relative image URL against the final page URL.
  let image_url: string | null = null
  if (rawImage) {
    try {
      image_url = new URL(rawImage, res.url || url.href).href
    } catch {
      image_url = null
    }
  }

  // Normalize price to a bare number string (strip currency symbols/commas).
  let price: string | null = null
  if (rawPrice) {
    const match = rawPrice.replace(/,/g, "").match(/\d+(\.\d+)?/)
    if (match) price = match[0]
  }

  return { title, image_url, price, description }
}
