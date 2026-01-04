import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function creates test users - no auth required as it's a setup utility
Deno.serve(async (req) => {
  // Allow unauthenticated access for setup purposes
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const testUsers = [
      { email: "admin@test.com", password: "Test123!", role: "admin" as const },
      { email: "provider@test.com", password: "Test123!", role: "provider" as const },
      { email: "user@test.com", password: "Test123!", role: "user" as const },
    ];

    const results = [];

    for (const testUser of testUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

      let userId: string;

      if (existingUser) {
        // Update password for existing user
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: testUser.password,
        });
        userId = existingUser.id;
        results.push({ email: testUser.email, status: "updated", role: testUser.role });
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
        });

        if (createError) {
          results.push({ email: testUser.email, status: "error", error: createError.message });
          continue;
        }
        userId = newUser.user.id;
        results.push({ email: testUser.email, status: "created", role: testUser.role });
      }

      // Upsert role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: testUser.role },
        { onConflict: "user_id,role" }
      );

      // Create provider profile if provider role
      if (testUser.role === "provider") {
        await supabaseAdmin.from("provider_profiles").upsert(
          {
            user_id: userId,
            clinic_name: "Test Provider Clinic",
            practice_type: "solo",
            primary_specialty: "Botox & Fillers",
            address: "456 Test Street",
            city: "New York",
            phone: "(555) 987-6543",
            status: "approved",
            approved_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
