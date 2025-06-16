# TalkTrack - AI-Powered Meeting Summarizer

TalkTrack is a dual-mode application that helps you capture, transcribe, and summarize meetings using AI. It works both as a standalone web app and as a Chrome extension.

## Features

- 🎙️ Record audio from meetings
- 📝 Automatic transcription using OpenAI's Whisper
- 🧠 AI-powered meeting summaries
- ✅ Action item extraction
- 📤 Optional Slack integration
- 🌐 Works offline after first load
- 📱 Mobile-friendly design

## Web App Mode

The web app is a fully client-side application that can be used to upload and process audio files from meetings.

### Usage

1. Open `index.html` in your browser
2. Drag and drop an audio file or click to browse
3. Wait for processing
4. View transcript, summary, and action items
5. Optionally send to Slack

## Chrome Extension Mode

The Chrome extension allows you to capture audio directly from your browser tabs (e.g., Google Meet).

### Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension` folder

### Usage

1. Click the TalkTrack icon in your browser toolbar
2. Click "Start Recording" to begin capturing audio
3. Click "Stop Recording" when finished
4. View the transcript, summary, and action items
5. Optionally send to Slack

## API Keys Required

To use TalkTrack, you'll need:

1. OpenAI API key for Whisper transcription
2. OpenAI API key for GPT-4 summarization
3. (Optional) Slack webhook URL for integration

## Development

### Web App

The web app is built with:
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- React (via CDN)

### Chrome Extension

The extension uses:
- Manifest V3
- Chrome Tab Capture API
- Chrome Storage API
- Chrome Messaging API

## License

MIT License

Copyright (c) 2024 TalkTrack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 