import { SITE } from "../agent-text";

export const dynamic = "force-static";

// KI-Crawler ausdrücklich erlaubt; interne Pfade (Healthcheck, Deploy-Button, Design-Varianten) gesperrt.
const aiBots = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User",
  "Claude-SearchBot", "PerplexityBot", "Google-Extended",
];
const disallow = ["/up", "/__deploy/", "/varianten"].map((p) => `Disallow: ${p}`).join("\n");

const body = `# Projektliste von Niklas Held. Kurzfassung für KI-Assistenten: ${SITE}/llms.txt
# Project list of Niklas Held. Summary for AI assistants: ${SITE}/llms.txt

User-agent: *
Allow: /
${disallow}

${aiBots.map((bot) => `User-agent: ${bot}`).join("\n")}
Allow: /
${disallow}

Sitemap: ${SITE}/sitemap.xml
`;

export function GET() {
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
