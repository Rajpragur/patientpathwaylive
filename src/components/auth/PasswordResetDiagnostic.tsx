import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function PasswordResetDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    
    const diagnostics = [];

    // Test 1: Check Supabase client configuration
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      diagnostics.push({
        name: 'Supabase Configuration',
        status: url && key ? 'success' : 'error',
        message: url && key ? 'Environment variables are set' : 'Missing environment variables',
        details: {
          hasUrl: !!url,
          hasKey: !!key,
          urlLength: url?.length || 0,
          keyLength: key?.length || 0
        }
      });
    } catch (error) {
      diagnostics.push({
        name: 'Supabase Configuration',
        status: 'error',
        message: 'Error checking configuration',
        details: { error: error.message }
      });
    }

    // Test 2: Check current URL
    try {
      const currentUrl = window.location.origin;
      const expectedRedirect = `${currentUrl}/reset-password`;
      
      diagnostics.push({
        name: 'Current URL Configuration',
        status: 'success',
        message: `Current origin: ${currentUrl}`,
        details: {
          currentOrigin: currentUrl,
          expectedRedirectUrl: expectedRedirect,
          isHttps: currentUrl.startsWith('https://'),
          isLocalhost: currentUrl.includes('localhost')
        }
      });
    } catch (error) {
      diagnostics.push({
        name: 'Current URL Configuration',
        status: 'error',
        message: 'Error checking URL',
        details: { error: error.message }
      });
    }

    // Test 3: Test auth service availability
    try {
      const { data, error } = await supabase.auth.getSession();
      
      diagnostics.push({
        name: 'Supabase Auth Service',
        status: error ? 'warning' : 'success',
        message: error ? `Auth service accessible but error: ${error.message}` : 'Auth service is accessible',
        details: {
          hasSession: !!data?.session,
          error: error?.message || null
        }
      });
    } catch (error) {
      diagnostics.push({
        name: 'Supabase Auth Service',
        status: 'error',
        message: 'Auth service not accessible',
        details: { error: error.message }
      });
    }

    // Test 4: Check if reset password is enabled (this is a best guess)
    try {
      const currentOrigin = window.location.origin;
      const expectedRedirectUrl = `${currentOrigin}/reset-password`;
      
      diagnostics.push({
        name: 'Password Reset Configuration',
        status: 'info',
        message: 'CRITICAL: Configure redirect URLs in Supabase Dashboard',
        details: {
          currentOrigin: currentOrigin,
          expectedRedirectUrl: expectedRedirectUrl,
          instructions: [
            'Go to Supabase Dashboard → Authentication → Settings',
            'In "Site URL" field, add your domain:',
            `  • ${currentOrigin}`,
            'In "Redirect URLs" field, add:',
            `  • ${expectedRedirectUrl}`,
            'In Auth Providers → Email:',
            '  • Ensure "Confirm email" is enabled',
            '  • Ensure "Enable email confirmations" is ON',
            'Save all changes and test again'
          ],
          commonIssues: [
            'Site URL must match your domain exactly',
            'Redirect URLs must include the full reset-password path',
            'Email confirmations must be enabled',
            'Check spam folder for emails'
          ]
        }
      });
    } catch (error) {
      diagnostics.push({
        name: 'Password Reset Configuration',
        status: 'error',
        message: 'Error checking configuration',
        details: { error: error.message }
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Password Reset Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Diagnostic Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{result.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View Details
                        </summary>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🚨 CRITICAL FIX NEEDED:</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-medium">The reset link is redirecting to Supabase instead of your app because:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li><strong>Site URL</strong> is not configured in Supabase Dashboard</li>
              <li><strong>Redirect URLs</strong> are not whitelisted</li>
              <li>The redirect path is incomplete (missing /reset-password)</li>
            </ol>
            <p className="font-medium mt-3">Quick Fix Steps:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Navigate to <strong>Authentication → Settings</strong></li>
              <li>Set <strong>Site URL</strong> to: <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code></li>
              <li>Add <strong>Redirect URL</strong>: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/reset-password</code></li>
              <li>Save changes and test again</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
