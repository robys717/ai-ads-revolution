import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Errore Supabase GET:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      dailyBudget: Number(c.daily_budget || 0),
      createdAt: c.created_at,
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, dailyBudget } = body;

  if (!name || dailyBudget == null) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name,
      status: "Attiva",
      daily_budget: Number(dailyBudget),
    })
    .select()
    .single();

  if (error) {
    console.error("Errore Supabase POST:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      id: data.id,
      name: data.name,
      status: data.status,
      dailyBudget: Number(data.daily_budget || 0),
      createdAt: data.created_at,
    },
    { status: 201 }
  );
}
