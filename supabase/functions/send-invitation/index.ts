// supabase/functions/send-invitation/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type GroupRole = "admin" | "chef_de_partie" | "commis";
type ReqBody = { email: string; workGroupId: string; role: GroupRole };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client "user" (pour lire le JWT)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = authData.user.id;

    const body = (await req.json()) as Partial<ReqBody>;
    const email = (body.email ?? "").trim().toLowerCase();
    const workGroupId = (body.workGroupId ?? "").trim();
    const role = body.role as GroupRole;

    if (!email || !workGroupId || !role) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["admin", "chef_de_partie", "commis"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client service role (pour bypass RLS côté insert)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // (Optionnel mais conseillé) : vérifier que l'appelant est admin du groupe
    const { data: membership, error: memErr } = await supabaseAdmin
      .from("group_members")
      .select("role")
      .eq("work_group_id", workGroupId)
      .eq("user_id", callerId)
      .maybeSingle();

    if (memErr) throw memErr;
    if (!membership || membership.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Génère un token unique
    const token = crypto.randomUUID();

    // Insert invitation (work_group orienté)
    const { data: ins, error: insErr } = await supabaseAdmin
      .from("invitations")
      .insert({
  work_group_id: workGroupId,
  email,
  role,
  token
})
      .select("id, token, email, role, work_group_id, created_at")
      .single();

    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, invitation: ins }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-invitation error:", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (RESEND_API_KEY) {
  // URL PROD
  const inviteUrl = `https://www.kitchnpro.com/invite/${token}`;

  const from = "KITCH’N <invite@kitchnpro.com>"; // domaine à vérifier sur Resend

  const subject = `Invitation à rejoindre KITCH’N`;
  const html = `
    <div style="font-family:system-ui;line-height:1.5">
      <h2>Invitation KITCH’N</h2>
      <p>Tu as été invité à rejoindre un groupe sur KITCH’N.</p>
      <p><b>Email invité :</b> ${email}</p>
      <p>
        <a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;border-radius:12px;background:#f59e0b;color:#0b1220;text-decoration:none;font-weight:700">
          Accepter l’invitation
        </a>
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">
        Si tu n’es pas connecté, connecte-toi / crée un compte avec cet email puis reviens sur ce lien.
      </p>
    </div>
  `;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    console.error("Resend error:", r.status, txt);
  }
} else {
  console.warn("Missing RESEND_API_KEY, skipping email send.");
}
});