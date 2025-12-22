"use client";

import { FormEvent, useState } from "react";

type Message = {
    id: number;
    role: "user" | "assistant";
    content: string;
};

type Mode = "rag" | "openai" | "rag_openai" | "rag_local" | "local" | "qlora";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<Mode>("rag_openai");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "assistant",
            content:
                "안녕하세요! LangChain + pgvector RAG 데모 챗봇입니다.\n무엇이든 질문해 보세요."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || isLoading) return;

        const nextId = messages.length ? messages[messages.length - 1].id + 1 : 1;
        const userMsg: Message = { id: nextId, role: "user", content: question };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            let response: Response;
            let data: any;

            // QLoRA 모드는 별도 엔드포인트 사용
            if (mode === "qlora") {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                response = await fetch(`${backendUrl}/api/chat/qlora`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        prompt: question,
                        max_new_tokens: 512,
                        temperature: 0.7,
                        top_p: 0.9,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                data = await response.json();
                const assistantMsg: Message = {
                    id: nextId + 1,
                    role: "assistant",
                    content: data.response || "응답을 생성하지 못했습니다."
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                // 기존 RAG API 호출
                response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ question, mode }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.error || `HTTP ${response.status}: ${response.statusText}`
                    );
                }

                data = await response.json();
                const assistantMsg: Message = {
                    id: nextId + 1,
                    role: "assistant",
                    content: data.answer || "응답을 생성하지 못했습니다."
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (error) {
            const assistantMsg: Message = {
                id: nextId + 1,
                role: "assistant",
                content: "죄송합니다. 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
            };
            setMessages(prev => [...prev, assistantMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <header className="border-b border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">
                            LangChain Chatbot
                        </h1>
                        <p className="text-xs text-slate-400">
                            pgvector RAG + 대화형 모드 PWA 데모
                        </p>
                    </div>
                    <span className="text-[10px] rounded-full border border-emerald-500/40 px-2 py-1 text-emerald-300 bg-emerald-500/5">
                        PWA Ready
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode("rag")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "rag"
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                    >
                        RAG만
                    </button>
                    <button
                        onClick={() => setMode("openai")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "openai"
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                    >
                        OpenAI만
                    </button>
                    <button
                        onClick={() => setMode("rag_openai")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "rag_openai"
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                    >
                        RAG + OpenAI
                    </button>
                    <button
                        onClick={() => setMode("rag_local")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "rag_local"
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                    >
                        RAG + 로컬 LLM
                    </button>
                    <button
                        onClick={() => setMode("local")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "local"
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                            }`}
                    >
                        로컬 LLM만
                    </button>
                    <button
                        onClick={() => setMode("qlora")}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${mode === "qlora"
                            ? "bg-purple-700 border-purple-600 text-slate-100"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-purple-600"
                            }`}
                    >
                        QLoRA
                    </button>
                </div>
            </header>

            <section className="flex-1 px-4 py-3 flex flex-col gap-3 max-w-3xl w-full mx-auto">
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-emerald-500 text-slate-950"
                                    : "bg-slate-800 text-slate-50"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl px-3 py-2 text-sm bg-slate-800 text-slate-300 animate-pulse">
                                생각 중입니다...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
                    <input
                        type="text"
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500"
                        placeholder="질문을 입력하세요. (예: LangChain과 pgvector로 RAG 시스템을 어떻게 만들 수 있어?)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
                    >
                        {isLoading ? "전송 중..." : "전송"}
                    </button>
                </form>
            </section>
        </main>
    );
}


