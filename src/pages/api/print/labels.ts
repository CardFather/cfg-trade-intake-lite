import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { intake_id, name, qr_url } = req.body || {};
  // TODO: forward to BarcodeMan/PrintNode webhook configured by env
  // await fetch(process.env.BARCODEMAN_WEBHOOK_URL!, { method: "POST", body: JSON.stringify({intake_id, name, qr_url})})
  return res.json({ ok: true });
}
