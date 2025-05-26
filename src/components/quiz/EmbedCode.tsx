import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

interface EmbedCodeProps {
  quizType: string;
  shareKey?: string;
}

export function EmbedCode({ quizType, shareKey }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/quiz/${quizType}${shareKey ? `?key=${shareKey}` : ''}`;
  
  const embedCode = `<iframe
  src="${embedUrl}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy embed code');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={embedUrl}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(embedUrl);
            toast.success('URL copied to clipboard!');
          }}
        >
          Copy URL
        </Button>
      </div>

      <div className="relative">
        <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{embedCode}</code>
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="text-sm text-slate-600">
        <p>Preview:</p>
        <div className="mt-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
          <iframe
            src={embedUrl}
            width="400"
            height="600"
            style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          />
        </div>
      </div>
    </div>
  );
} 