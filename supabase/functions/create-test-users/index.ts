import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function creates test users - no auth required as it's a setup utility
Deno.serve(async (req) => {
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
      // Solo Providers
      { email: "provider@test.com", password: "Test123!", role: "provider" as const, practiceType: "solo", clinicName: "Solo Aesthetics", city: "New York", specialty: "Botox & Fillers", neighborhood: "Manhattan" },
      { email: "provider2@test.com", password: "Test123!", role: "provider" as const, practiceType: "solo", clinicName: "Manhattan Skin Studio", city: "New York", specialty: "Laser Treatments", neighborhood: "Upper East Side" },
      { email: "provider4@test.com", password: "Test123!", role: "provider" as const, practiceType: "solo", clinicName: "Beverly Injectables", city: "Los Angeles", specialty: "Dermal Fillers", neighborhood: "Beverly Hills" },
      { email: "provider6@test.com", password: "Test123!", role: "provider" as const, practiceType: "solo", clinicName: "Radiance Clinic", city: "San Francisco", specialty: "Microneedling", neighborhood: "Pacific Heights" },
      { email: "provider8@test.com", password: "Test123!", role: "provider" as const, practiceType: "solo", clinicName: "Ageless Beauty", city: "Seattle", specialty: "PRP Therapy", neighborhood: "Capitol Hill" },
      
      // Multi-Staff Providers
      { email: "clinic@test.com", password: "Test123!", role: "provider" as const, practiceType: "multi", clinicName: "Luxe Aesthetics Clinic", city: "Los Angeles", specialty: "Medical Spa", neighborhood: "Beverly Hills" },
      { email: "provider3@test.com", password: "Test123!", role: "provider" as const, practiceType: "multi", clinicName: "Glow Med Spa", city: "Miami", specialty: "Body Contouring", neighborhood: "South Beach" },
      { email: "provider5@test.com", password: "Test123!", role: "provider" as const, practiceType: "multi", clinicName: "SkinGlow Aesthetics", city: "Chicago", specialty: "Chemical Peels", neighborhood: "Gold Coast" },
      { email: "provider7@test.com", password: "Test123!", role: "provider" as const, practiceType: "multi", clinicName: "Eternal Youth Med Spa", city: "Dallas", specialty: "Thread Lifts", neighborhood: "Highland Park" },
      
      // Regular Users
      { email: "user2@test.com", password: "Test123!", role: "user" as const, city: "New York" },
      { email: "user3@test.com", password: "Test123!", role: "user" as const, city: "Los Angeles" },
      { email: "member@test.com", password: "Test123!", role: "user" as const, city: "Seattle" },
      { email: "vip@test.com", password: "Test123!", role: "user" as const, city: "Miami" },
    ];

    const allProcedures = ["botox", "dermal-fillers", "laser-resurfacing", "morpheus8", "hydrafacial", "chemical-peel", "microneedling", "prp-therapy", "thread-lift", "ultherapy", "lip-enhancement", "ipl-photofacial"];
    const results = [];

    console.log("Starting test user creation...");

    for (const testUser of testUsers) {
      console.log(`Processing user: ${testUser.email}`);
      
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

      let userId: string;

      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: testUser.password,
        });
        userId = existingUser.id;
        console.log(`Updated existing user: ${testUser.email}`);
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
        });

        if (createError) {
          console.error(`Error creating user ${testUser.email}:`, createError.message);
          results.push({ email: testUser.email, status: "error", error: createError.message });
          continue;
        }
        userId = newUser.user.id;
        console.log(`Created new user: ${testUser.email}`);
      }

      // Upsert role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: testUser.role },
        { onConflict: "user_id,role" }
      );

      // Create provider profile and related data
      if (testUser.role === "provider") {
        const user = testUser as typeof testUser & { practiceType: string; clinicName: string; city: string; specialty: string; neighborhood: string };
        const isMultiStaff = user.practiceType === "multi";
        
        // Create provider profile
        const { data: providerProfile, error: profileError } = await supabaseAdmin.from("provider_profiles").upsert(
          {
            user_id: userId,
            clinic_name: user.clinicName,
            practice_type: isMultiStaff ? "multi_staff" : "solo",
            primary_specialty: user.specialty,
            secondary_specialties: isMultiStaff ? ["Laser Treatments", "Body Contouring", "Skincare"] : [],
            address: `${Math.floor(Math.random() * 900) + 100} Main Street`,
            city: user.city,
            phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            status: "approved",
            approved_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        ).select().single();

        if (profileError) {
          console.error(`Error creating provider profile for ${user.clinicName}:`, profileError.message);
          continue;
        }
        console.log(`Created provider profile for: ${user.clinicName}`);

        // Create provider entry in providers table
        const { error: providerError } = await supabaseAdmin.from("providers").insert({
          name: user.clinicName,
          display_name: user.clinicName,
          specialty: user.specialty,
          neighborhood: user.neighborhood,
          city: user.city,
          rating: 4.5 + Math.random() * 0.5,
          review_count: Math.floor(Math.random() * 50) + 10,
          procedures: allProcedures.slice(0, Math.floor(Math.random() * 6) + 6),
          provider_profile_id: providerProfile.id,
          base_price: Math.floor(Math.random() * 500) + 300,
        });

        if (providerError) {
          console.error(`Error creating provider entry for ${user.clinicName}:`, providerError.message);
        }

        // Create availability slots for the next 3 weeks
        const slots = [];
        const now = new Date();
        for (let day = 1; day <= 21; day++) {
          const slotDate = new Date(now);
          slotDate.setDate(slotDate.getDate() + day);
          
          // Skip weekends
          if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;
          
          // Create 3 slots per day
          for (const hour of [9, 11, 14]) {
            const startTime = new Date(slotDate);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(startTime);
            endTime.setHours(hour + 1);
            
            slots.push({
              provider_id: providerProfile.id,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              slot_type: "available",
            });
          }
        }

        const { error: slotsError } = await supabaseAdmin.from("availability_slots").insert(slots);
        if (slotsError) {
          console.error(`Error creating slots for ${user.clinicName}:`, slotsError.message);
        } else {
          console.log(`Created ${slots.length} availability slots for: ${user.clinicName}`);
        }

        results.push({ email: testUser.email, status: "created", role: testUser.role, clinic: user.clinicName });
      } else {
        // Regular user - update profile
        const user = testUser as typeof testUser & { city?: string };
        await supabaseAdmin.from("profiles").upsert(
          {
            user_id: userId,
            full_name: testUser.email.split("@")[0].replace(/[0-9]/g, "").charAt(0).toUpperCase() + testUser.email.split("@")[0].slice(1),
            location_city: user.city || "New York",
            onboarding_completed: true,
            main_concerns: ["Anti-aging", "Skin texture"],
          },
          { onConflict: "user_id" }
        );
        console.log(`Updated profile for: ${testUser.email}`);
        results.push({ email: testUser.email, status: "created", role: testUser.role });
      }
    }

    // Sync provider availability
    console.log("Syncing provider availability...");
    await supabaseAdmin.rpc("sync_all_provider_availability");
    console.log("Availability sync complete!");

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
