// Chatbot Builder Application
class ChatbotBuilder {
    constructor() {
        this.currentUser = null;
        this.bots = [];
        this.currentBot = null;
        this.uploadedFiles = [];
        this.scrapedUrls = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.checkAuth();
        this.initChatWidget();
    }

    // Data Management
    loadData() {
        const storedBots = localStorage.getItem('chatbots');
        if (storedBots) {
            this.bots = JSON.parse(storedBots);
        } else {
            // Initialize with sample bot
            this.bots = [{
                id: 'bot-001',
                name: 'Customer Support Assistant',
                status: 'active',
                created: '2025-10-01',
                welcomeMessage: 'Hi! I\'m here to help with your questions about our products and services.',
                behavior: 'professional_support',
                persona: 'Friendly and knowledgeable support agent',
                instructions: 'Always be polite and helpful. Ask for contact information when appropriate.',
                apiModel: 'gpt-3.5-turbo',
                maxTokens: 500,
                dailyLimit: 1000,
                trainingFiles: ['product-faq.pdf', 'support-guide.docx'],
                urls: ['https://company.com/help', 'https://company.com/faq'],
                leadCollection: true,
                emailNotifications: true,
                conversations: 247,
                leads: 32,
                openaiKey: 'sk-demo123...'
            }];
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('chatbots', JSON.stringify(this.bots));
    }

    // Authentication
    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    login(email, password) {
        // Demo authentication
        if (email === 'admin@demo.com' && password === 'demo123') {
            this.currentUser = { email: email, name: 'Demo User' };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showDashboard();
            this.showNotification('Welcome back!', 'success');
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLogin();
        this.showNotification('Logged out successfully', 'success');
    }

    // UI Management
    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        this.renderDashboard();
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show requested section
        document.getElementById(sectionId).classList.remove('hidden');
    }

    // Dashboard Rendering
    renderDashboard() {
        this.updateStats();
        this.renderBots();
        this.showSection('dashboardOverview');
    }

    updateStats() {
        const totalBots = this.bots.length;
        const totalChats = this.bots.reduce((sum, bot) => sum + (bot.conversations || 0), 0);
        const totalLeads = this.bots.reduce((sum, bot) => sum + (bot.leads || 0), 0);

        document.getElementById('totalBots').textContent = totalBots;
        document.getElementById('totalChats').textContent = totalChats;
        document.getElementById('totalLeads').textContent = totalLeads;
    }

    renderBots() {
        const botsGrid = document.getElementById('botsGrid');
        
        if (this.bots.length === 0) {
            botsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No chatbots yet</h3>
                    <p>Create your first AI assistant to get started</p>
                    <button class="btn btn--primary btn--chunky" onclick="app.showBotCreation()">
                        Create Your First Bot
                    </button>
                </div>
            `;
            return;
        }

        botsGrid.innerHTML = this.bots.map(bot => `
            <div class="bot-card">
                <div class="bot-header">
                    <h3 class="bot-name">${bot.name}</h3>
                    <span class="bot-status bot-status--${bot.status}">${bot.status}</span>
                </div>
                <div class="bot-info">
                    <div class="bot-metric">
                        <span class="bot-metric-label">Conversations:</span>
                        <span class="bot-metric-value">${bot.conversations || 0}</span>
                    </div>
                    <div class="bot-metric">
                        <span class="bot-metric-label">Leads Collected:</span>
                        <span class="bot-metric-value">${bot.leads || 0}</span>
                    </div>
                    <div class="bot-metric">
                        <span class="bot-metric-label">Created:</span>
                        <span class="bot-metric-value">${bot.created}</span>
                    </div>
                </div>
                <div class="bot-actions">
                    <button class="btn btn--secondary btn--sm" onclick="app.manageBot('${bot.id}')">
                        Manage
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="app.generateEmbed('${bot.id}')">
                        Get Code
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="app.deleteBot('${bot.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Bot Management
    showBotCreation() {
        this.showSection('botCreation');
        this.resetBotForm();
        this.updateEmbedCode();
    }

    resetBotForm() {
        document.getElementById('botCreationForm').reset();
        this.uploadedFiles = [];
        this.scrapedUrls = [];
        this.updateFileList();
        this.updateUrlList();
        this.switchTab('basic');
    }

    manageBot(botId) {
        this.currentBot = this.bots.find(bot => bot.id === botId);
        if (this.currentBot) {
            this.showSection('botManagement');
            this.renderBotManagement();
        }
    }

    renderBotManagement() {
        // Update management interface with current bot data
        const statusToggle = document.getElementById('botStatus');
        if (statusToggle) {
            statusToggle.checked = this.currentBot.status === 'active';
        }
    }

    deleteBot(botId) {
        if (confirm('Are you sure you want to delete this chatbot?')) {
            this.bots = this.bots.filter(bot => bot.id !== botId);
            this.saveData();
            this.renderDashboard();
            this.showNotification('Chatbot deleted successfully', 'success');
        }
    }

    createBot(formData) {
        const newBot = {
            id: 'bot-' + Date.now(),
            name: formData.get('botName'),
            status: 'active',
            created: new Date().toISOString().split('T')[0],
            welcomeMessage: formData.get('welcomeMessage'),
            persona: formData.get('persona'),
            instructions: formData.get('instructions'),
            apiModel: formData.get('aiModel'),
            maxTokens: parseInt(formData.get('maxTokens')),
            dailyLimit: 1000,
            trainingFiles: [...this.uploadedFiles],
            urls: [...this.scrapedUrls],
            leadCollection: formData.get('collectLeads') === 'on',
            emailNotifications: true,
            conversations: 0,
            leads: 0,
            openaiKey: formData.get('openaiKey')
        };

        this.bots.push(newBot);
        this.saveData();
        this.showSection('dashboardOverview');
        this.renderDashboard();
        this.showNotification('Chatbot created successfully!', 'success');
    }

    // File Upload Handling
    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                });
            }
        });
        this.updateFileList();
    }

    validateFile(file) {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('File type not supported. Please upload PDF, DOCX, TXT, or CSV files.', 'error');
            return false;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showNotification('File too large. Please upload files smaller than 10MB.', 'error');
            return false;
        }
        
        return true;
    }

    updateFileList() {
        const container = document.getElementById('uploadedFiles');
        container.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item">
                <span class="file-name">${file.name} (${this.formatFileSize(file.size)})</span>
                <button class="remove-btn" onclick="app.removeFile(${index})">Remove</button>
            </div>
        `).join('');
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.updateFileList();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // URL Scraping
    addUrl(url) {
        if (this.validateUrl(url)) {
            this.scrapedUrls.push(url);
            this.updateUrlList();
            document.getElementById('urlInput').value = '';
        }
    }

    validateUrl(url) {
        try {
            new URL(url);
            if (this.scrapedUrls.includes(url)) {
                this.showNotification('URL already added', 'error');
                return false;
            }
            return true;
        } catch {
            this.showNotification('Please enter a valid URL', 'error');
            return false;
        }
    }

    updateUrlList() {
        const container = document.getElementById('addedUrls');
        container.innerHTML = this.scrapedUrls.map((url, index) => `
            <div class="url-item">
                <span class="url-text">${url}</span>
                <button class="remove-btn" onclick="app.removeUrl(${index})">Remove</button>
            </div>
        `).join('');
    }

    removeUrl(index) {
        this.scrapedUrls.splice(index, 1);
        this.updateUrlList();
    }

    // Embed Code Generation
    generateEmbed(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (bot) {
            const embedCode = this.createEmbedCode(bot);
            navigator.clipboard.writeText(embedCode).then(() => {
                this.showNotification('Embed code copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = embedCode;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showNotification('Embed code copied to clipboard!', 'success');
            });
        }
    }

    createEmbedCode(bot) {
        return `<!-- Chatbot Widget -->
<script>
(function() {
    var chatbot = {
        botId: '${bot.id}',
        botName: '${bot.name}',
        welcomeMessage: '${bot.welcomeMessage}',
        apiEndpoint: 'https://your-netlify-site.netlify.app/.netlify/functions/chatbot-api',
        
        init: function() {
            this.createWidget();
            this.bindEvents();
        },
        
        createWidget: function() {
            var widget = document.createElement('div');
            widget.innerHTML = \`
                <div id="chatbot-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; font-family: Inter, sans-serif;">
                    <div id="chat-toggle" style="background: #218D8D; color: white; border: 2px solid #000; border-radius: 50px; padding: 12px 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <span style="font-size: 18px;">💬</span>
                        <span>Chat with us!</span>
                    </div>
                    <div id="chat-window" style="position: absolute; bottom: 70px; right: 0; width: 350px; height: 450px; background: white; border: 3px solid #000; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); display: none; flex-direction: column; overflow: hidden;">
                        <div style="background: #218D8D; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000;">
                            <h4 style="margin: 0; font-size: 16px; font-weight: bold;">\${this.botName}</h4>
                            <button id="chat-close" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">×</button>
                        </div>
                        <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto;">
                            <div style="margin-bottom: 12px;">
                                <div style="padding: 8px 12px; border-radius: 8px; font-size: 14px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(94, 82, 64, 0.2); color: #000;">
                                    \${this.welcomeMessage}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; padding: 16px; border-top: 2px solid rgba(94, 82, 64, 0.2); gap: 8px;">
                            <input id="chat-input" type="text" placeholder="Type your message..." style="flex: 1; padding: 8px 12px; border: 2px solid rgba(94, 82, 64, 0.3); border-radius: 8px; font-size: 14px; color: #000; background: white;">
                            <button id="chat-send" style="padding: 8px 16px; background: #218D8D; color: white; border: 2px solid #218D8D; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">Send</button>
                        </div>
                    </div>
                </div>
            \`;
            document.body.appendChild(widget);
        },
        
        bindEvents: function() {
            var toggle = document.getElementById('chat-toggle');
            var window = document.getElementById('chat-window');
            var close = document.getElementById('chat-close');
            var input = document.getElementById('chat-input');
            var send = document.getElementById('chat-send');
            
            toggle.onclick = function() {
                window.style.display = window.style.display === 'none' ? 'flex' : 'none';
            };
            
            close.onclick = function() {
                window.style.display = 'none';
            };
            
            send.onclick = function() {
                chatbot.sendMessage();
            };
            
            input.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    chatbot.sendMessage();
                }
            };
        },
        
        sendMessage: function() {
            var input = document.getElementById('chat-input');
            var messages = document.getElementById('chat-messages');
            var message = input.value.trim();
            
            if (message) {
                // Add user message
                messages.innerHTML += \`
                    <div style="margin-bottom: 12px; text-align: right;">
                        <div style="display: inline-block; padding: 8px 12px; border-radius: 8px; font-size: 14px; background: #218D8D; color: white; max-width: 80%;">
                            \${message}
                        </div>
                    </div>
                \`;
                
                input.value = '';
                messages.scrollTop = messages.scrollHeight;
                
                // Simulate bot response
                setTimeout(function() {
                    messages.innerHTML += \`
                        <div style="margin-bottom: 12px;">
                            <div style="padding: 8px 12px; border-radius: 8px; font-size: 14px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(94, 82, 64, 0.2); color: #000;">
                                Thanks for your message! I'm here to help you with any questions.
                            </div>
                        </div>
                    \`;
                    messages.scrollTop = messages.scrollHeight;
                }, 1000);
            }
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            chatbot.init();
        });
    } else {
        chatbot.init();
    }
})();
</script>`;
    }

    updateEmbedCode() {
        const embedCode = this.createEmbedCode({
            id: 'demo-bot',
            name: 'Demo Bot',
            welcomeMessage: 'Hi! How can I help you today?'
        });
        document.getElementById('embedCode').value = embedCode;
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
    }

    // Chat Widget
    initChatWidget() {
        const widget = document.getElementById('chatWidget');
        const toggle = document.getElementById('chatToggle');
        const window = document.getElementById('chatWindow');
        const close = document.getElementById('chatClose');
        const input = document.getElementById('chatInput');
        const send = document.getElementById('chatSend');

        if (toggle) {
            toggle.onclick = () => {
                window.classList.toggle('hidden');
                widget.classList.remove('hidden');
            };
        }

        if (close) {
            close.onclick = () => {
                window.classList.add('hidden');
            };
        }

        if (send && input) {
            send.onclick = () => this.sendChatMessage();
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            };
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const messages = document.getElementById('chatMessages');
        const message = input.value.trim();

        if (message) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user-message';
            userMessage.innerHTML = `<div class="message-content">${message}</div>`;
            messages.appendChild(userMessage);

            input.value = '';
            messages.scrollTop = messages.scrollHeight;

            // Simulate bot response
            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot-message';
                botMessage.innerHTML = `<div class="message-content">Thanks for your message! I'm here to help you with any questions about our services.</div>`;
                messages.appendChild(botMessage);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Event Binding
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (this.login(email, password)) {
                    // Success handled in login method
                } else {
                    this.showNotification('Invalid credentials. Use admin@demo.com / demo123', 'error');
                }
            };
        }

        // Navigation buttons
        const createBotBtn = document.getElementById('createBotBtn');
        if (createBotBtn) {
            createBotBtn.onclick = () => this.showBotCreation();
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }

        const cancelBotBtn = document.getElementById('cancelBotBtn');
        if (cancelBotBtn) {
            cancelBotBtn.onclick = () => {
                this.renderDashboard();
            };
        }

        // Dashboard title click to go home
        const dashboardTitle = document.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.style.cursor = 'pointer';
            dashboardTitle.onclick = () => {
                this.renderDashboard();
            };
        }

        // Bot creation form
        const botCreationForm = document.getElementById('botCreationForm');
        if (botCreationForm) {
            botCreationForm.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(botCreationForm);
                this.createBot(formData);
            };
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            };
        });

        // File upload
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (fileUploadArea && fileInput) {
            fileUploadArea.onclick = () => fileInput.click();
            
            fileUploadArea.ondragover = (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'var(--color-primary)';
            };
            
            fileUploadArea.ondragleave = () => {
                fileUploadArea.style.borderColor = 'var(--color-border)';
            };
            
            fileUploadArea.ondrop = (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'var(--color-border)';
                this.handleFileUpload(e.dataTransfer.files);
            };
            
            fileInput.onchange = (e) => {
                this.handleFileUpload(e.target.files);
            };
        }

        // URL adding
        const addUrlBtn = document.getElementById('addUrlBtn');
        const urlInput = document.getElementById('urlInput');
        
        if (addUrlBtn && urlInput) {
            addUrlBtn.onclick = () => {
                const url = urlInput.value.trim();
                if (url) {
                    this.addUrl(url);
                }
            };
            
            urlInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    const url = urlInput.value.trim();
                    if (url) {
                        this.addUrl(url);
                    }
                }
            };
        }

        // Copy embed code
        const copyEmbedBtn = document.getElementById('copyEmbedBtn');
        if (copyEmbedBtn) {
            copyEmbedBtn.onclick = () => {
                const embedCode = document.getElementById('embedCode');
                embedCode.select();
                document.execCommand('copy');
                this.showNotification('Embed code copied to clipboard!', 'success');
            };
        }

        // Bot status toggle
        const botStatus = document.getElementById('botStatus');
        if (botStatus) {
            botStatus.onchange = (e) => {
                if (this.currentBot) {
                    this.currentBot.status = e.target.checked ? 'active' : 'inactive';
                    this.saveData();
                    this.showNotification(`Bot ${this.currentBot.status}`, 'success');
                }
            };
        }

        // Ensure dark text in all inputs
        this.fixInputTextColors();
    }

    // Fix input text colors
    fixInputTextColors() {
        // Force dark text in all form controls
        const style = document.createElement('style');
        style.textContent = `
            .form-control,
            .form-control:focus,
            .chat-input,
            .chat-input:focus,
            input[type="text"],
            input[type="email"],
            input[type="password"],
            input[type="url"],
            input[type="number"],
            textarea,
            select {
                color: #000 !important;
                -webkit-text-fill-color: #000 !important;
            }
            
            .form-control::placeholder,
            .chat-input::placeholder {
                color: #626C7C !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Global functions for inline event handlers
window.app = new ChatbotBuilder();

// Expose functions globally for HTML onclick handlers
window.removeFile = (index) => app.removeFile(index);
window.removeUrl = (index) => app.removeUrl(index);