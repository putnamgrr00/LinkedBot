// Application state
let currentUser = null;
let currentBotId = null;
let bots = [];
let uploadedFiles = [];
let addedUrls = [];

// Sample data for initialization
const sampleData = {
    sampleBots: [
        {
            id: "bot-1",
            name: "Customer Support Bot",
            status: "Active",
            createdDate: "2025-10-01",
            welcomeMessage: "Hi! I'm here to help with any questions about our products and services.",
            behavior: "Customer Support",
            persona: "Friendly and professional support agent",
            apiKey: "sk-*********************",
            model: "gpt-3.5-turbo",
            maxTokens: 500,
            dailyLimit: 1000,
            leadCollection: true,
            sources: ["product-faq.pdf", "support-guide.docx"],
            urls: [],
            leadFields: ["Name", "Email"],
            embedCode: `<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/widget.js';
  script.setAttribute('data-chatbot-id', 'bot-1');
  script.setAttribute('data-position', 'bottom-right');
  document.head.appendChild(script);
})();
</script>`
        },
        {
            id: "bot-2", 
            name: "Lead Generation Bot",
            status: "Active",
            createdDate: "2025-09-28",
            welcomeMessage: "Welcome! I'd love to learn more about how we can help your business grow.",
            behavior: "Lead Generation",
            persona: "Enthusiastic sales representative",
            apiKey: "sk-*********************",
            model: "gpt-4",
            maxTokens: 800,
            dailyLimit: 500,
            leadCollection: true,
            sources: ["services-overview.txt", "case-studies.pdf"],
            urls: ["https://example.com/services"],
            leadFields: ["Name", "Email", "Company"],
            embedCode: `<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/widget.js';
  script.setAttribute('data-chatbot-id', 'bot-2');
  script.setAttribute('data-position', 'bottom-right');
  document.head.appendChild(script);
})();
</script>`
        }
    ]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage or use sample data
    const storedBots = localStorage.getItem('chatbots');
    if (storedBots) {
        bots = JSON.parse(storedBots);
    } else {
        bots = [...sampleData.sampleBots];
        saveBots();
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    } else {
        showLogin();
    }

    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('email').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });

    // Dashboard
    document.getElementById('createBotBtn').addEventListener('click', () => createNewBot());
    document.querySelector('.create-first-bot').addEventListener('click', () => createNewBot());
    document.getElementById('backToDashboard').addEventListener('click', showDashboard);

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Form elements
    document.getElementById('welcomeMessage').addEventListener('input', updateCharCount);
    document.getElementById('maxTokens').addEventListener('input', updateTokenValue);
    document.getElementById('toggleApiKey').addEventListener('click', togglePasswordVisibility);
    document.getElementById('enableLeadCollection').addEventListener('change', toggleLeadOptions);
    document.getElementById('emailNotifications').addEventListener('change', toggleEmailNotifications);

    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // URL management
    document.getElementById('addUrlBtn').addEventListener('click', addUrl);
    document.getElementById('urlInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addUrl();
    });

    // Form actions
    document.getElementById('saveBotBtn').addEventListener('click', saveBot);
    document.getElementById('cancelBtn').addEventListener('click', showDashboard);

    // Embed code
    document.getElementById('copyEmbedCode').addEventListener('click', copyEmbedCode);
    document.getElementById('widgetPosition').addEventListener('change', updateEmbedCode);
    document.getElementById('widgetSize').addEventListener('change', updateEmbedCode);

    // Modal
    document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);

    // Form inputs that trigger preview updates
    document.getElementById('botName').addEventListener('input', updatePreview);
    document.getElementById('welcomeMessage').addEventListener('input', updatePreview);
}

// Authentication
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        currentUser = { email, name: email.split('@')[0] };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        alert('Please enter both email and password');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Screen Management
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('botForm').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('botForm').classList.add('hidden');
    renderDashboard();
}

function showBotForm() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('botForm').classList.remove('hidden');
}

// Dashboard
function renderDashboard() {
    const botsGrid = document.getElementById('botsGrid');
    const emptyState = document.getElementById('emptyState');

    if (bots.length === 0) {
        botsGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        botsGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        botsGrid.innerHTML = bots.map(bot => `
            <div class="bot-card">
                <div class="bot-card-header">
                    <div>
                        <h3>${bot.name}</h3>
                        <div class="bot-status">${bot.status}</div>
                    </div>
                </div>
                <div class="bot-card-meta">
                    Created: ${formatDate(bot.createdDate)}
                </div>
                <div class="bot-card-actions">
                    <button class="btn btn--outline btn--sm" onclick="editBot('${bot.id}')">Edit</button>
                    <button class="btn btn--outline btn--sm" onclick="showEmbedCode('${bot.id}')">Embed</button>
                    <button class="btn btn--danger btn--sm" onclick="showDeleteModal('${bot.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Bot Management
function createNewBot() {
    currentBotId = null;
    clearForm();
    document.getElementById('formTitle').textContent = 'Create Chatbot';
    showBotForm();
    switchTab('basic');
}

function editBot(botId) {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    currentBotId = botId;
    populateForm(bot);
    document.getElementById('formTitle').textContent = 'Edit Chatbot';
    showBotForm();
    switchTab('basic');
}

function clearForm() {
    document.getElementById('botName').value = '';
    document.getElementById('welcomeMessage').value = '';
    document.getElementById('behaviorGoal').value = '';
    document.getElementById('botPersona').value = '';
    document.getElementById('primaryGoal').value = '';
    document.getElementById('behaviorInstructions').value = '';
    document.getElementById('blockedTopics').value = '';
    document.getElementById('apiKey').value = '';
    document.getElementById('modelSelection').value = 'gpt-3.5-turbo';
    document.getElementById('maxTokens').value = 500;
    document.getElementById('dailyLimit').value = 1000;
    document.getElementById('enableLeadCollection').checked = false;
    document.getElementById('emailNotifications').checked = false;
    document.getElementById('notificationEmail').value = '';
    
    // Clear checkboxes
    document.querySelectorAll('input[name="leadFields"]').forEach(cb => cb.checked = false);
    
    // Clear uploaded files and URLs
    uploadedFiles = [];
    addedUrls = [];
    updateFilesList();
    updateUrlsList();
    
    updateCharCount();
    updateTokenValue();
    toggleLeadOptions();
    updatePreview();
}

function populateForm(bot) {
    document.getElementById('botName').value = bot.name || '';
    document.getElementById('welcomeMessage').value = bot.welcomeMessage || '';
    document.getElementById('behaviorGoal').value = bot.behavior || '';
    document.getElementById('botPersona').value = bot.persona || '';
    document.getElementById('behaviorInstructions').value = bot.instructions || '';
    document.getElementById('blockedTopics').value = bot.blockedTopics || '';
    document.getElementById('apiKey').value = bot.apiKey || '';
    document.getElementById('modelSelection').value = bot.model || 'gpt-3.5-turbo';
    document.getElementById('maxTokens').value = bot.maxTokens || 500;
    document.getElementById('dailyLimit').value = bot.dailyLimit || 1000;
    document.getElementById('enableLeadCollection').checked = bot.leadCollection || false;
    document.getElementById('emailNotifications').checked = bot.emailNotifications || false;
    document.getElementById('notificationEmail').value = bot.notificationEmail || '';

    // Set lead form fields
    if (bot.leadFields) {
        document.querySelectorAll('input[name="leadFields"]').forEach(cb => {
            cb.checked = bot.leadFields.includes(cb.value);
        });
    }

    // Set sources and URLs
    uploadedFiles = bot.sources ? bot.sources.map(name => ({ name })) : [];
    addedUrls = bot.urls ? bot.urls.slice() : [];
    
    updateFilesList();
    updateUrlsList();
    updateCharCount();
    updateTokenValue();
    toggleLeadOptions();
    updatePreview();
    updateEmbedCode();
}

function saveBot() {
    const botName = document.getElementById('botName').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!botName || !apiKey) {
        alert('Bot name and API key are required');
        return;
    }

    const botData = {
        id: currentBotId || generateId(),
        name: botName,
        status: 'Active',
        createdDate: currentBotId ? bots.find(b => b.id === currentBotId).createdDate : new Date().toISOString().split('T')[0],
        welcomeMessage: document.getElementById('welcomeMessage').value,
        behavior: document.getElementById('behaviorGoal').value,
        persona: document.getElementById('botPersona').value,
        primaryGoal: document.getElementById('primaryGoal').value,
        instructions: document.getElementById('behaviorInstructions').value,
        blockedTopics: document.getElementById('blockedTopics').value,
        apiKey: apiKey,
        model: document.getElementById('modelSelection').value,
        maxTokens: parseInt(document.getElementById('maxTokens').value),
        dailyLimit: parseInt(document.getElementById('dailyLimit').value),
        leadCollection: document.getElementById('enableLeadCollection').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        notificationEmail: document.getElementById('notificationEmail').value,
        leadFields: Array.from(document.querySelectorAll('input[name="leadFields"]:checked')).map(cb => cb.value),
        sources: uploadedFiles.map(file => file.name),
        urls: addedUrls.slice(),
        embedCode: generateEmbedCode(currentBotId || generateId())
    };

    if (currentBotId) {
        const index = bots.findIndex(b => b.id === currentBotId);
        bots[index] = botData;
    } else {
        bots.push(botData);
    }

    saveBots();
    showDashboard();
}

function showDeleteModal(botId) {
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('confirmDelete').onclick = () => deleteBot(botId);
}

function hideDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function deleteBot(botId) {
    bots = bots.filter(bot => bot.id !== botId);
    saveBots();
    hideDeleteModal();
    renderDashboard();
}

// Tab Management
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === tabName + 'Tab');
    });

    // Special handling for embed tab
    if (tabName === 'embed') {
        updateEmbedCode();
        updatePreview();
    }
}

// File Management
function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.target.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

function addFiles(files) {
    const validTypes = ['.pdf', '.docx', '.txt', '.csv'];
    
    files.forEach(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (validTypes.includes(extension)) {
            uploadedFiles.push({ name: file.name, size: file.size });
        }
    });
    
    updateFilesList();
}

function updateFilesList() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <span class="file-name">${file.name}</span>
            <button class="btn btn--outline btn--sm" onclick="removeFile(${index})">Remove</button>
        </div>
    `).join('');
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilesList();
}

// URL Management
function addUrl() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (url && isValidUrl(url)) {
        if (!addedUrls.includes(url)) {
            addedUrls.push(url);
            updateUrlsList();
            urlInput.value = '';
        }
    } else {
        alert('Please enter a valid URL');
    }
}

function updateUrlsList() {
    const container = document.getElementById('addedUrls');
    container.innerHTML = addedUrls.map((url, index) => `
        <div class="url-item">
            <span class="url-name">${url}</span>
            <button class="btn btn--outline btn--sm" onclick="removeUrl(${index})">Remove</button>
        </div>
    `).join('');
}

function removeUrl(index) {
    addedUrls.splice(index, 1);
    updateUrlsList();
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Form Helpers
function updateCharCount() {
    const textarea = document.getElementById('welcomeMessage');
    const charCount = document.querySelector('.char-count');
    const length = textarea.value.length;
    charCount.textContent = `${length}/250`;
    
    if (length > 250) {
        charCount.style.color = '#dc2626';
    } else {
        charCount.style.color = '#666666';
    }
}

function updateTokenValue() {
    const slider = document.getElementById('maxTokens');
    const display = document.getElementById('tokenValue');
    display.textContent = slider.value;
}

function togglePasswordVisibility() {
    const input = document.getElementById('apiKey');
    const button = document.getElementById('toggleApiKey');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function toggleLeadOptions() {
    const enabled = document.getElementById('enableLeadCollection').checked;
    const options = document.getElementById('leadFormOptions');
    options.style.display = enabled ? 'block' : 'none';
}

function toggleEmailNotifications() {
    const enabled = document.getElementById('emailNotifications').checked;
    const emailGroup = document.getElementById('notificationEmailGroup');
    emailGroup.style.display = enabled ? 'block' : 'none';
}

// Embed Code Management
function generateEmbedCode(botId) {
    const position = document.getElementById('widgetPosition')?.value || 'bottom-right';
    const size = document.getElementById('widgetSize')?.value || 'medium';
    
    return `<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://your-domain.com/widget.js';
  script.setAttribute('data-chatbot-id', '${botId}');
  script.setAttribute('data-position', '${position}');
  script.setAttribute('data-size', '${size}');
  document.head.appendChild(script);
})();
</script>`;
}

function updateEmbedCode() {
    const botId = currentBotId || 'new-bot-id';
    const embedCode = generateEmbedCode(botId);
    const codeElement = document.getElementById('embedCode');
    if (codeElement) {
        codeElement.textContent = embedCode;
    }
}

function copyEmbedCode() {
    const codeElement = document.getElementById('embedCode');
    const text = codeElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const button = document.getElementById('copyEmbedCode');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function showEmbedCode(botId) {
    const bot = bots.find(b => b.id === botId);
    if (bot) {
        alert(`Embed code for ${bot.name}:\n\n${bot.embedCode}`);
    }
}

// Preview Management
function updatePreview() {
    const botName = document.getElementById('botName').value || 'Chatbot';
    const welcomeMessage = document.getElementById('welcomeMessage').value || 'Hi! How can I help you today?';
    
    document.getElementById('previewBotName').textContent = botName;
    document.getElementById('previewWelcomeMessage').textContent = welcomeMessage;
}

// Utility Functions
function generateId() {
    return 'bot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function saveBots() {
    localStorage.setItem('chatbots', JSON.stringify(bots));
}

// Export functions for global access
window.editBot = editBot;
window.showEmbedCode = showEmbedCode;
window.showDeleteModal = showDeleteModal;
window.deleteBot = deleteBot;
window.removeFile = removeFile;
window.removeUrl = removeUrl;