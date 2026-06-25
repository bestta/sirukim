import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Plus, 
  Trash2, 
  Bot, 
  User, 
  Sparkles, 
  Menu, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  ChevronRight, 
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const PRESET_PROMPTS = [
  {
    title: "Penjelasan Clean Code",
    desc: "Tanyakan prinsip clean code terpenting untuk pemula.",
    prompt: "Tolong jelaskan apa itu Clean Code dalam pemrograman, sebutkan 3 prinsip terpentingnya beserta contoh kode sederhana."
  },
  {
    title: "Buat Pantun Lucu",
    desc: "Minta pantun jenaka bertema programmer atau teknologi.",
    prompt: "Buat 2 bait pantun lucu dan jenaka bertema kehidupan programmer atau bug dalam aplikasi."
  },
  {
    title: "Perbaiki Error Kode",
    desc: "Bantu temukan dan perbaiki bug dalam kode TypeScript.",
    prompt: "Saya punya kode TypeScript ini yang error: `const numbers: number[] = ['1', '2', 3];`. Kenapa ini error dan bagaimana cara memperbaikinya?"
  },
  {
    title: "Rangkum Artikel",
    desc: "Latihan merangkum artikel panjang menjadi poin padat.",
    prompt: "Rangkum konsep kecerdasan buatan (AI) saat ini menjadi 3 poin ringkas yang mudah dipahami oleh orang awam."
  }
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize sessions from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("gemini_chat_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved sessions:", e);
      }
    }
    
    // Fallback: Create a default empty session
    const defaultId = `session-${Date.now()}`;
    const defaultSession: ChatSession = {
      id: defaultId,
      title: "Percakapan Baru",
      messages: [],
      updatedAt: new Date().toISOString()
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultId);
  }, []);

  // Save sessions to LocalStorage on update
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("gemini_chat_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom when messages or generating state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isGenerating]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Create a new empty chat session
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "Percakapan Baru",
      messages: [],
      updatedAt: new Date().toISOString()
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setApiError(null);
    setIsSidebarOpen(false);
  };

  // Delete a chat session
  const handleDeleteChat = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedSessions = sessions.filter((s) => s.id !== idToDelete);
    if (updatedSessions.length === 0) {
      // Re-create a default session if all sessions are deleted
      const defaultId = `session-${Date.now()}`;
      const defaultSession: ChatSession = {
        id: defaultId,
        title: "Percakapan Baru",
        messages: [],
        updatedAt: new Date().toISOString()
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultId);
    } else {
      setSessions(updatedSessions);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(updatedSessions[0].id);
      }
    }
    setApiError(null);
  };

  // Clear current chat history
  const handleClearHistory = () => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: "Percakapan Baru",
            messages: [],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );
    setApiError(null);
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Main chat sending method with streaming output
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating || !activeSessionId) return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    // Update active session with user message
    let updatedMessages = [...(activeSession?.messages || []), userMessage];
    
    // Auto-update title if it's the first message
    let updatedTitle = activeSession?.title || "Percakapan Baru";
    if (updatedTitle === "Percakapan Baru") {
      updatedTitle = textToSend.trim().substring(0, 30) + (textToSend.length > 30 ? "..." : "");
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );

    setInput("");
    setIsGenerating(true);
    setApiError(null);

    // Add empty assistant placeholder message
    const assistantMessageId = `msg-assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, assistantPlaceholder]
          };
        }
        return s;
      })
    );

    try {
      // Send active message list payload to endpoint
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: payloadMessages,
          stream: true,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menghubungi server API. Pastikan Kunci API terpasang.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Gagal mengaktifkan text stream.");
      }

      let done = false;
      let buffer = "";
      let fullAssistantContent = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          buffer += chunkStr;

          let boundary = buffer.indexOf("\n");
          while (boundary !== -1) {
            const line = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);

            if (line.startsWith("data: ")) {
              const dataContent = line.slice(6).trim();
              if (dataContent === "[DONE]") {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  fullAssistantContent += parsed.text;

                  // Update the placeholder assistant message with accumulated text
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === activeSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((m) => {
                            if (m.id === assistantMessageId) {
                              return { ...m, content: fullAssistantContent };
                            }
                            return m;
                          })
                        };
                      }
                      return s;
                    })
                  );
                }
              } catch (e) {
                // Ignore incomplete parse due to buffer boundary
              }
            }
            boundary = buffer.indexOf("\n");
          }
        }
      }
    } catch (err: any) {
      console.error("Streaming error:", err);
      setApiError(err.message || "Terjadi kesalahan jaringan atau API Key tidak sah.");
      
      // Delete empty placeholder assistant message on immediate error
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== assistantMessageId)
            };
          }
          return s;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fafafa] text-[#1a1a1a] font-sans">
      
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
            id="sidebar-overlay"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <div 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e5e5e5] bg-white transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#e5e5e5] px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-gray-900">Gemini Chat</h1>
              <p className="text-[10px] text-gray-400 font-mono">v3.5-flash</p>
            </div>
          </div>
          <button 
            id="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Percakapan Baru
          </button>
        </div>

        {/* Saved Chats List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Riwayat Percakapan
          </div>
          <div className="space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  id={`chat-item-${session.id}`}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setApiError(null);
                    setIsSidebarOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveSessionId(session.id);
                      setApiError(null);
                      setIsSidebarOpen(false);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black ${
                    isActive 
                      ? "bg-gray-100 font-medium text-gray-900" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                    <span className="truncate pr-2">{session.title}</span>
                  </div>
                  <button
                    id={`delete-chat-btn-${session.id}`}
                    onClick={(e) => handleDeleteChat(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600 transition-opacity"
                    title="Hapus percakapan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-[#e5e5e5] bg-gray-50 p-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-gray-700">Server Terhubung</span>
          </div>
          <p className="mt-1 text-gray-400 leading-normal">
            API Key dikelola secara aman di sisi server.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        
        {/* Main Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-gray-900 truncate max-w-[200px] sm:max-w-[400px]">
                {activeSession?.title || "Percakapan Baru"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <select
                  id="model-selector-dropdown"
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setApiError(null);
                  }}
                  className="bg-transparent border-none text-[11px] font-semibold text-emerald-600 font-mono uppercase tracking-wider outline-none cursor-pointer p-0 hover:text-emerald-700 transition-colors focus:ring-0"
                >
                  <option value="gemini-3.5-flash" className="text-gray-800 bg-white normal-case font-sans">Gemini 3.5 Flash (Utama)</option>
                  <option value="gemini-3.1-flash-lite" className="text-gray-800 bg-white normal-case font-sans">Gemini 3.1 Lite (Ringan / Cadangan)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSession && activeSession.messages.length > 0 && (
              <button
                id="clear-chat-btn"
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Bersihkan Obrolan</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages and Main Arena */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            
            {/* Show API Error alerts if any */}
            {apiError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs" id="api-error-banner">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Gagal Menghubungi Model</h3>
                  <p className="mt-1 leading-relaxed">{apiError}</p>
                  <p className="mt-2 text-[10px] text-red-500 font-mono">
                    Solusi: Pastikan kunci `GEMINI_API_KEY` terpasang di menu **Settings &gt; Secrets** panel AI Studio Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Empty State Screen */}
            {(!activeSession || activeSession.messages.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center" id="empty-chat-view">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-md">
                  <Bot className="h-7 w-7 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Halo! Saya Gemini Chat</h3>
                <p className="mt-1.5 max-w-md text-xs text-gray-500 leading-relaxed">
                  Tanyakan apa saja, mulailah dengan mengetikkan pesan di bawah atau pilih salah satu inspirasi topik populer berikut ini:
                </p>

                {/* Preset Prompt Grid */}
                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {PRESET_PROMPTS.map((item, index) => (
                    <button
                      key={index}
                      id={`preset-prompt-${index}`}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="flex flex-col items-start rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-900 hover:shadow-xs active:bg-gray-50 group cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900">{item.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Thread List */
              <div className="space-y-6" id="message-thread">
                {activeSession.messages.map((msg) => {
                  const isBot = msg.role === "assistant";
                  return (
                    <div 
                      key={msg.id} 
                      id={`message-${msg.id}`}
                      className={`flex gap-3 md:gap-4 ${isBot ? "justify-start" : "justify-end"}`}
                    >
                      {/* Avatar (Left-aligned for Bot) */}
                      {isBot && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-700">
                          <Bot className="h-4.5 w-4.5" />
                        </div>
                      )}

                      {/* Chat Bubble container */}
                      <div className={`relative max-w-[85%] rounded-xl px-4 py-3 shadow-xs ${
                        isBot 
                          ? "bg-white border border-gray-200 text-gray-800" 
                          : "bg-slate-900 text-white"
                      }`}>
                        
                        {/* Copy Trigger (Visible on hover) */}
                        <div className="absolute right-2 top-2">
                          <button
                            id={`copy-btn-${msg.id}`}
                            onClick={() => handleCopyText(msg.content, msg.id)}
                            className={`rounded p-1 transition-colors ${
                              isBot 
                                ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" 
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                            title="Salin isi pesan"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="pr-5">
                          {isBot ? (
                            msg.content ? (
                              <div className="markdown-body">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              /* Streaming loading state */
                              <div className="flex items-center gap-1 py-1" id="message-streaming-loader">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                              </div>
                            )
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                          )}
                        </div>

                        {/* Message metadata / Timestamp */}
                        <div className={`mt-1.5 text-[9px] text-right ${isBot ? "text-gray-400" : "text-slate-400"}`}>
                          {msg.timestamp}
                        </div>
                      </div>

                      {/* Avatar (Right-aligned for User) */}
                      {!isBot && (
                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-slate-850 text-white">
                          <User className="h-4.5 w-4.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bot generation skeleton */}
                {isGenerating && activeSession.messages[activeSession.messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 md:gap-4 justify-start" id="thinking-loader-wrapper">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-700">
                      <Bot className="h-4.5 w-4.5 animate-spin" />
                    </div>
                    <div className="max-w-[85%] rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-medium animate-pulse">Menghubungi Gemini...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Panel Box */}
        <footer className="shrink-0 border-t border-[#e5e5e5] bg-white p-4">
          <div className="mx-auto max-w-3xl">
            <form
              id="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                id="chat-input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isGenerating ? "Sedang memproses respons..." : "Tulis pesan Anda untuk Gemini..."}
                disabled={isGenerating}
                className="w-full rounded-xl border border-gray-200 bg-[#fafafa] py-3.5 pl-4 pr-14 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:shadow-xs disabled:opacity-60"
                autoComplete="off"
              />
              
              <div className="absolute right-2 top-1.5">
                <button
                  type="submit"
                  id="send-message-btn"
                  disabled={!input.trim() || isGenerating}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white hover:bg-gray-800 active:bg-gray-900 disabled:bg-gray-100 disabled:text-gray-400 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-2 text-center text-[10px] text-gray-400">
              Obrolan didukung secara real-time oleh model <span className="font-semibold text-gray-500">{selectedModel === "gemini-3.5-flash" ? "Gemini 3.5 Flash" : "Gemini 3.1 Flash Lite"}</span>. Jika model utama sibuk (503), sistem akan otomatis mengalihkan ke model cadangan Lite untuk memastikan kelancaran respons. Seluruh pemrosesan dijamin aman dan privat di sisi server.
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
