// UI Initialization
const startBtn = document.getElementById('startBtn');
const heroSection = document.getElementById('heroSection');
const appSection = document.getElementById('appSection');
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// --- Mobile Menu Logic ---
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    mobileMenu.classList.toggle('active');
    mobileMenuBtn.innerText = mobileMenu.classList.contains('active') ? '✖' : '☰';
});

document.addEventListener('click', (event) => {
    if (mobileMenu.classList.contains('active') && !mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.innerText = '☰';
    }
});

// --- Navigation & Routing ---
function goToWorkspace(initialMessage = null) {
    heroSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    
    mobileMenu.classList.remove('active');
    mobileMenuBtn.innerText = '☰';
    
    if (initialMessage) {
        userInput.value = initialMessage;
        sendMessage();
    } else {
        userInput.focus();
    }
}

startBtn.addEventListener('click', () => goToWorkspace(null));

document.getElementById('navHome').addEventListener('click', navigateHome);
document.getElementById('navHomeMobile').addEventListener('click', navigateHome);

function navigateHome() {
    appSection.classList.add('hidden');
    heroSection.classList.remove('hidden');
    mobileMenu.classList.remove('active');
    mobileMenuBtn.innerText = '☰';
}

// Interactive Tag Clicks
document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => goToWorkspace(tag.innerText));
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = '56px';
});

// --- Chat Logic ---
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    if (sender === 'bot') {
        bubble.innerHTML = marked.parse(text); // Use marked.js for bot replies
    } else {
        bubble.innerText = text;
    }
    
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = '56px';
    
    showTyping();
    userInput.disabled = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        removeTyping();
        appendMessage(data.reply, 'bot');

    } catch (error) {
        removeTyping();
        appendMessage("I'm having trouble connecting to the network. Please try again.", 'bot');
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});