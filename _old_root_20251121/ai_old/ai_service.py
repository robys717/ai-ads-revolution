from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Ads Advisor")

class Point(BaseModel):
    channel: str
    date: str
    impressions: int
    clicks: int
    spend: float
    conversions: int
    revenue: float
    hour: int
    campaign_id: str

@app.get("/api/health")
def health():
    return {"ok": True, "service": "ai-advisor"}

@app.post("/advise")
def advise(points: List[Point]):
    ctr, cpc = {}, {}
    for p in points:
        ctr.setdefault(p.channel, []).append(p.clicks / max(p.impressions, 1))
        cpc.setdefault(p.channel, []).append(p.spend / max(p.clicks, 1) if p.clicks else 1e9)
    avg_ctr = {k: sum(v)/len(v) for k,v in ctr.items()}
    avg_cpc = {k: sum(v)/len(v) for k,v in cpc.items()}
    best = max(avg_ctr, key=avg_ctr.get)
    worst = max(avg_cpc, key=avg_cpc.get)
    advice = []
    if best != worst:
        advice.append(f"Sposta ~15% budget da {worst} a {best}")
    advice.append(f"Miglior CTR: {best} ({avg_ctr[best]:.2%})")
    advice.append(f"Peggior CPC: {worst} (€{avg_cpc[worst]:.2f})")
    return {"advice": advice}
