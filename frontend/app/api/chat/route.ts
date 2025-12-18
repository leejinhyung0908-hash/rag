import { NextRequest, NextResponse } from "next/server";

type ChatRequest = {
  question: string;
  mode?: "rag" | "openai" | "rag_openai" | "rag_local" | "local";
};

type ChatResponse = {
  answer: string;
  retrieved_docs?: string[] | null;
  mode?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { question, mode = "rag_openai" } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "질문이 비어있습니다." },
        { status: 400 }
      );
    }

    // Python 백엔드 RAG API 호출
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question.trim(), mode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Next.js API] 백엔드 오류:", errorText);
      return NextResponse.json(
        {
          error: "백엔드 서버에서 오류가 발생했습니다.",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: ChatResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Next.js API] /api/chat 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

