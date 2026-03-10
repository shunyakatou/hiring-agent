async function callClaude(apiKey, system, userMsg, maxTokens) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] })
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { jobTitle, department, conditions, candidateName, resume } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const spSystem = `あなたは採用システムのプロンプトエンジニアです。採用条件から候補者の経歴書を評価するための詳細なシステムプロンプトを日本語で生成してください。必須条件の評価方法、歓迎条件の評価方法、定性的評価軸（主体性・具体性・成果の数値化など）、出力フォーマット（総合スコア/100、推薦可否:推薦する/要面談/見送り、定量評価、定性評価、懸念点）を必ず含めてください。プロンプト本文のみ出力し前置き不要。`;
    const systemPrompt = await callClaude(apiKey, spSystem, `ポジション: ${jobTitle}\n部署: ${department}\n\n採用条件:\n${conditions}`, 1000);
    const result = await callClaude(apiKey, systemPrompt, `候補者名: ${candidateName || "（未入力）"}\n\n${resume}`, 1500);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
