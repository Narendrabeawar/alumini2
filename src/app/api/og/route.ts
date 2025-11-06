import { ImageResponse } from "next/og";

export const runtime = "edge";

// Preload a font for consistent rendering
const interRegular = fetch(
  new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa-BE.ttf"),
).then((res) => res.arrayBuffer());

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Alumni Directory";
  const subtitle = searchParams.get("subtitle") || "Connect with your fellow alumni";

  const fontData = await interRegular;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.95 }}>{subtitle}</div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                height: 40,
                width: 40,
                borderRadius: 8,
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div style={{ fontSize: 22, opacity: 0.9 }}>Alumni Directory</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}


