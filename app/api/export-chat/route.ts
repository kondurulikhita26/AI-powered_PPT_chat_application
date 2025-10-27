import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { presentationName, messages } = await request.json()

    // Format messages as readable text
    const chatText = messages
      .map((m: any) => {
        const timestamp = m.timestamp instanceof Date ? m.timestamp.toLocaleString() : m.timestamp
        const role = m.role === "user" ? "You" : "AI"
        return `[${timestamp}] ${role}:\n${m.content}\n`
      })
      .join("\n---\n\n")

    const content = `Chat History - ${presentationName}
Generated: ${new Date().toLocaleString()}

${chatText}`

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${presentationName}-chat.txt"`,
      },
    })
  } catch (error) {
    console.error("Error exporting chat:", error)
    return NextResponse.json(
      { error: "Failed to export chat", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
