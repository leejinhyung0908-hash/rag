import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LangChain Chatbot",
  description: "LangChain + pgvector 기반 RAG Chatbot PWA 데모",
  manifest: "/manifest.webmanifest",
  themeColor: "#020817"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}


