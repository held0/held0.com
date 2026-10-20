import { agentMarkdown } from "../agent-text";

// Startseite als Markdown – proxy.ts leitet "/" mit Accept: text/markdown hierher um.
export const dynamic = "force-static";

export function GET() {
  return new Response(agentMarkdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" },
  });
}
