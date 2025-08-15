import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { getDeviceType, getDeviceSize } from '@/utils/device';

interface EmbedPreviewProps {
  embedType: 'inline' | 'button' | 'chat';
  embedUrl: string;
  quizInfo: {
    title: string;
  };
  onSizeChange: (size: { width: string; height: string }) => void;
  quizId?: string;
}

export function EmbedPreview({ embedType, embedUrl, quizInfo, onSizeChange, quizId }: EmbedPreviewProps) {
  const [showButtonIframe, setShowButtonIframe] = useState(false);
  const [showChatIframe, setShowChatIframe] = useState(false);
  const [size, setSize] = useState<'phone' | 'tablet' | 'desktop'>(getDeviceType());

  useEffect(() => {
    setShowButtonIframe(false);
    setShowChatIframe(false);
  }, [embedType, embedUrl]);

  useEffect(() => {
    onSizeChange(getDeviceSize());
  }, [size, onSizeChange]);

  const previewStyle = {
    width: getDeviceSize().width,
    height: getDeviceSize().height,
    maxWidth: '100%',
    maxHeight: '650px',
    transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
  };
  const line = `Take the ${quizId.toUpperCase()} Assessment`;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full h-[700px] bg-gray-100 border rounded-lg overflow-hidden flex items-center justify-center p-2">
        <div style={previewStyle} className="bg-white shadow-lg rounded-md overflow-auto flex flex-col">
          {embedType === 'inline' && (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              title={`${quizInfo.title} Preview`}
              frameBorder="0"
            />
          )}
          {embedType === 'button' && (
            <div className="w-full h-full flex items-center justify-center p-4">
              {showButtonIframe ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  title={`${quizInfo.title} Preview`}
                  frameBorder="0"
                />
              ) : (
                <button
                  onClick={() => setShowButtonIframe(true)}
                  style={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    fontWeight: 'bold',
                  }}
                >
                  {line}
                </button>
              )}
            </div>
          )}
          {embedType === 'chat' && (
            <div className="w-full h-full relative">
              {showChatIframe && (
                <div
                  className="absolute bottom-20 right-5 shadow-lg rounded-md"
                  style={{ width: '400px', height: '600px', maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 110px)' }}
                >
                  <iframe
                    src={embedUrl}
                    className="w-full h-full rounded-md"
                    title={`${quizInfo.title} Preview`}
                    frameBorder="0"
                  />
                </div>
              )}
              <div className="absolute bottom-5 right-5">
                <button
                  onClick={() => setShowChatIframe(!showChatIframe)}
                  style={{
                    backgroundColor: '#2563EB',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}