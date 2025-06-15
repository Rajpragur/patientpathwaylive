export async function connectTwilio(accountSid: string, authToken: string) {
  try {
    const response = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL + '/connect-twilio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ accountSid, authToken }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}