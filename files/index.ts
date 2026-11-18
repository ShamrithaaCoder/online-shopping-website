import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: "Please sign in" }, 401);

  const { items, address } = await req.json();
  if (!Array.isArray(items) || !items.length) return json({ error: "Empty cart" }, 400);

  // Trust only DB prices, never client prices
  const ids = items.map((i: any) => i.product_id);
  const { data: products } = await admin.from("products").select("id,name,price").in("id", ids).eq("active", true);
  let rupees = 0; const lines: any[] = [];
  for (const i of items) {
    const p = products?.find((x) => x.id === i.product_id);
    const qty = Math.floor(Number(i.qty));
    if (!p || qty < 1 || qty > 10) return json({ error: "Invalid item in cart" }, 400);
    rupees += p.price * qty; lines.push({ product_id: p.id, name: p.name, price: p.price, size: i.size, qty });
  }
  if (rupees < 1999) rupees += 99; // shipping
  const amount = rupees * 100;

  const rzp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`) },
    body: JSON.stringify({ amount, currency: "INR", receipt: crypto.randomUUID().slice(0, 30) }),
  });
  const ro = await rzp.json();
  if (!rzp.ok) return json({ error: "Could not start payment" }, 502);

  const { data: order, error } = await admin.from("orders").insert({
    user_id: user.id, items: lines, amount, address, razorpay_order_id: ro.id,
  }).select("id").single();
  if (error) return json({ error: "Could not save order" }, 500);
  return json({ order_id: order.id, razorpay_order_id: ro.id, amount });
});
