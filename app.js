class ChatbotBuilder {
    constructor() {
        this.currentUser = null;
        this.bots = [];
        this.currentBot = null;
        this.uploadedFiles = [];
        this.scrapedUrls = [];
        this.leads = [];
        this.messages = [];
        this.analytics = {};
        this.currentView = 'bots';
        this.currentUserId = 'b4d26ac0-d376-4def-8c92-91bc9e034099';
        this.apiBaseUrl = "/api";
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.initChatWidget();
    }

    // ======================
    // API METHODS
    // ======================
    async loadData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/bots?user_id=${this.currentUserId}`);
            const data = await response.json();
            this.bots = data;
            this.renderCurrentView();
        } catch (error) {
            console.error('Failed to load bots:', error);
            this.showNotification('Failed to load bots. Please refresh.', 'error');
            this.bots = [];
            this.renderCurrentView();
        }
    }

    async saveBot(botData) {
        try {
            botData.user_id = this.currentUserId;
            
            const response = await fetch(`${this.apiBaseUrl}/bots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData)
            });
            
            if (!response.ok) throw new Error('Failed to save bot');
            const savedBot = await response.json();
            
            this.showNotification('Bot created successfully!', 'success');
            this.loadData();
            return savedBot;
        } catch (error) {
            console.error('Error saving bot:', error);
            this.showNotification('Failed to create bot. Please try again.', 'error');
            throw error;
        }
    }

    async updateBot(botId, updates) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/bots`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: botId, ...updates }) // must include 'id'
})

            
            if (!response.ok) throw new Error('Failed to update bot');
            const updatedBot = await response.json();
            
            const index = this.bots.findIndex(bot => bot.id === botId);
            if (index !== -1) {
                this.bots[index] = updatedBot;
            }
            
            this.showNotification('Bot updated successfully!', 'success');
            this.renderCurrentView();
            return updatedBot;
        } catch (error) {
            console.error('Error updating bot:', error);
            this.showNotification('Failed to update bot. Please try again.', 'error');
            throw error;
        }
    }

    async deleteBot(botId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/bots`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: botId })
});
            
            if (!response.ok) throw new Error('Failed to delete bot');
            
            this.bots = this.bots.filter(bot => bot.id !== botId);
            this.showNotification('Bot deleted successfully!', 'success');
            this.renderCurrentView();
        } catch (error) {
            console.error('Error deleting bot:', error);
            this.showNotification('Failed to delete bot. Please try again.', 'error');
            throw error;
        }
    }

    async loadLeads(botId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leads/${botId}`);
            const leads = await response.json();
            this.leads = leads;
            return leads;
        } catch (error) {
            console.error('Failed to load leads:', error);
            this.showNotification('Failed to load leads.', 'error');
            return [];
        }
    }

    async loadMessages(botId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/messages/${botId}`);
            const messages = await response.json();
            this.messages = messages;
            return messages;
        } catch (error) {
            console.error('Failed to load messages:', error);
            this.showNotification('Failed to load conversation logs.', 'error');
            return [];
        }
    }

    async uploadFile(file, botId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bot_id', botId);

        try {
            const response = await fetch(`${this.apiBaseUrl}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();
            
            this.showNotification('File uploaded successfully!', 'success');
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('File upload failed. Please try again.', 'error');
            throw error;
        }
    }

    async generateEmbedCode(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return '';

        return `<script>
(function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.dataset.botId = '${botId}';
    script.dataset.apiUrl = '${this.apiBaseUrl}';
    document.head.appendChild(script);
})();
</script>`;
    }

    // ======================
    // AUTHENTICATION
    // ======================
    checkAuth() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    login(email, password) {
        // Simplified for development - any credentials work
        if (email && password) {
            this.currentUser = {
                id: this.currentUserId,
                email: email,
                name: email.split('@')[0],
                isAdmin: email.includes('admin')
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showDashboard();
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLogin();
    }

    // ======================
    // UI RENDERING
    // ======================
    showLogin() {
        document.body.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h1>Hello. I'm Your<br>Chatbot Builder.</h1>
                    <p>Create intelligent AI assistants that work 24/7</p>
                    
                    <form id="loginForm">
                        <div class="form-group">
                            <label>EMAIL ADDRESS</label>
                            <input type="email" id="email" placeholder="your@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label>PASSWORD</label>
                            <input type="password" id="password" placeholder="Enter your password" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">LAUNCH DASHBOARD</button>
                    </form>
                    
                    <div class="demo-credentials">
                        <h4>Demo Credentials:</h4>
                        <p><strong>Email:</strong> admin@demo.com | <strong>Password:</strong> demo123</p>
                        <p><em>Or use any email/password for development</em></p>
                    </div>
                </div>
            </div>
        `;
        
        this.bindLoginEvents();
    }

    showDashboard() {
        document.body.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <span class="logo">🤖</span>
                    Chatbot Builder
                </div>
                <div class="nav-menu">
                    <span class="nav-item ${this.currentView === 'bots' ? 'active' : ''}" data-view="bots">
                        <span class="nav-icon">🤖</span> My Bots
                    </span>
                    <span class="nav-item ${this.currentView === 'analytics' ? 'active' : ''}" data-view="analytics">
                        <span class="nav-icon">📊</span> Analytics
                    </span>
                    <span class="nav-item ${this.currentView === 'leads' ? 'active' : ''}" data-view="leads">
                        <span class="nav-icon">👥</span> Leads
                    </span>
                    <span class="nav-item ${this.currentView === 'settings' ? 'active' : ''}" data-view="settings">
                        <span class="nav-icon">⚙️</span> Settings
                    </span>
                    ${this.currentUser.isAdmin ? `
                        <span class="nav-item ${this.currentView === 'admin' ? 'active' : ''}" data-view="admin">
                            <span class="nav-icon">👑</span> Admin
                        </span>
                    ` : ''}
                    <span class="nav-item logout-btn">
                        <span class="nav-icon">🚪</span> Logout
                    </span>
                </div>
                <div class="nav-user">
                    <span class="user-name">${this.currentUser.name}</span>
                    <div class="user-avatar">${this.currentUser.name.charAt(0).toUpperCase()}</div>
                </div>
            </nav>
            
            <div class="dashboard-container">
                <div id="dashboard-content"></div>
            </div>
            
            <div id="notification-container"></div>
        `;
        
        this.loadData();
        this.bindDashboardEvents();
    }

    renderCurrentView() {
        switch(this.currentView) {
            case 'bots':
                this.renderBotsView();
                break;
            case 'analytics':
                this.renderAnalyticsView();
                break;
            case 'leads':
                this.renderLeadsView();
                break;
            case 'settings':
                this.renderSettingsView();
                break;
            case 'admin':
                if (this.currentUser.isAdmin) this.renderAdminView();
                break;
            default:
                this.renderBotsView();
        }
    }

    renderBotsView() {
        const content = document.getElementById('dashboard-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="dashboard-header">
                <div class="header-content">
                    <h2>My Chatbots</h2>
                    <p class="header-subtitle">Create and manage your AI assistants</p>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" id="importTemplateBtn">📋 Import Template</button>
                    <button class="btn-primary" id="createBotBtn">+ Create New Bot</button>
                </div>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-number">${this.bots.length}</div>
                    <div class="stat-label">Total Bots</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.bots.filter(b => b.status === 'active').length}</div>
                    <div class="stat-label">Active Bots</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Total Conversations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Total Leads</div>
                </div>
            </div>
            
            <div class="bots-grid">
                ${this.bots.map(bot => `
                    <div class="bot-card" data-bot-id="${bot.id}">
                        <div class="bot-header">
                            <div class="bot-info">
                                <h3>${bot.bot_name || 'Unnamed Bot'}</h3>
                                <span class="bot-status status-${bot.status || 'active'}">${bot.status || 'Active'}</span>
                            </div>
                            <div class="bot-actions">
                                <button class="btn-icon test-bot" title="Test Bot">🧪</button>
                                <button class="btn-icon edit-bot" title="Edit Bot">✏️</button>
                                <button class="btn-icon duplicate-bot" title="Duplicate">📋</button>
                                <button class="btn-icon delete-bot" title="Delete">🗑️</button>
                            </div>
                        </div>
                        
                        <div class="bot-description">
                            <p>${bot.instructions || 'No instructions set'}</p>
                        </div>
                        
                        <div class="bot-features">
                            <div class="feature-item">
                                <span class="feature-icon">📄</span>
                                <span>${bot.files ? JSON.parse(bot.files).length : 0} Files</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🌐</span>
                                <span>${bot.urls ? JSON.parse(bot.urls).length : 0} URLs</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🗣️</span>
                                <span>0 Conversations</span>
                            </div>
                        </div>
                        
                        <div class="bot-footer">
                            <div class="bot-meta">
                                <span class="created-date">Created: ${bot.created_at ? new Date(bot.created_at).toLocaleDateString() : 'Unknown'}</span>
                            </div>
                            <div class="bot-embed">
                                <button class="btn-secondary get-embed" data-bot-id="${bot.id}">Get Embed Code</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${this.bots.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">🤖</div>
                    <h3>No bots yet</h3>
                    <p>Create your first chatbot to get started with AI-powered customer support</p>
                    <button class="btn-primary" id="createFirstBotBtn">Create Your First Bot</button>
                </div>
            ` : ''}
        `;
        
        this.bindBotEvents();
    }

    showBotForm(bot = null) {
        const isEdit = bot !== null;
        const content = document.getElementById('dashboard-content');
        
        content.innerHTML = `
            <div class="form-container">
                <div class="form-header">
                    <button class="btn-back">← Back to Bots</button>
                    <h2>${isEdit ? 'Edit Bot' : 'Create New Bot'}</h2>
                    <div class="form-progress">
                        <div class="progress-step active" data-step="1">Basic Info</div>
                        <div class="progress-step" data-step="2">Training Data</div>
                        <div class="progress-step" data-step="3">Customization</div>
                    </div>
                </div>
                
                <form id="botForm" class="bot-form">
                    <!-- Step 1: Basic Information -->
                    <div class="form-step active" data-step="1">
                        <h3>Basic Information</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Bot Name *</label>
                                <input type="text" id="botName" value="${bot?.bot_name || ''}" placeholder="e.g., Customer Support Assistant" required>
                                <small class="help-text">This name will be visible to your customers</small>
                            </div>
                            
                            <div class="form-group">
                                <label>OpenAI API Key *</label>
                                <input type="password" id="openaiKey" value="${bot?.openai_api_key || ''}" placeholder="sk-..." required>
                                <small class="help-text">Your private OpenAI API key. <a href="#" id="keyHelpLink">Need help?</a></small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Bot Instructions *</label>
                            <textarea id="instructions" placeholder="Tell your bot how to behave, what to help with, and any specific guidelines..." required>${bot?.instructions || ''}</textarea>
                            <small class="help-text">Be specific about your bot's role and limitations</small>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Bot Persona</label>
                                <input type="text" id="persona" value="${bot?.persona || ''}" placeholder="e.g., Friendly and professional">
                                <small class="help-text">How should your bot's personality come across?</small>
                            </div>
                            
                            <div class="form-group">
                                <label>Daily Message Limit</label>
                                <input type="number" id="dailyLimit" value="${bot?.limit_msg_per_day || 1000}" min="1" max="10000">
                                <small class="help-text">Maximum messages per day (1-10,000)</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2: Training Data -->
                    <div class="form-step" data-step="2">
                        <h3>Training Data</h3>
                        
                        <div class="training-section">
                            <h4>Upload Files</h4>
                            <div class="file-upload-area" id="fileUploadArea">
                                <input type="file" id="fileInput" multiple accept=".pdf,.docx,.txt,.csv">
                                <div class="upload-prompt">
                                    <span class="upload-icon">📄</span>
                                    <p>Drop files here or click to browse</p>
                                    <small>Supports PDF, DOCX, TXT, CSV (max 10MB each)</small>
                                </div>
                            </div>
                            <div id="uploadedFiles" class="uploaded-files"></div>
                        </div>
                        
                        <div class="training-section">
                            <h4>Website URLs</h4>
                            <div class="url-input-section">
                                <div class="form-group">
                                    <input type="url" id="urlInput" placeholder="https://example.com/help">
                                    <button type="button" class="btn-secondary" id="addUrlBtn">Add URL</button>
                                </div>
                                <div id="addedUrls" class="added-urls"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 3: Customization -->
                    <div class="form-step" data-step="3">
                        <h3>Widget Customization</h3>
                        
                        <div class="customization-preview">
                            <div class="preview-section">
                                <h4>Widget Preview</h4>
                                <div class="widget-preview" id="widgetPreview">
                                    <!-- Preview will be rendered here -->
                                </div>
                            </div>
                            
                            <div class="customization-controls">
                                <div class="form-group">
                                    <label>Welcome Message</label>
                                    <input type="text" id="welcomeMessage" value="${bot?.welcome_message || 'Hi! How can I help you today?'}" placeholder="Hi! How can I help you?">
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Accent Color</label>
                                        <input type="color" id="accentColor" value="#2DA0B5">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Widget Position</label>
                                        <select id="widgetPosition">
                                            <option value="bottom-right">Bottom Right</option>
                                            <option value="bottom-left">Bottom Left</option>
                                            <option value="top-right">Top Right</option>
                                            <option value="top-left">Top Left</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="collectLeads" ${bot?.lead_collection ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Enable lead collection
                                    </label>
                                    <small class="help-text">Ask for visitor contact information</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="emailNotifications" ${bot?.email_notifications ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Email notifications for new leads
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-navigation">
                        <button type="button" class="btn-secondary" id="prevStepBtn" style="display: none;">Previous</button>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                            <button type="button" class="btn-primary" id="nextStepBtn">Next Step</button>
                            <button type="submit" class="btn-primary" id="submitBtn" style="display: none;">
                                ${isEdit ? 'Update Bot' : 'Create Bot'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        this.bindFormEvents(bot);
        this.initFormSteps();
        this.updateWidgetPreview();
    }

    showEmbedCodeModal(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return;

        const embedCode = `<script>
(function() {
    var chatWidget = document.createElement('div');
    chatWidget.id = 'chatbot-widget-${botId}';
    chatWidget.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
    document.body.appendChild(chatWidget);
    
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.dataset.botId = '${botId}';
    script.dataset.apiUrl = '${this.apiBaseUrl}';
    script.onload = function() {
        new ChatWidget('${botId}', {
            apiUrl: '${this.apiBaseUrl}',
            welcomeMessage: '${bot.welcome_message || 'Hi! How can I help you?'}',
            botName: '${bot.bot_name}'
        });
    };
    document.head.appendChild(script);
})();
</script>`;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Embed Code for ${bot.bot_name}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p>Copy this code and paste it into your website's HTML:</p>
                    <div class="code-block">
                        <pre id="embedCode">${embedCode}</pre>
                        <button class="btn-secondary copy-code">Copy Code</button>
                    </div>
                    <div class="embed-instructions">
                        <h4>Installation Instructions:</h4>
                        <ol>
                            <li>Copy the embed code above</li>
                            <li>Paste it before the closing &lt;/body&gt; tag on your website</li>
                            <li>The chatbot will appear on the bottom-right of your pages</li>
                            <li>Visitors can start chatting immediately</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.copy-code').addEventListener('click', () => {
            navigator.clipboard.writeText(embedCode).then(() => {
                this.showNotification('Embed code copied to clipboard!', 'success');
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    renderAnalyticsView() {
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="analytics-dashboard">
                <div class="dashboard-header">
                    <h2>Analytics & Insights</h2>
                    <div class="date-filter">
                        <select id="dateRange">
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                </div>
                
                <div class="analytics-overview">
                    <div class="metric-card">
                        <div class="metric-icon">💬</div>
                        <div class="metric-info">
                            <div class="metric-number">0</div>
                            <div class="metric-label">Total Conversations</div>
                            <div class="metric-change">+0% from last period</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-info">
                            <div class="metric-number">0</div>
                            <div class="metric-label">Leads Generated</div>
                            <div class="metric-change">+0% from last period</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">⚡</div>
                        <div class="metric-info">
                            <div class="metric-number">0s</div>
                            <div class="metric-label">Avg Response Time</div>
                            <div class="metric-change">+0% from last period</div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">😊</div>
                        <div class="metric-info">
                            <div class="metric-number">0%</div>
                            <div class="metric-label">Satisfaction Rate</div>
                            <div class="metric-change">+0% from last period</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-charts">
                    <div class="chart-container">
                        <h3>Conversation Volume</h3>
                        <div class="chart-placeholder">
                            📊 Chart will be implemented with real data
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Bot Performance</h3>
                        <div class="bot-performance-list">
                            ${this.bots.map(bot => `
                                <div class="performance-item">
                                    <div class="bot-info">
                                        <span class="bot-name">${bot.bot_name}</span>
                                        <span class="bot-status status-${bot.status}">${bot.status}</span>
                                    </div>
                                    <div class="performance-metrics">
                                        <span class="metric">0 conversations</span>
                                        <span class="metric">0 leads</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeadsView() {
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="leads-dashboard">
                <div class="dashboard-header">
                    <h2>Lead Management</h2>
                    <div class="header-actions">
                        <button class="btn-secondary" id="exportLeadsBtn">📊 Export CSV</button>
                        <select id="botFilter">
                            <option value="">All Bots</option>
                            ${this.bots.map(bot => `<option value="${bot.id}">${bot.bot_name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="leads-stats">
                    <div class="stat-card">
                        <div class="stat-number">0</div>
                        <div class="stat-label">Total Leads</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">0</div>
                        <div class="stat-label">This Month</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">0</div>
                        <div class="stat-label">This Week</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">0%</div>
                        <div class="stat-label">Conversion Rate</div>
                    </div>
                </div>
                
                <div class="leads-table-container">
                    <table class="leads-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Bot</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="leadsTableBody">
                            <tr class="no-leads">
                                <td colspan="6">
                                    <div class="empty-state">
                                        <div class="empty-icon">👥</div>
                                        <h3>No leads yet</h3>
                                        <p>Enable lead collection on your bots to start capturing visitor information</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderSettingsView() {
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="settings-dashboard">
                <div class="dashboard-header">
                    <h2>Account Settings</h2>
                </div>
                
                <div class="settings-sections">
                    <div class="settings-section">
                        <h3>Profile Information</h3>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="fullName" value="${this.currentUser.name}" placeholder="Your full name">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" id="userEmail" value="${this.currentUser.email}" placeholder="your@email.com">
                        </div>
                        <button class="btn-primary">Update Profile</button>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Notification Preferences</h3>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailLeadNotifications" checked>
                                <span class="checkbox-custom"></span>
                                Email me when I get new leads
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="weeklyReports">
                                <span class="checkbox-custom"></span>
                                Weekly analytics reports
                            </label>
                        </div>
                        <button class="btn-primary">Save Preferences</button>
                    </div>
                    
                    <div class="settings-section">
                        <h3>API Configuration</h3>
                        <div class="form-group">
                            <label>Default OpenAI API Key</label>
                            <input type="password" id="defaultApiKey" placeholder="sk-...">
                            <small class="help-text">This will be used as default for new bots</small>
                        </div>
                        <button class="btn-primary">Save API Key</button>
                    </div>
                    
                    <div class="settings-section danger-zone">
                        <h3>Danger Zone</h3>
                        <div class="danger-actions">
                            <button class="btn-danger" id="exportDataBtn">Export All Data</button>
                            <button class="btn-danger" id="deleteAccountBtn">Delete Account</button>
                        </div>
                        <small class="help-text">These actions cannot be undone</small>
                    </div>
                </div>
            </div>
        `;
    }

    // ======================
    // EVENT BINDING
    // ======================
    bindLoginEvents() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (this.login(email, password)) {
                console.log('Login successful');
            } else {
                this.showNotification('Please enter email and password', 'error');
            }
        });
    }

    bindDashboardEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('logout-btn') || e.target.closest('.logout-btn')) {
                    this.logout();
                } else {
                    const view = e.target.dataset.view || e.target.closest('[data-view]').dataset.view;
                    if (view && view !== this.currentView) {
                        this.currentView = view;
                        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                        e.target.classList.add('active');
                        this.renderCurrentView();
                    }
                }
            });
        });
    }

    bindBotEvents() {
        // Create bot buttons
        document.querySelectorAll('#createBotBtn, #createFirstBotBtn').forEach(btn => {
            btn.addEventListener('click', () => this.showBotForm());
        });

        // Edit bot buttons
        document.querySelectorAll('.edit-bot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const botId = e.target.closest('.bot-card').dataset.botId;
                const bot = this.bots.find(b => b.id === botId);
                if (bot) this.showBotForm(bot);
            });
        });

        // Delete bot buttons
        document.querySelectorAll('.delete-bot').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const botId = e.target.closest('.bot-card').dataset.botId;
                const bot = this.bots.find(b => b.id === botId);
                
                if (bot && confirm(`⚠️ Are you sure you want to delete "${bot.bot_name}"?\n\nThis will also delete all associated:\n• Training files\n• Conversation logs\n• Lead data\n• Embed widgets\n\nThis action cannot be undone.`)) {
                    await this.deleteBot(botId);
                }
            });
        });

        // Test bot buttons
        document.querySelectorAll('.test-bot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const botId = e.target.closest('.bot-card').dataset.botId;
                this.openTestChat(botId);
            });
        });

        // Get embed code buttons
        document.querySelectorAll('.get-embed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const botId = e.target.dataset.botId;
                this.showEmbedCodeModal(botId);
            });
        });

        // Duplicate bot buttons
        document.querySelectorAll('.duplicate-bot').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const botId = e.target.closest('.bot-card').dataset.botId;
                const bot = this.bots.find(b => b.id === botId);
                
                if (bot) {
                    const duplicateBot = {
                        ...bot,
                        bot_name: bot.bot_name + ' (Copy)',
                        id: undefined,
                        created_at: undefined
                    };
                    await this.saveBot(duplicateBot);
                }
            });
        });
    }

    bindFormEvents(editBot = null) {
        const form = document.getElementById('botForm');
        const backBtn = document.querySelector('.btn-back');
        const cancelBtn = document.querySelector('.cancel-btn');

        // Back and cancel buttons
        [backBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.currentView = 'bots';
                    this.renderCurrentView();
                });
            }
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    bot_name: document.getElementById('botName').value,
                    instructions: document.getElementById('instructions').value,
                    persona: document.getElementById('persona').value,
                    openai_api_key: document.getElementById('openaiKey').value,
                    limit_msg_per_day: parseInt(document.getElementById('dailyLimit').value) || 1000,
                    welcome_message: document.getElementById('welcomeMessage').value,
                    lead_collection: document.getElementById('collectLeads').checked,
                    email_notifications: document.getElementById('emailNotifications').checked,
                    status: 'active',
                    files: JSON.stringify(this.uploadedFiles),
                    urls: JSON.stringify(this.scrapedUrls),
                    created_at: editBot ? editBot.created_at : new Date().toISOString()
                };

                try {
                    if (editBot) {
                        await this.updateBot(editBot.id, formData);
                    } else {
                        await this.saveBot(formData);
                    }
                    
                    this.currentView = 'bots';
                    this.renderCurrentView();
                } catch (error) {
                    console.error('Save error:', error);
                }
            });
        }
    }

    // Form step navigation
    initFormSteps() {
        let currentStep = 1;
        const totalSteps = 3;

        const updateStepDisplay = () => {
            // Update step indicators
            document.querySelectorAll('.progress-step').forEach((step, index) => {
                const stepNum = index + 1;
                step.classList.toggle('active', stepNum === currentStep);
                step.classList.toggle('completed', stepNum < currentStep);
            });

            // Show/hide form steps
            document.querySelectorAll('.form-step').forEach((step, index) => {
                step.classList.toggle('active', index + 1 === currentStep);
            });

            // Update navigation buttons
            const prevBtn = document.getElementById('prevStepBtn');
            const nextBtn = document.getElementById('nextStepBtn');
            const submitBtn = document.getElementById('submitBtn');

            prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
            nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
            submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
        };

        // Next step button
        document.getElementById('nextStepBtn').addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
            }
        });

        // Previous step button
        document.getElementById('prevStepBtn').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay();
            }
        });

        updateStepDisplay();
    }

    updateWidgetPreview() {
        const preview = document.getElementById('widgetPreview');
        if (!preview) return;

        const welcomeMessage = document.getElementById('welcomeMessage')?.value || 'Hi! How can I help you?';
        const accentColor = document.getElementById('accentColor')?.value || '#2DA0B5';

        preview.innerHTML = `
            <div class="chat-widget-preview" style="--accent-color: ${accentColor}">
                <div class="widget-header">
                    <span class="widget-title">Customer Support</span>
                    <span class="widget-status">● Online</span>
                </div>
                <div class="widget-messages">
                    <div class="bot-message">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">${welcomeMessage}</div>
                    </div>
                </div>
                <div class="widget-input">
                    <input type="text" placeholder="Type a message..." disabled>
                    <button disabled>Send</button>
                </div>
            </div>
        `;
    }

    openTestChat(botId) {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot) return;

        // Create test chat modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content chat-test-modal">
                <div class="modal-header">
                    <h3>Test Chat - ${bot.bot_name}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="test-chat-container">
                        <div class="chat-messages" id="testChatMessages">
                            <div class="bot-message">
                                <div class="message-avatar">🤖</div>
                                <div class="message-content">${bot.welcome_message || 'Hi! How can I help you?'}</div>
                            </div>
                        </div>
                        <div class="chat-input">
                            <input type="text" id="testChatInput" placeholder="Type your message...">
                            <button id="sendTestMessage">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Test chat functionality
        const sendMessage = () => {
            const input = document.getElementById('testChatInput');
            const message = input.value.trim();
            
            if (message) {
                // Add user message
                const messagesContainer = document.getElementById('testChatMessages');
                messagesContainer.innerHTML += `
                    <div class="user-message">
                        <div class="message-content">${message}</div>
                    </div>
                `;

                input.value = '';

                // Simulate bot response (in real implementation, this would call your API)
                setTimeout(() => {
                    messagesContainer.innerHTML += `
                        <div class="bot-message">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">This is a test response. In the full implementation, I would process your message using the training data and OpenAI API.</div>
                        </div>
                    `;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 1000);

                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };

        document.getElementById('sendTestMessage').addEventListener('click', sendMessage);
        document.getElementById('testChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // ======================
    // UTILITY METHODS
    // ======================
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container') || document.body;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">×</button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    bindEvents() {
        // General event binding
    }

    initChatWidget() {
        // Chat widget initialization will go here
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotBuilder();
});
