import useSWR from "swr";
import Layout from "@/components/Layout";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data: open } = useSWR("/api/trades?status=OPEN", fetcher, { refreshInterval: 5000 });
  const { data: inprog } = useSWR("/api/trades?status=IN_PROGRESS", fetcher, { refreshInterval: 5000 });
  const { data: ready } = useSWR("/api/trades?status=READY", fetcher, { refreshInterval: 5000 });

  return (
    <Layout>
      <h2 className="text-lg font-semibold mb-2">Queue</h2>
      <Section title="Open" items={open?.trades || []} />
      <Section title="In Progress" items={inprog?.trades || []} />
      <Section title="Ready" items={ready?.trades || []} />
    </Layout>
  );
}

function Section({ title, items }: any) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold">{title} ({items.length})</h3>
      <div className="space-y-2 mt-2">
        {items.map((t: any) => (
          <div key={t.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">Trade #{String(t.queue_number).padStart(3, "0")}</div>
              <div className="text-xs text-gray-600">{t.customer_name || t.customer_phone || "Guest"}</div>
            </div>
            <Link className="underline text-sm" href={`/t/${t.qr_slug}`}>Open</Link>
          </div>
        ))}
        {!items.length && <div className="text-xs text-gray-400">No tickets.</div>}
      </div>
    </div>
  );
}
