export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { accountSid, authToken } = req.body;

      const response = await fetch(process.env.SUPABASE_FUNCTION_URL + '/connect-twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ accountSid, authToken }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}