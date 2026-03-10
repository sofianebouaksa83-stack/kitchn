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
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    // client user
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

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // vérifier que l'appelant est admin
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

    // token invitation
    const token = crypto.randomUUID();

    const { data: ins, error: insErr } = await supabaseAdmin
      .from("invitations")
      .insert({
        work_group_id: workGroupId,
        email,
        role,
        token,
      })
      .select("id, token, email, role, work_group_id, created_at")
      .single();

    if (insErr) throw insErr;

    // lien invitation
    const inviteLink = `https://www.kitchnpro.com/#/invitation/${token}`;

    // HTML email
    const html = `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h2>Invitation Kitch'n</h2>
        <p>Tu as été invité à rejoindre un groupe de travail.</p>

        <a href="${inviteLink}"
        style="
        display:inline-block;
        padding:12px 18px;
        background:#f59e0b;
        color:#111;
        text-decoration:none;
        border-radius:8px;
        font-weight:700;">
        Rejoindre le groupe
        </a>

        <p style="margin-top:16px;font-size:12px;color:#666">
        Si le bouton ne fonctionne pas, copie ce lien :
        <br/>
        ${inviteLink}
        </p>
      </div>
    `;

    // envoi email Resend
    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kitch'n <invitation@kitchnpro.com>",
        to: [email],
        subject: "Invitation à rejoindre Kitch'n",
        html,
      }),
    });

    const resendData = await resend.json();

    if (!resend.ok) {
      console.error("Resend error:", resendData);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        invitation: ins,
        email: resendData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("send-invitation error:", e);

    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});