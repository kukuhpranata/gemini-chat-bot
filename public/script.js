const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const thinkingMessage = chatBox.lastChild;
    if (thinkingMessage && thinkingMessage.classList.contains('bot') && thinkingMessage.textContent.includes('thinking')) {
      chatBox.removeChild(thinkingMessage);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get a valid error response from the server.' }));
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
    }

    const data = await response.json();
    appendMessage('bot', data.reply);

  } catch (error) {
    console.error('Error sending message to bot:', error);
    const lastBotMessage = Array.from(chatBox.querySelectorAll('.message.bot')).pop();
    if (lastBotMessage && lastBotMessage.textContent.includes('thinking...')) {
      lastBotMessage.textContent = 'Sorry, something went wrong. Please try again.';
    } else {
      appendMessage('bot', 'Sorry, something went wrong. Please try again.');
    }
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
