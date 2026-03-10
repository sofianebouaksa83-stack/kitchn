// supabase/functions/delete-account/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
      console.error("Missing env vars", {
        hasUrl: !!SUPABASE_URL,
        hasAnon: !!SUPABASE_ANON_KEY,
        hasService: !!SERVICE_ROLE_KEY,
      });

      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    console.log("Authorization header present:", !!authHeader);

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();

    console.log("getUser result:", {
      hasUser: !!userData?.user,
      userErr: userErr?.message ?? null,
    });

    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: userErr?.message ?? null,
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = userData.user.id;
    console.log("Deleting account for user:", userId);

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: rpcErr } = await supabaseAdmin.rpc("delete_user_account", {
      p_user: userId,
    });

    console.log("RPC result:", {
      rpcError: rpcErr?.message ?? null,
    });

    if (rpcErr) {
      return new Response(
        JSON.stringify({
          error: "RPC delete_user_account failed",
          details: rpcErr.message,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    console.log("Delete auth user result:", {
      delError: delErr?.message ?? null,
    });

    if (delErr) {
      return new Response(
        JSON.stringify({
          error: "Auth user deletion failed",
          details: delErr.message,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("delete-account fatal error:", e);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});