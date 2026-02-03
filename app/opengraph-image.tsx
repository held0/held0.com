import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Niklas Held - Software Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f0f0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        {/* Window */}
        <div
          style={{
            background: "#1a1a1a",
            margin: 40,
            borderRadius: 16,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 40,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 12, marginBottom: 60 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#28c840",
              }}
            />
          </div>

          {/* Terminal content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontSize: 36 }}>
              <span style={{ color: "#22d3ee" }}>$</span>
              <span style={{ color: "#e5e5e5", marginLeft: 12 }}>whoami</span>
            </div>

            <div
              style={{
                fontSize: 64,
                fontWeight: "bold",
                color: "#e5e5e5",
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              Niklas Held
            </div>

            <div style={{ fontSize: 32, color: "#737373" }}>
              Software Developer
            </div>

            <div
              style={{ display: "flex", fontSize: 36, marginTop: 60 }}
            >
              <span style={{ color: "#22d3ee" }}>$</span>
              <span style={{ color: "#e5e5e5", marginLeft: 12 }}>_</span>
            </div>
          </div>

          {/* Domain */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 60,
              fontSize: 28,
              color: "#737373",
            }}
          >
            held0.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
