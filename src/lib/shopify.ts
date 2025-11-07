import type { NextApiRequest } from "next";

const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const CREDIT_NAMESPACE = process.env.SHOPIFY_CREDIT_NAMESPACE || "cfg";
const CREDIT_KEY = process.env.SHOPIFY_CREDIT_KEY || "store_credit_cents";

if (!ADMIN_TOKEN || !STORE_DOMAIN) {
  console.warn("Shopify env missing. Admin calls will fail until configured.");
}

const baseUrl = `https://${STORE_DOMAIN}/admin/api/2024-10`;

export async function shopifyAdmin(path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

export async function searchOrCreateCustomer({ email, phone, first_name, last_name }: {
  email?: string; phone?: string; first_name?: string; last_name?: string;
}) {
  // Search by email first, then phone
  if (email) {
    const found = await shopifyAdmin(`/customers/search.json?query=email:${encodeURIComponent(email)}`);
    if (Array.isArray(found?.customers) && found.customers.length) return found.customers[0];
  }
  if (phone) {
    const found = await shopifyAdmin(`/customers/search.json?query=phone:${encodeURIComponent(phone)}`);
    if (Array.isArray(found?.customers) && found.customers.length) return found.customers[0];
  }
  // Create new
  const created = await shopifyAdmin(`/customers.json`, {
    method: "POST",
    body: JSON.stringify({
      customer: {
        email,
        phone,
        first_name,
        last_name,
        verified_email: false,
        send_email_invite: false,
      },
    }),
  });
  return created.customer;
}

export async function getCustomerMetafield(customerId: number | string) {
  const r = await shopifyAdmin(`/customers/${customerId}/metafields.json`);
  const list = r?.metafields || [];
  return list.find((m: any) => m.namespace === CREDIT_NAMESPACE && m.key === CREDIT_KEY);
}

export async function setCustomerCreditCents(customerId: number | string, cents: number) {
  const existing = await getCustomerMetafield(customerId);
  if (existing) {
    const r = await shopifyAdmin(`/metafields/${existing.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ metafield: { id: existing.id, value: String(cents), type: "number_integer" } }),
    });
    return r.metafield;
  } else {
    const r = await shopifyAdmin(`/metafields.json`, {
      method: "POST",
      body: JSON.stringify({
        metafield: {
          namespace: CREDIT_NAMESPACE,
          key: CREDIT_KEY,
          type: "number_integer",
          value: String(cents),
          owner_resource: "customer",
          owner_id: customerId
        }
      }),
    });
    return r.metafield;
  }
}
