import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase env vars are missing in /api/events");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      adId,
      eventType,    // "impression" | "click" | "conversion"
      userCountry,
      userDevice,
      revenue,
    } = body;

    if (!adId || !eventType) {
      return NextResponse.json(
        { error: "Missing adId or eventType" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("ad_events").insert({
      ad_id: adId,
      event_type: eventType,
      user_country: userCountry || null,
      user_device: userDevice || null,
      revenue: revenue ?? null,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error in /api/events:", error);
      return NextResponse.json(
        { error: "Failed to save event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API /events error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
