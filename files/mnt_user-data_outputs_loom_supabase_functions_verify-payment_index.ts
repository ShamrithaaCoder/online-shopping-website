import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return json({ error: "Please sign in" }, 401);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(Deno.env.get("RAZORPAY_KEY_SECRET")!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`));
  const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expected !== razorpay_signature) return json({ ok: false }, 400);

  const { error } = await admin.from("orders").update({ status: "paid", razorpay_payment_id })
    .eq("id", order_id).eq("user_id", user.id).eq("razorpay_order_id", razorpay_order_id);
  return json({ ok: !error });
});
