import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scrapeUrlSchema } from "@/lib/validations"
import { scrapeGift, ScrapeError } from "@/lib/scrape"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = scrapeUrlSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid product URL." }, { status: 400 })
  }

  try {
    const scraped = await scrapeGift(parsed.data.url)
    return NextResponse.json({ scraped })
  } catch (err) {
    if (err instanceof ScrapeError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Couldn't read that page. You can still enter details manually." },
      { status: 500 }
    )
  }
}
