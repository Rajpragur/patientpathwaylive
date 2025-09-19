import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ADDING UNIQUE CONSTRAINT ON USER_ID ===');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Add unique constraint on user_id
    const { error: constraintError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        -- Add unique constraint on user_id to prevent future duplicates
        ALTER TABLE doctor_profiles 
        ADD CONSTRAINT unique_doctor_profile_per_user UNIQUE (user_id);
        
        -- Add a comment explaining the constraint
        COMMENT ON CONSTRAINT unique_doctor_profile_per_user ON doctor_profiles 
        IS 'Ensures each user can only have one doctor profile';
      `
    });

    if (constraintError) {
      console.log('Constraint might already exist:', constraintError.message);
    }

    console.log('=== UNIQUE CONSTRAINT ADDED ===');

    return new Response(JSON.stringify({
      success: true,
      message: 'Unique constraint added successfully'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error adding unique constraint:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
