type ChatRequest = {
  question: string;
  mode?: "rag" | "openai" | "rag_openai" | "rag_local" | "local";
};

type ChatResponse = {
  answer: string;
  retrieved_docs?: string[] | null;
  mode?: string;
};

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { question, mode = "rag_openai" } = body;

    if (!question || !question.trim()) {
      return Response.json(
        { error: "질문이 비어있습니다." },
        { status: 400 }
      );
    }

    // Python 백엔드 RAG API 호출
    // 로컬 개발: .env.local에서 NEXT_PUBLIC_API_URL=http://localhost:8000 설정
    // Vercel 배포: Dashboard → Settings → Environment Variables에서 설정 필수
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // 디버깅을 위한 로그 (Vercel 함수 로그에서 확인 가능)
    console.log("[Next.js API] NEXT_PUBLIC_API_URL env:", process.env.NEXT_PUBLIC_API_URL);
    console.log("[Next.js API] BACKEND_URL (사용 중):", backendUrl);

    // Vercel 배포 환경에서 localhost 사용 시 경고
    if (backendUrl.includes("localhost") && process.env.VERCEL) {
      console.error("[Next.js API] ⚠️ 경고: Vercel 배포 환경에서 localhost를 사용하고 있습니다!");
      console.error("[Next.js API] Vercel Dashboard → Settings → Environment Variables에서 NEXT_PUBLIC_API_URL을 EC2 IP로 설정해주세요.");
    }
    console.log("[Next.js API] 요청 모드:", mode);
    console.log("[Next.js API] 요청 질문:", question.substring(0, 50) + "...");

    const requestUrl = `${backendUrl}/api/chat`;
    console.log("[Next.js API] 요청 URL:", requestUrl);

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.trim(), mode }),
        // 타임아웃 설정 (30초)
        signal: AbortSignal.timeout(30000),
      });

      console.log("[Next.js API] 응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Next.js API] 백엔드 오류:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        return Response.json(
          {
            error: "백엔드 서버에서 오류가 발생했습니다.",
            details: errorText,
            status: response.status,
          },
          { status: response.status }
        );
      }

      const data: ChatResponse = await response.json();
      console.log("[Next.js API] 응답 성공");
      return Response.json(data);
    } catch (fetchError) {
      // fetch 자체가 실패한 경우 (네트워크 오류, 타임아웃 등)
      console.error("[Next.js API] 백엔드 연결 실패:", {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        name: fetchError instanceof Error ? fetchError.name : "Unknown",
        backendUrl,
      });

      return Response.json(
        {
          error: "백엔드 서버에 연결할 수 없습니다.",
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
          backendUrl: backendUrl, // 디버깅을 위해 URL 포함
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[Next.js API] /api/chat 오류:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return Response.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

