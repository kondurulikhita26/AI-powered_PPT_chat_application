# AI-Powered Chat Application with PowerPoint Generation

An intelligent chat application that generates and edits PowerPoint presentations using Google's Gemini AI. Users can create professional presentations through natural language prompts, edit slides dynamically, and export in multiple formats.

## Features

- **AI-Powered Slide Generation**: Generate professional PowerPoint slides using Google Gemini AI
- **Dynamic Slide Editing**: Edit individual slides with custom titles, content, and images
- **Image Generation**: Automatically generate relevant images for slides using Gemini's image generation
- **Configurable Slide Count**: Create presentations with 1-20 slides (user-specified)
- **Chat History**: Automatically save and restore previous presentations
- **Multiple Export Formats**:
  - PowerPoint (.pptx)
  - JSON (for backup and sharing)
  - Chat history (.txt)
- **Presentation Management**: Save, load, and delete presentations from history
- **Modern UI**: Olive green themed interface with responsive design
- **Real-time Preview**: Live slide preview with navigation

## Prerequisites

- Node.js 18+ or modern browser with Next.js support
- Google API Key with Gemini access
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Setup Instructions

### 1. Get Google API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated API key

### 2. Configure Environment Variables

In the workspace:
1. Click the **Vars** section in the left sidebar
2. Add a new variable:
   - **Name**: `GOOGLE_API_KEY`
   - **Value**: Paste your Google API key
3. Click Save

### 3. Start Using the App

The application is ready to use! No additional installation needed.

## Usage Instructions

### Creating a New Presentation

1. **Click the "+" button** in the left sidebar to start a new presentation
2. **Enter the number of slides** (1-20) in the input field
3. **Type your prompt** describing what you want in the presentation
   - Example: "Create a presentation about machine learning with 5 slides"
4. **Press Enter or click Send**
5. The AI will generate slides with:
   - Professional titles
   - Relevant content
   - Auto-generated images
   - Proper formatting

### Editing Slides

1. **Click "Edit Slide"** button in the preview panel
2. **Modify the slide content**:
   - Change the title
   - Update the content/description
   - Edit the image prompt (images regenerate automatically)
   - Change the slide layout
3. **Click Save** to apply changes

### Navigating Slides

- **Previous/Next buttons**: Navigate between slides in the preview
- **Slide counter**: Shows current slide position (e.g., "Slide 1 of 5")

### Saving Presentations

1. **Click the Save button** in the header
2. **Enter a presentation name** (e.g., "Q4 Marketing Strategy")
3. **Click Save** to store in history

### Loading Previous Presentations

1. **Click the History button** (clock icon) in the left sidebar
2. **Select a presentation** from the list
3. The presentation loads with all slides and chat history

### Exporting Presentations

1. **Click the Export menu** (three dots) in the header
2. **Choose export format**:
   - **PowerPoint**: Download as .pptx file
   - **JSON**: Export presentation data for backup
   - **Chat History**: Export conversation as text file

### Deleting Presentations

1. **In the History panel**, hover over a presentation
2. **Click the trash icon** to delete
3. Confirm deletion

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles and theme
│   └── api/
│       ├── generate-slides/     # Gemini slide generation API
│       ├── download-ppt/        # PowerPoint export API
│       ├── export-json/         # JSON export API
│       └── export-chat/         # Chat history export API
├── components/
│   ├── chat-interface.tsx       # Chat message display and input
│   ├── slide-preview.tsx        # Slide preview and navigation
│   ├── slide-editor.tsx         # Slide editing dialog
│   ├── export-menu.tsx          # Export options menu
│   └── ui/                      # shadcn/ui components
├── hooks/
│   └── use-presentation-history.ts  # Presentation history management
└── README.md                    # This file
\`\`\`

## API Endpoints

### POST /api/generate-slides
Generates slides using Gemini AI.

**Request Body:**
\`\`\`json
{
  "prompt": "Create a presentation about AI",
  "slideCount": 5,
  "previousSlides": []
}
\`\`\`

**Response:**
\`\`\`json
{
  "slides": [
    {
      "title": "Introduction to AI",
      "content": "Artificial Intelligence...",
      "imagePrompt": "futuristic AI concept",
      "imageUrl": "data:image/png;base64,...",
      "layout": "title-content"
    }
  ]
}
\`\`\`

### POST /api/download-ppt
Generates and downloads a PowerPoint file.

**Request Body:**
\`\`\`json
{
  "slides": [...]
}
\`\`\`

### POST /api/export-json
Exports presentation as JSON.

**Request Body:**
\`\`\`json
{
  "presentation": {
    "name": "My Presentation",
    "slides": [...],
    "messages": [...]
  }
}
\`\`\`

### POST /api/export-chat
Exports chat history as text.

**Request Body:**
\`\`\`json
{
  "messages": [...]
}
\`\`\`

## Key Assumptions

1. **Google API Key**: Users have a valid Google API key with Gemini access enabled
2. **Browser Storage**: Presentations are stored in browser localStorage (max ~5-10MB depending on browser)
3. **Internet Connection**: Required for AI generation and image creation
4. **Modern Browser**: Assumes ES6+ support and modern Web APIs
5. **Image Generation**: Gemini image generation is available and working with the provided API key
6. **JSON Parsing**: Assumes Gemini returns valid JSON in the response
7. **Slide Limit**: Maximum 20 slides per presentation for performance and API rate limiting
8. **Chat History**: Only stores presentations in the current browser (not synced across devices)
9. **File Size**: Exported PPT files are limited by browser memory and API constraints
10. **Rate Limiting**: Assumes reasonable usage; heavy usage may hit API rate limits

## Troubleshooting

### "API Key not found" Error
- Ensure you've added `GOOGLE_API_KEY` to the Vars section
- Verify the key is valid and not expired
- Try regenerating the key from Google AI Studio

### "JSON Parsing Error"
- This usually means the Gemini response was malformed
- Try with a simpler prompt
- Check that your API key has image generation enabled

### Slides Not Generating
- Check browser console for error messages
- Verify internet connection
- Ensure API key has sufficient quota
- Try with fewer slides (start with 3-5)

### Images Not Appearing
- Image generation may be rate-limited
- Try regenerating the slide
- Check that the image prompt is descriptive enough

### Presentation Not Saving
- Check browser localStorage is enabled
- Ensure you have enough storage space
- Try clearing old presentations from history

### Export Not Working
- Verify browser allows downloads
- Check that slides have been generated
- Try a different export format

## Performance Considerations

- **Slide Generation**: Takes 10-30 seconds depending on slide count and complexity
- **Image Generation**: Adds 5-15 seconds per slide
- **Storage**: Each presentation uses ~50-200KB in localStorage
- **Browser Limit**: Most browsers support 5-10MB localStorage

## Future Enhancements

- Cloud storage integration (Google Drive, OneDrive)
- Collaborative editing with multiple users
- Custom templates and themes
- PDF export with advanced formatting
- Slide animations and transitions
- Real-time collaboration
- Presentation analytics
- Integration with other AI models
- Offline mode with service workers
- Mobile app version

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Opera: Full support

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the debug logs in browser console (F12)
3. Verify all prerequisites are met
4. Try with a different prompt or fewer slides

## Notes

- Presentations are stored locally in your browser
- Clearing browser data will delete saved presentations
- API usage is subject to Google's rate limits and quotas
- Image generation quality depends on the descriptiveness of prompts
- Gemini model used: `gemini-2.0-flash`
