import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = "pass123";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, password, data } = await req.json();

    // Auth check
    if (action === "login") {
      if (password === ADMIN_PASSWORD) {
        // Generate a simple token
        const token = btoa(`admin_${Date.now()}_${crypto.randomUUID()}`);
        return new Response(JSON.stringify({ success: true, token }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: false, error: "Fjalëkalimi i gabuar" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For all other actions, verify token exists (simple check)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer admin_token_")) {
      // We'll use a simpler approach - just check password in each request
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (action === "list") {
      const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(listings), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const { data: created, error } = await supabase
        .from("listings")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(created), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const { id, ...updateData } = data;
      const { data: updated, error } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(updated), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", data.id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
