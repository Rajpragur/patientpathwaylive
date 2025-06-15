import React from 'react';
import { useState } from 'react';
import { connectTwilio } from '../api/connect-twilio';

const SocialAccountsPage = () => {
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [connectingToTwilio, setConnectingToTwilio] = useState(false);

  const handleTwilioConnect = async (e: any) => {
    e.preventDefault();
    setConnectingToTwilio(true);
    try {
      const data = await connectTwilio(twilioAccountSid, twilioAuthToken);

      if (data.success) {
        console.log('Twilio connection successful:', data);
        // Display success message to the user
      } else {
        console.error('Twilio connection failed:', data);
        // Display error message to the user
      }
    } catch (error) {
      console.error('Error connecting to Twilio:', error);
      // Display error message to the user
    } finally {
      setConnectingToTwilio(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Accounts & API Connections</h1>
      <p className="text-gray-600 mb-4">Manage your connected social accounts and API connections here.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Social Accounts</h2>
        <p className="text-gray-500 mb-2">Connect and manage your social media accounts.</p>
        {/* Social Account Management UI will go here */}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">API Connections</h2>
        <p className="text-gray-500 mb-2">Manage your connections to other APIs, such as Twilio and Canva.</p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Twilio</h3>
          <form onSubmit={handleTwilioConnect}>
            <div className="mb-2">
              <label htmlFor="twilioAccountSid" className="block text-gray-700 text-sm font-bold mb-1">Account SID:</label>
              <input
                type="text"
                id="twilioAccountSid"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your Twilio Account SID"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="twilioAuthToken" className="block text-gray-700 text-sm font-bold mb-1">Auth Token:</label>
              <input
                type="password"
                id="twilioAuthToken"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your Twilio Auth Token"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={connectingToTwilio}
            >
              {connectingToTwilio ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SocialAccountsPage;