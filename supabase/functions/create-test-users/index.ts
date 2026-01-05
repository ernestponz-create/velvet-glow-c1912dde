import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function creates test users with full seed data
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting test user creation...");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const testUsers = [
      // Admins
      { email: "admin@test.com", password: "Test123!", role: "admin" as const },
      { email: "admin2@test.com", password: "Test123!", role: "admin" as const },
      
      // Providers with full details
      { 
        email: "provider@test.com", password: "Test123!", role: "provider" as const, 
        practiceType: "solo", clinicName: "Velvet Aesthetics", city: "London", 
        neighborhood: "Harley Street", specialty: "Aesthetic Medicine",
        procedures: ["botox", "dermal-fillers", "hydrafacial", "chemical-peel", "lip-enhancement"],
        rating: 4.9, reviewCount: 127, basePrice: 450, yearsExp: 12
      },
      { 
        email: "clinic@test.com", password: "Test123!", role: "provider" as const, 
        practiceType: "multi_staff", clinicName: "Glow Medical Aesthetics", city: "London", 
        neighborhood: "Wimpole Street", specialty: "Dermatology",
        procedures: ["botox", "dermal-fillers", "laser-resurfacing", "morpheus8", "ipl-photofacial"],
        rating: 4.7, reviewCount: 89, basePrice: 520, yearsExp: 8
      },
      { 
        email: "provider2@test.com", password: "Test123!", role: "provider" as const, 
        practiceType: "solo", clinicName: "Elite Skin Studio", city: "London", 
        neighborhood: "Marylebone", specialty: "Cosmetic Dermatology",
        procedures: ["botox", "dermal-fillers", "hydrafacial", "thread-lift", "ultherapy"],
        rating: 4.5, reviewCount: 45, basePrice: 380, yearsExp: 6
      },
      { 
        email: "provider3@test.com", password: "Test123!", role: "provider" as const, 
        practiceType: "multi_staff", clinicName: "Radiance Skin & Beauty", city: "London", 
        neighborhood: "Chelsea", specialty: "Aesthetic Nursing",
        procedures: ["botox", "dermal-fillers", "lip-enhancement", "prp-therapy", "microneedling"],
        rating: 4.8, reviewCount: 203, basePrice: 680, yearsExp: 15
      },
      { 
        email: "provider4@test.com", password: "Test123!", role: "provider" as const, 
        practiceType: "solo", clinicName: "Pure Aesthetics Clinic", city: "Manchester", 
        neighborhood: "Spinningfields", specialty: "Non-Surgical Treatments",
        procedures: ["botox", "dermal-fillers", "chemical-peel", "microneedling"],
        rating: 4.6, reviewCount: 67, basePrice: 320, yearsExp: 5
      },
      
      // Regular Users with profiles
      { email: "user@test.com", password: "Test123!", role: "user" as const, fullName: "Sarah Johnson", city: "London" },
      { email: "user2@test.com", password: "Test123!", role: "user" as const, fullName: "Emma Williams", city: "London" },
      { email: "member@test.com", password: "Test123!", role: "user" as const, fullName: "Olivia Brown", city: "Manchester" },
      { email: "vip@test.com", password: "Test123!", role: "user" as const, fullName: "Charlotte Davis", city: "London" },
    ];

    const results = [];

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
        results.push({ email: testUser.email, status: "updated", role: testUser.role });
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
        results.push({ email: testUser.email, status: "created", role: testUser.role });
      }

      // Upsert role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: testUser.role },
        { onConflict: "user_id,role" }
      );

      // Handle provider creation
      if (testUser.role === "provider") {
        const provider = testUser as typeof testUser & { 
          practiceType: string; clinicName: string; city: string; neighborhood: string;
          specialty: string; procedures: string[]; rating: number; reviewCount: number;
          basePrice: number; yearsExp: number;
        };
        
        // Create provider profile
        const { data: providerProfile, error: profileError } = await supabaseAdmin
          .from("provider_profiles")
          .upsert({
            user_id: userId,
            clinic_name: provider.clinicName,
            practice_type: provider.practiceType === "multi_staff" ? "multi_staff" : "solo",
            primary_specialty: provider.specialty,
            secondary_specialties: provider.procedures.slice(0, 3),
            address: `${Math.floor(Math.random() * 900) + 100} ${provider.neighborhood}`,
            city: provider.city,
            phone: `+44 20 7${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
            status: "approved",
            approved_at: new Date().toISOString(),
            bio: `Expert ${provider.specialty.toLowerCase()} practice with ${provider.yearsExp} years of experience.`,
            years_in_practice: `${provider.yearsExp}+`,
          }, { onConflict: "user_id" })
          .select()
          .single();
        
        if (profileError) {
          console.error(`Error creating provider profile for ${testUser.email}:`, profileError.message);
          continue;
        }
        
        console.log(`Created provider profile for: ${provider.clinicName}`);
        
        // Create or update provider entry
        const { error: providerError } = await supabaseAdmin
          .from("providers")
          .upsert({
            name: provider.clinicName.split(' ')[0],
            display_name: provider.clinicName,
            specialty: provider.specialty,
            neighborhood: provider.neighborhood,
            city: provider.city,
            rating: provider.rating,
            review_count: provider.reviewCount,
            procedures: provider.procedures,
            years_experience: provider.yearsExp,
            base_price: provider.basePrice,
            provider_profile_id: providerProfile.id,
          }, { onConflict: "provider_profile_id" });
        
        if (providerError) {
          console.error(`Error creating provider entry for ${provider.clinicName}:`, providerError.message);
        } else {
          console.log(`Created provider entry for: ${provider.clinicName}`);
        }
        
        // Create availability slots for next 14 days
        const slots = [];
        const now = new Date();
        for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
          // Create 4-5 slots per day at different hours
          const hours = [9, 11, 14, 16];
          if (dayOffset % 2 === 0) hours.push(10); // Extra slot on even days
          
          for (const hour of hours) {
            const startTime = new Date(now);
            startTime.setDate(startTime.getDate() + dayOffset);
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
        
        // Insert slots (delete existing first)
        await supabaseAdmin
          .from("availability_slots")
          .delete()
          .eq("provider_id", providerProfile.id);
        
        const { error: slotsError } = await supabaseAdmin
          .from("availability_slots")
          .insert(slots);
        
        if (slotsError) {
          console.error(`Error creating slots for ${provider.clinicName}:`, slotsError.message);
        } else {
          console.log(`Created ${slots.length} availability slots for: ${provider.clinicName}`);
        }
      }
      
      // Handle regular user profile
      if (testUser.role === "user") {
        const user = testUser as typeof testUser & { fullName?: string; city?: string };
        await supabaseAdmin.from("profiles").upsert({
          user_id: userId,
          full_name: user.fullName || null,
          location_city: user.city || "London",
          onboarding_completed: true,
          main_concerns: ["anti-aging", "skin-texture"],
          budget_tier: user.email === "vip@test.com" ? "premium" : "moderate",
        }, { onConflict: "user_id" });
        console.log(`Updated profile for: ${testUser.email}`);
      }
    }
    
    // Sync all provider availability to update next_available dates
    console.log("Syncing provider availability...");
    await supabaseAdmin.rpc("sync_all_provider_availability");
    console.log("Availability sync complete!");

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-test-users:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
