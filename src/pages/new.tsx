import { useState } from "react";
import Layout from "@/components/Layout";

export default function NewIntake() {
  const [form, setForm] = useState<any>({});
  const [created, setCreated] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    const customer = {
      id: form.shopify_customer_id || null,
      name: form.customer_name || null,
      phone: form.customer_phone || null,
      email: form.customer_email || null
    };
    const r = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        sortswift_order_no: form.sortswift_order_no || null,
        est_item_count: form.est_item_count ? Number(form.est_item_count) : null,
        notes: form.notes || null,
        staff_checkin: form.staff_checkin || null,
      })
    }).then(r => r.json());
    setCreated(r.trade);
    setBusy(false);
  };

  const printLabels = async () => {
    if (!created) return;
    await fetch("/api/print/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intake_id: created.intake_id,
        name: created.customer_name,
        qr_url: `${window.location.origin}/t/${created.qr_slug}`
      })
    });
    alert("Print job queued (webhook stub).");
  };

  return (
    <Layout>
      <h2 className="text-lg font-semibold mb-2">New Intake</h2>
      {!created ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" name="customer_name" placeholder="Customer name" onChange={onChange} />
            <input className="border p-2 rounded" name="customer_phone" placeholder="Phone" onChange={onChange} />
            <input className="border p-2 rounded col-span-2" name="customer_email" placeholder="Email" onChange={onChange} />
            <input className="border p-2 rounded" name="sortswift_order_no" placeholder="SortSwift #" onChange={onChange} />
            <input className="border p-2 rounded" name="est_item_count" placeholder="Rough item count" onChange={onChange} />
            <input className="border p-2 rounded" name="staff_checkin" placeholder="Staff initials" onChange={onChange} />
            <textarea className="border p-2 rounded col-span-2" name="notes" placeholder="Notes" onChange={onChange} />
          </div>
          <button disabled={busy} className="border px-4 py-2 rounded">{busy ? "Creating..." : "Create Intake"}</button>
        </form>
      ) : (
        <div className="border rounded p-4">
          <div className="font-medium">Created: {created.intake_id}</div>
          <div className="text-sm text-gray-600">Queue #{created.queue_number}</div>
          <div className="mt-4 flex gap-2">
            <a className="underline text-sm" href={`/t/${created.qr_slug}`}>Open Ticket</a>
            <button onClick={printLabels} className="border px-3 py-1 rounded text-sm">Print Labels</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
