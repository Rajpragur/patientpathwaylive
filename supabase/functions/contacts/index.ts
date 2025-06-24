import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  try {
    const { action, doctor_id, contact, id } = await req.json();
    if (!doctor_id) throw new Error('doctor_id required');

    if (action === 'list') {
      const { data, error } = await supabase.from('contacts').select('*').eq('doctor_id', doctor_id);
      if (error) throw error;
      return new Response(JSON.stringify({ contacts: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (action === 'add') {
      const { error } = await supabase.from('contacts').insert([contact]);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    if (action === 'update') {
      if (!id) throw new Error('id required');
      const { error } = await supabase.from('contacts').update(contact).eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    if (action === 'delete') {
      if (!id) throw new Error('id required');
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}); 