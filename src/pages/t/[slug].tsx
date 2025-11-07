import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "@/components/Layout";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Ticket() {
  const router = useRouter();
  const { slug } = router.query;
  const { data, mutate } = useSWR(slug ? `/api/tickets/${slug}` : null, fetcher, { refreshInterval: 2000 });
  const trade = data?.trade;
  const [cash, setCash] = useState<string>("");
  const [credit, setCredit] = useState<string>("");

  const patch = async (body: any) => {
    await fetch(`/api/trades/${trade.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    mutate();
  };

  const markReady = async () => {
    await fetch(`/api/trades/${trade.id}/ready`, { method: "POST" });
    mutate();
  };

  const payCash = async () => {
    await fetch(`/api/trades/${trade.id}/pay_cash`, { method: "POST" });
    mutate();
  };

  const payCredit = async () => {
    const r = await fetch(`/api/trades/${trade.id}/pay_credit`, { method: "POST" }).then(r => r.json());
    if (r.error) alert(r.error);
    mutate();
  };

  if (!trade) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600">Trade #{String(trade.queue_number).padStart(3,"0")} · {trade.intake_id}</div>
          <div className="text-lg font-semibold">{trade.customer_name || trade.customer_phone || "Guest"}</div>
        </div>
        <div className="text-xs px-2 py-1 rounded border">{trade.status}</div>
      </div>

      <div className="space-y-4">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-700">Values</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input className="border p-2 rounded" placeholder="Cash $" value={cash} onChange={e=>setCash(e.target.value)} />
            <input className="border p-2 rounded" placeholder="Store Credit $" value={credit} onChange={e=>setCredit(e.target.value)} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="border px-3 py-1 rounded text-sm" onClick={()=>patch({ cash_value_cents: Math.round((parseFloat(cash)||0)*100), credit_value_cents: Math.round((parseFloat(credit)||0)*100) })}>Save Values</button>
            <button className="border px-3 py-1 rounded text-sm" onClick={markReady}>Mark READY</button>
          </div>
        </div>

        {trade.status === "READY" && (
          <div className="border rounded p-3">
            <div className="text-sm">Payout</div>
            <div className="mt-2 flex gap-2">
              <button className="border px-3 py-1 rounded text-sm" onClick={payCash}>Pay CASH</button>
              <button className="border px-3 py-1 rounded text-sm" onClick={payCredit}>Add STORE CREDIT</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
