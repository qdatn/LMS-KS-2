document.addEventListener("DOMContentLoaded", function() {
    // Initialize chatbot
    const chatbotTrigger = document.getElementById("floatingChatbotTrigger");
    const chatbotDialog = document.getElementById("floatingChatbotDialog");
    const minimizeChatbot = document.getElementById("minimizeFloatingChatbot");
    const chatInput = document.getElementById("floatingChatInput");
    const sendBtn = document.getElementById("floatingChatSendBtn");
    const fileInput = document.getElementById("floatingFileInput");
    const uploadBtn = document.getElementById("floatingUploadBtn");
    const uploadPreview = document.getElementById("floatingUploadPreview");

    // Setup toggle functionality
    if (chatbotTrigger && chatbotDialog) {
        chatbotTrigger.addEventListener("click", function() {
            chatbotDialog.classList.toggle("active");
            // Focus on input when dialog is opened
            if (chatbotDialog.classList.contains("active") && chatInput) {
                setTimeout(() => chatInput.focus(), 300);
            }
        });
    }

    // Setup minimize functionality
    if (minimizeChatbot) {
        minimizeChatbot.addEventListener("click", function() {
            chatbotDialog.classList.remove("active");
        });
    }

    // Send message on button click
    if (sendBtn) {
        sendBtn.addEventListener("click", sendFloatingChatMessage);
    }

    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") sendFloatingChatMessage();
        });
    }

    // File upload handling
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener("click", function() {
            fileInput.click();
        });

        fileInput.addEventListener("change", function(e) {
            handleFileSelection(e);
        });
    }

    // Function to send chat message
    function sendFloatingChatMessage() {
        const message = chatInput?.value.trim();
        const files = fileInput?.files;
        const chatMessages = document.getElementById("floatingChatMessages");
        const welcomeMessage = document.getElementById("floatingWelcomeMessage");

        if (!message && (!files || files.length === 0)) return;

        const formData = new FormData();
        formData.append("message", message);

        let displayMessage = message;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => formData.append("files", file));
            const fileNames = Array.from(files).map(f => f.name).join(", ");
            displayMessage += message ? `\n\nUploaded: ${fileNames}` : `Uploaded: ${fileNames}`;
        }

        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        addChatMessage("user", displayMessage);

        chatInput.value = "";
        fileInput.value = "";
        uploadPreview.innerHTML = "";
        uploadPreview.style.display = "none";

        const assistantMessageDiv = createTypingIndicator();
        chatMessages.appendChild(assistantMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const conversationId = localStorage.getItem("conversationId");
        const url = "/chatbots/chat" + (conversationId ? `?conversationId=${conversationId}` : "");

        fetch(url, { method: "POST", body: formData })
            .then(response => handleChatResponse(response, !conversationId, message, assistantMessageDiv))
            .catch(error => {
                console.error("Error sending message:", error);
                assistantMessageDiv.innerHTML = `<div class="message-content"><p>Sorry, there was an error processing your request: ${error.message}</p></div>`;
            });
    }

    // Handle chat response
    function handleChatResponse(response, isNewConversation, question, assistantMessageDiv) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newConversationId = response.headers.get("X-Conversation-Id");

        if (!newConversationId || newConversationId === "null") {
            throw new Error("Invalid conversation ID received from server: " + newConversationId);
        }

        localStorage.setItem("conversationId", newConversationId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let text = "";

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    return;
                }
                text += decoder.decode(value, { stream: true });

                // Use marked to parse Markdown if available, otherwise use plain text
                if (typeof marked !== 'undefined') {
                    assistantMessageDiv.innerHTML = `<div class="message-content">${marked.parse(text)}</div>`;
                } else {
                    assistantMessageDiv.innerHTML = `<div class="message-content">${text}</div>`;
                }

                const chatMessages = document.getElementById("floatingChatMessages");
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                readStream();
            });
        }

        readStream();
    }

    // Add a chat message to the interface
    function addChatMessage(role, content) {
        const chatMessages = document.getElementById("floatingChatMessages");
        if (!chatMessages) return null;

        const messageDiv = document.createElement("div");
        messageDiv.className = "message " + role;

        if (role === "user") {
            messageDiv.innerHTML = `<div class="message-content"><p>${content}</p></div>`;
        } else {
            // Use marked to parse Markdown if available
            if (typeof marked !== 'undefined') {
                messageDiv.innerHTML = `<div class="message-content">${marked.parse(content)}</div>`;
            } else {
                messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
            }
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Create typing indicator
    function createTypingIndicator() {
        const div = document.createElement("div");
        div.className = "message assistant";
        div.innerHTML = `<div class="message-content">
                          <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                          </div>
                        </div>`;
        return div;
    }

    // Handle file selection for upload
    function handleFileSelection(e) {
        const files = e.target.files;
        const uploadPreview = document.getElementById("floatingUploadPreview");

        if (files.length === 0 || !uploadPreview) return;

        uploadPreview.innerHTML = "";
        uploadPreview.style.display = "flex";

        Array.from(files).forEach(file => {
            const fileType = getFileType(file);
            const fileSize = formatFileSize(file.size);
            const previewElement = createFilePreview(file, fileType, fileSize);
            uploadPreview.appendChild(previewElement);
        });
    }

    // Utility functions
    function getFileType(file) {
        if (file.type.startsWith("image/")) return 'image';
        if (file.type === "application/pdf") return 'pdf';
        if (file.type.includes("document") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return 'document';
        if (file.name.endsWith(".js") || file.name.endsWith(".py") || file.name.endsWith(".java") ||
            file.name.endsWith(".html") || file.name.endsWith(".css")) return 'code';
        return 'default';
    }

    function formatFileSize(sizeInBytes) {
        if (sizeInBytes < 1024) return `${sizeInBytes} B`;
        if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function createFilePreview(file, fileType, fileSize) {
        const FILE_TYPES = {
            'image': { icon: 'bi-file-earmark-image', color: '#e3f2fd' },
            'pdf': { icon: 'bi-file-earmark-pdf', color: '#ffebee' },
            'document': { icon: 'bi-file-earmark-word', color: '#e8f5e9' },
            'code': { icon: 'bi-file-earmark-code', color: '#fff3e0' },
            'default': { icon: 'bi-file-earmark', color: '#f8f9fa' }
        };

        const { icon, color } = FILE_TYPES[fileType];

        const filePreview = document.createElement("div");
        filePreview.className = "file-preview d-flex align-items-center";
        filePreview.style.backgroundColor = color;

        filePreview.innerHTML = `
            <i class="bi ${icon} me-2 fs-5"></i>
            <div class="file-info flex-grow-1">
                <div class="text-truncate" style="max-width: 150px; font-weight: 500;">${file.name}</div>
                <div class="text-muted small">${fileSize}</div>
            </div>
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.remove();"></button>
        `;

        return filePreview;
    }
});