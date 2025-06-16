// Configuration
const OPENAI_API_KEY = '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';
const WHISPER_API_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseButton = document.getElementById('browse-button');
const loadingSpinner = document.getElementById('loading-spinner');
const resultsSection = document.getElementById('results-section');
const summaryContent = document.getElementById('summary-content');
const actionItems = document.getElementById('action-items');
const transcriptContent = document.getElementById('transcript-content');
const slackWebhook = document.getElementById('slack-webhook');
const sendToSlack = document.getElementById('send-to-slack');

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

browseButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

sendToSlack.addEventListener('click', postToSlack);

// File Handling
async function handleFile(file) {
    if (!file.type.match('audio.*')) {
        alert('Please upload an audio file (MP3 or WAV)');
        return;
    }

    showLoading();
    try {
        const transcript = await callWhisperAPI(file);
        const { summary, tasks } = await summarizeWithOpenAI(transcript);
        
        displayResults(transcript, summary, tasks);
    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please try again.');
    } finally {
        hideLoading();
    }
}

// API Calls
async function callWhisperAPI(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');

    const response = await fetch(WHISPER_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Whisper API call failed');
    }

    const data = await response.json();
    return data.text;
}

async function summarizeWithOpenAI(transcript) {
    const prompt = `Please analyze this meeting transcript and provide:
1. A concise summary of the key points discussed
2. A list of actionable items/tasks that were mentioned

Transcript:
${transcript}`;

    const response = await fetch(OPENAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes meetings and extracts action items.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error('OpenAI API call failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response to separate summary and tasks
    const [summary, tasksText] = content.split('Action Items:');
    const tasks = tasksText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().substring(2));

    return { summary: summary.trim(), tasks };
}

async function postToSlack() {
    const webhookUrl = slackWebhook.value.trim();
    if (!webhookUrl) {
        alert('Please enter a Slack webhook URL');
        return;
    }

    const message = {
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
                    text: summaryContent.textContent
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
                    text: Array.from(actionItems.children)
                        .map(item => `• ${item.textContent}`)
                        .join('\n')
                }
            }
        ]
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error('Failed to post to Slack');
        }

        alert('Successfully posted to Slack!');
    } catch (error) {
        console.error('Error posting to Slack:', error);
        alert('Error posting to Slack. Please check your webhook URL.');
    }
}

// UI Updates
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    resultsSection.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function displayResults(transcript, summary, tasks) {
    // Display summary
    summaryContent.textContent = summary;

    // Display action items
    actionItems.innerHTML = tasks
        .map(task => `<div class="action-item">• ${task}</div>`)
        .join('');

    // Display transcript
    transcriptContent.textContent = transcript;

    // Show results section
    resultsSection.classList.remove('hidden');
} 