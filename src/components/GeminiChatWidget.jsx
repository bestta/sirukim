import React, { useMemo, useState } from 'react';
import { Bot, MessageCircle, Minimize2, X } from 'lucide-react';

export default function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const chatUrl = useMemo(() => {
    const byEnv = import.meta.env.VITE_GEMINI_CHAT_URL;
    if (byEnv && String(byEnv).trim().length > 0) {
      return String(byEnv).trim();
    }
    return 'http://localhost:5174';
  }, []);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-white shadow-lg shadow-orange-500/35 transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label="Buka Chatbot Gemini"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">Tanya Bang Doel</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[70] w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-3 py-2 text-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold">Gemini Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                title="Minimalkan"
                aria-label="Minimalkan chatbot"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsLoaded(false);
                }}
                className="rounded p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                title="Tutup"
                aria-label="Tutup chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isLoaded && (
            <div className="grid h-[70vh] max-h-[620px] min-h-[460px] place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">
              Menghubungkan ke Gemini Chat...
            </div>
          )}

          <iframe
            src={chatUrl}
            title="Gemini Chat Embedded"
            className={`h-[70vh] max-h-[620px] min-h-[460px] w-full ${isLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setIsLoaded(true)}
          />

          {isLoaded && (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">
              Sumber: {chatUrl}
            </div>
          )}
        </div>
      )}
    </>
  );
}
