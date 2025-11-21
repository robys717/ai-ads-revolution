import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productDescription, goal, language } = await req.json();

    if (!productDescription || typeof productDescription !== "string") {
      return NextResponse.json(
        { error: "Descrizione prodotto mancante." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY non configurata nel server." },
        { status: 500 }
      );
    }

    const finalLanguage = language || "italiano";
    const finalGoal = goal || "aumentare le vendite";

    const prompt = `
Sei un esperto di advertising online e copywriting per e-commerce.
Genera annunci sponsorizzati efficaci per questo prodotto.

Lingua: ${finalLanguage}
Obiettivo campagna: ${finalGoal}

Descrizione prodotto:
"""${productDescription}"""

Genera:
- 3 titoli brevi e ad alto impatto (max 60 caratteri)
- 3 descrizioni (max 180 caratteri)
- 3 call to action suggerite

Formatta la risposta in modo chiaro con sezioni:
TITOLI:
1) ...
2) ...
3) ...

DESCRIZIONI:
1) ...
2) ...
3) ...

CALL TO ACTION:
1) ...
2) ...
3) ...
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Sei un assistente specializzato in advertising e copywriting per campagne sponsorizzate.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      let details = "";
      try {
        const errJson = await response.json();
        details =
          errJson?.error?.message ||
          JSON.stringify(errJson);
      } catch {
        details = await response.text();
      }

      console.error("Errore OpenAI:", response.status, details);

      return NextResponse.json(
        {
          error: `Errore OpenAI (${response.status}): ${details}`,
        },
        { status: 500 }
      );
    }

    const json = await response.json();
    const content =
      json.choices?.[0]?.message?.content ||
      "Non è stato possibile generare suggerimenti al momento.";

    return NextResponse.json({ result: content });
  } catch (err) {
    console.error("Errore API /api/ai/generate-copy:", err);
    return NextResponse.json(
      { error: "Errore imprevisto nella generazione AI." },
      { status: 500 }
    );
  }
}
