// API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';

// Get API key from storage
async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['openaiKey'], (result) => {
            resolve(result.openaiKey || '');
        });
    });
}

// Validate API key
async function validateApiKey(apiKey) {
    if (!apiKey) {
        throw new Error('OpenAI API key not set');
    }

    try {
        const response = await fetch(`${OPENAI_API_URL}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid API key');
        }

        return true;
    } catch (error) {
        console.error('API key validation failed:', error);
        throw error;
    }
}

// Whisper API Integration
async function transcribeAudio(base64Audio) {
    const apiKey = await getApiKey();
    await validateApiKey(apiKey);

    try {
        // Convert base64 to blob
        const byteCharacters = atob(base64Audio);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const audioBlob = new Blob([byteArray], { type: 'audio/webm' });

        // Create form data
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');

        const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transcription failed');
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
}

// GPT-4 Integration
async function processWithGPT(transcript) {
    const apiKey = await getApiKey();
    await validateApiKey(apiKey);

    if (!transcript) {
        throw new Error('No transcript provided');
    }

    try {
        const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a meeting summarizer. Extract key points and action items from the transcript.
                                Format the response as JSON with two fields:
                                - summary: A concise summary of the meeting
                                - actions: An array of action items, each starting with a verb`
                    },
                    {
                        role: 'user',
                        content: transcript
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Summarization failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
            const result = JSON.parse(content);
            if (!result.summary || !Array.isArray(result.actions)) {
                throw new Error('Invalid response format');
            }
            return result;
        } catch (error) {
            console.error('Failed to parse GPT response:', error);
            throw new Error('Failed to parse AI response');
        }
    } catch (error) {
        console.error('GPT processing error:', error);
        throw error;
    }
}

// Slack Integration
async function sendToSlack(webhookUrl, summary, actions) {
    if (!webhookUrl) {
        throw new Error('Slack webhook URL not set');
    }

    if (!summary || !actions) {
        throw new Error('Missing summary or action items');
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '📝 Meeting Summary'
                        }
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: summary
                        }
                    },
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '✅ Action Items'
                        }
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: actions.map(action => `• ${action}`).join('\n')
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send to Slack');
        }
    } catch (error) {
        console.error('Slack integration error:', error);
        throw error;
    }
}

// Offline Support
const CACHE_NAME = 'talktrack-cache-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/js/api.js',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/babel-standalone@6/babel.min.js'
];

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registration successful');
            return registration;
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
            throw error;
        }
    }
}

// Cache Management
async function cacheResources() {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(CACHE_URLS);
        console.log('Resources cached successfully');
    } catch (error) {
        console.error('Cache failed:', error);
        throw error;
    }
}

// Export functions
export {
    transcribeAudio,
    processWithGPT,
    sendToSlack,
    validateApiKey,
    registerServiceWorker,
    cacheResources
}; 