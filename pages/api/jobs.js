const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY;
const headers = { "apikey": KEY, "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" };

export default async function handler(req, res) {
  if (req.method === "GET") {
    const r = await fetch(`${URL}/rest/v1/jobs?select=*&order=created_at.desc`, { headers });
    res.json(await r.json());

  } else if (req.method === "POST") {
    const { title, department, conditions } = req.body;
    const r = await fetch(`${URL}/rest/v1/jobs`, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=representation" },
      body: JSON.stringify({ title, department, conditions })
    });
    const data = await r.json();
    res.json(data[0]);

  } else if (req.method === "DELETE") {
    const { id } = req.query;
    await fetch(`${URL}/rest/v1/jobs?id=eq.${id}`, { method: "DELETE", headers });
    res.json({ success: true });
  }
}
