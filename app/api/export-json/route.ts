import { type NextRequest, NextResponse } from "next/server"

interface ExportData {
  name: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  slides: Array<{
    title: string
    content: string
    layout: string
  }>
  exportedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { presentationName, messages, slides } = await request.json()

    const exportData: ExportData = {
      name: presentationName,
      messages: messages.map((m: any) => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      })),
      slides,
      exportedAt: new Date().toISOString(),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${presentationName}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting JSON:", error)
    return NextResponse.json(
      { error: "Failed to export JSON", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
