document.addEventListener("DOMContentLoaded", initializeChatbot);

const DOM = {
    get chatInput() { return document.querySelector(".chat-main #chatInput"); },
    get chatMessages() { return document.querySelector(".chat-main #chatMessages"); },
    get fileInput() { return document.querySelector(".chat-main #fileInput"); },
    get uploadPreview() { return document.querySelector(".chat-main #uploadPreview"); },
    get welcomeMessage() { return document.querySelector(".chat-main #welcomeMessage"); },
    get conversationHistory() { return document.getElementById("conversationHistory"); },
    get sidebar() { return document.querySelector(".chatbot-sidebar"); },
    get mainContent() { return document.querySelector(".chat-main"); },
    get chatInputContainer() { return document.querySelector(".chat-main .chat-input-container"); }
};
const FILE_TYPES = {
    'image': { icon: 'bi-file-earmark-image', color: '#e3f2fd' },
    'pdf': { icon: 'bi-file-earmark-pdf', color: '#ffebee' },
    'document': { icon: 'bi-file-earmark-word', color: '#e8f5e9' },
    'code': { icon: 'bi-file-earmark-code', color: '#fff3e0' },
    'default': { icon: 'bi-file-earmark', color: '#f8f9fa' }
};

function initializeChatbot() {
    initializeConversation();
    loadConversationHistory();
    setupSidebarToggle();
    setupEventListeners();
}

function initializeConversation() {
    const currentPath = window.location.pathname;
    const conversationIdFromUrl = currentPath.match(/\/chatbots\/c\/(\d+)/)?.[1];

    if (conversationIdFromUrl) {
        localStorage.setItem("conversationId", conversationIdFromUrl);
        loadChatHistory();
    } else if (currentPath === "/chatbots") {
        localStorage.removeItem("conversationId");
        showWelcomeMessage();
    }
}

function setupEventListeners() {
    document.getElementById("newChatBtn").addEventListener("click", startNewChat);
    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    DOM.chatInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
    document.getElementById("uploadBtn").addEventListener("click", () => DOM.fileInput.click());
    DOM.fileInput.addEventListener("change", handleFileSelection);
}

function showWelcomeMessage() {
    DOM.chatMessages.innerHTML = `
        <div class="welcome-message text-center my-5" id="welcomeMessage">
            <h2 class="fw-bold">Welcome to IT Education Assistant</h2>
        </div>
    `;
    updateChatInputPosition();
}

function startNewChat() {
    fetch("/reset", { method: "POST" })
        .then(() => {
            localStorage.removeItem("conversationId");
            showWelcomeMessage();

            if (window.location.pathname !== "/chatbots") {
                window.location.href = "/chatbots";
            }
            setupSidebarToggle();
        })
        .catch(error => console.error("Error starting new chat:", error));
}

function handleFileSelection(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    DOM.uploadPreview.innerHTML = "";
    DOM.uploadPreview.style.display = "flex";

    Array.from(files).forEach(file => {
        const fileType = getFileType(file);
        const fileSize = formatFileSize(file.size);
        const previewElement = createFilePreview(file, fileType, fileSize);
        DOM.uploadPreview.appendChild(previewElement);
    });
}

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
        <button type="button" class="btn-close ms-2" onclick="removeFile(this)"></button>
    `;

    return filePreview;
}

function removeFile(btnElement) {
    const filePreview = btnElement.parentElement;
    filePreview.remove();

    if (DOM.uploadPreview.children.length === 0) {
        DOM.uploadPreview.style.display = "none";
        DOM.fileInput.value = "";
    }
}

function streamConversationTitle(conversationId, question) {
    const selectedItem = document.querySelector(`#conversationHistory .nav-link[data-id="${conversationId}"]`);
    if (!selectedItem) return;

    const titleSpan = selectedItem.querySelector('span');
    if (!titleSpan) return;

    titleSpan.textContent = "New chat";

    fetch(`/chatbots/conversations/${conversationId}/title-stream?question=${encodeURIComponent(question)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let title = "";

            function readStream() {
                reader.read().then(({ done, value }) => {
                    if (done) return;
                    title += decoder.decode(value, { stream: true });
                    titleSpan.textContent = title;
                    readStream();
                });
            }

            readStream();
        })
        .catch(error => console.error("Error streaming title:", error));
}

function sendMessage() {
    const message = DOM.chatInput.value.trim();
    const files = DOM.fileInput.files;

    if (!message && (!files || files.length === 0)) return;

    const formData = new FormData();
    formData.append("message", message);

    let displayMessage = message;
    if (files && files.length > 0) {
        Array.from(files).forEach(file => formData.append("files", file));

        const fileNames = Array.from(files).map(f => f.name).join(", ");
        displayMessage += message ? `\n\nUploaded: ${fileNames}` : `Uploaded: ${fileNames}`;
    }

    if (DOM.welcomeMessage) {
        DOM.welcomeMessage.remove();
        updateChatInputPosition();
    }

    addMessage("user", displayMessage);

    DOM.chatInput.value = "";
    DOM.fileInput.value = "";
    DOM.uploadPreview.innerHTML = "";
    DOM.uploadPreview.style.display = "none";

    const assistantMessageDiv = createTypingIndicator();
    DOM.chatMessages.appendChild(assistantMessageDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;

    const conversationId = localStorage.getItem("conversationId");
    const currentPath = window.location.pathname;
    const isNewConversation = !conversationId;
    const url = "/chatbots/chat" + (conversationId ? `?conversationId=${conversationId}` : "");

    fetch(url, { method: "POST", body: formData })
        .then(response => handleChatResponse(response, isNewConversation, message, assistantMessageDiv, currentPath))
        .catch(error => {
            console.error("Error sending message:", error);
            assistantMessageDiv.innerHTML = `<div class="message-content"><p>Sorry, there was an error processing your request: ${error.message}</p></div>`;
            setupSidebarToggle();
        });
}

function handleChatResponse(response, isNewConversation, question, assistantMessageDiv, currentPath) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const newConversationId = response.headers.get("X-Conversation-Id");
    const initialTitle = response.headers.get("X-Conversation-Title") || "New Chat";

    if (!newConversationId || newConversationId === "null") {
        throw new Error("Invalid conversation ID received from server: " + newConversationId);
    }

    localStorage.setItem("conversationId", newConversationId);

    if (currentPath === "/chatbots") {
        window.history.pushState({}, document.title, `/chatbots/c/${newConversationId}`);
    }

    addConversationToSidebar(newConversationId, initialTitle);
    updateSelectedConversation(newConversationId);

    if (isNewConversation) {
        streamConversationTitle(newConversationId, question);
    }

    setupSidebarToggle();

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let text = "";

    function readStream() {
        reader.read().then(({ done, value }) => {
            if (done) {
                setupSidebarToggle();
                return;
            }
            text += decoder.decode(value, { stream: true });
            assistantMessageDiv.innerHTML = `<div class="message-content">${marked.parse(text)}</div>`;
            DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
            readStream();
        });
    }

    readStream();
}

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

function addMessage(role, content) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + role;

    if (role === "user") {
        messageDiv.innerHTML = `<div class="message-content"><p>${content}</p></div>`;
    } else {
        messageDiv.innerHTML = `<div class="message-content">${marked.parse(content)}</div>`;
    }

    DOM.chatMessages.appendChild(messageDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    return messageDiv;
}

function loadChatHistory() {
    const conversationId = localStorage.getItem("conversationId");
    if (!conversationId) return;

    fetch(`/chatbots/conversations/${conversationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load chat history: ${response.status}`);
            }
            return response.json();
        })
        .then(conversation => {
            if (conversation.messages && conversation.messages.length > 0) {
                if (DOM.welcomeMessage) DOM.welcomeMessage.remove();

                DOM.chatMessages.innerHTML = "";
                conversation.messages.forEach(msg => addMessage(msg.role, msg.content));
                updateChatInputPosition();
            }
            updateSelectedConversation(conversationId);
        })
        .catch(error => {
            console.error("Error loading chat history:", error);
            DOM.chatMessages.innerHTML = `
                <div class="text-center text-danger my-5">
                    <p>Failed to load conversation: ${error.message}</p>
                </div>
            `;
        });
}

function updateSelectedConversation(selectedId) {
    const conversationItems = document.querySelectorAll('#conversationHistory .nav-link');
    conversationItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('selected');
    });

    const selectedItem = document.querySelector(`#conversationHistory .nav-link[data-id="${selectedId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
        selectedItem.classList.add('selected');
    }
}

function setupSidebarToggle() {
    setupMobileSidebarToggle();
    setupSidebarCollapseToggle();
    setupSidebarExpandOnEmptyClick();
}

function setupMobileSidebarToggle() {
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = DOM.sidebar;

    if (toggleBtn && sidebar) {
        let backdrop = document.querySelector('.sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
        }

        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

        newToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            backdrop.classList.toggle('show');
        });

        backdrop.addEventListener('click', function() {
            sidebar.classList.remove('show');
            backdrop.classList.remove('show');
        });
    }
}

function setupSidebarCollapseToggle() {
    const collapseBtn = document.getElementById('collapseSidebarBtn');
    const mainContent = DOM.mainContent;
    const sidebar = DOM.sidebar;
    const sidebarCollapsedClass = 'sidebar-collapsed';

    if (collapseBtn) {
        const newCollapseBtn = collapseBtn.cloneNode(true);
        collapseBtn.parentNode.replaceChild(newCollapseBtn, collapseBtn);

        newCollapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle(sidebarCollapsedClass);

            const icon = newCollapseBtn.querySelector('i');
            if (sidebar.classList.contains(sidebarCollapsedClass)) {
                icon.classList.remove('bi-chevron-left');
                icon.classList.add('bi-chevron-right');
                mainContent.classList.add('expanded');
            } else {
                icon.classList.remove('bi-chevron-right');
                icon.classList.add('bi-chevron-left');
                mainContent.classList.remove('expanded');
            }
        });
    }
}

function setupSidebarExpandOnEmptyClick() {
    document.addEventListener('click', function(e) {
        const sidebar = DOM.sidebar;
        const mainContent = DOM.mainContent;
        const sidebarCollapsedClass = 'sidebar-collapsed';

        if (sidebar && sidebar.classList.contains(sidebarCollapsedClass)) {
            if (sidebar.contains(e.target)) {
                const isOnButton = e.target.closest('#collapseSidebarBtn') ||
                    e.target.closest('#newChatBtn') ||
                    e.target.closest('.nav-link');

                if (!isOnButton) {
                    sidebar.classList.remove(sidebarCollapsedClass);
                    mainContent.classList.remove('expanded');

                    const icon = document.querySelector('#collapseSidebarBtn i');
                    if (icon) {
                        icon.classList.remove('bi-chevron-right');
                        icon.classList.add('bi-chevron-left');
                    }
                }
            }
        }
    });
}

function loadConversationHistory() {
    fetch("/chatbots/conversations")
        .then(response => response.json())
        .then(groupedConversations => {
            const historyContainer = DOM.conversationHistory;
            historyContainer.innerHTML = "";

            const desiredOrder = ["Today", "Yesterday", "Previous 7 Days"];
            const allGroups = Object.keys(groupedConversations);

            desiredOrder.forEach(group => {
                if (groupedConversations[group]) {
                    appendConversationGroup(historyContainer, group, groupedConversations[group]);
                }
            });

            allGroups.forEach(group => {
                if (!desiredOrder.includes(group)) {
                    appendConversationGroup(historyContainer, group, groupedConversations[group]);
                }
            });

            setupSidebarToggle();
        })
        .catch(error => console.error("Error loading conversation history:", error));
}

function appendConversationGroup(container, groupName, conversations) {
    const groupHeader = document.createElement("h6");
    groupHeader.className = "sidebar-heading px-2 text-muted fw-bold";
    groupHeader.textContent = groupName;
    container.appendChild(groupHeader);

    conversations.forEach(conv => {
        const conversationElement = createConversationElement(conv.id, conv.title);
        container.appendChild(conversationElement);
    });
}

function createConversationElement(id, title) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "conversation-item-wrapper";

    const convItem = document.createElement("a");
    convItem.href = "#";
    convItem.className = "nav-link rounded text-truncate d-flex justify-content-between align-items-center";
    convItem.setAttribute("data-id", id);

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;
    convItem.appendChild(titleSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="bi bi-trash text-danger"></i>';
    deleteBtn.className = "btn btn-sm btn-link p-0 delete-conversation";
    deleteBtn.setAttribute("data-id", id);
    deleteBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        deleteConversation(id);
    });
    convItem.appendChild(deleteBtn);

    convItem.onclick = (e) => {
        e.preventDefault();
        localStorage.setItem("conversationId", id);
        window.history.pushState({}, document.title, `/chatbots/c/${id}`);
        loadChatHistory();
        updateSelectedConversation(id);
    };

    wrapperDiv.appendChild(convItem);

    const currentId = localStorage.getItem("conversationId");
    if (currentId === id) {
        convItem.classList.add('active');
        convItem.classList.add('selected');
    }

    return wrapperDiv;
}

function addConversationToSidebar(id, title) {
    const historyContainer = DOM.conversationHistory;

    let todayGroup = Array.from(historyContainer.getElementsByTagName("h6"))
        .find(header => header.textContent.trim() === "Today");

    if (!todayGroup) {
        todayGroup = document.createElement("h6");
        todayGroup.className = "sidebar-heading px-2 text-muted fw-bold";
        todayGroup.textContent = "Today";
        historyContainer.insertBefore(todayGroup, historyContainer.firstChild);
    }

    const existingItem = document.querySelector(`.conversation-item-wrapper .nav-link[data-id="${id}"]`);
    if (existingItem) {
        updateSelectedConversation(id);
        return;
    }

    const conversationElement = createConversationElement(id, title);
    todayGroup.nextSibling ?
        historyContainer.insertBefore(conversationElement, todayGroup.nextSibling) :
        historyContainer.appendChild(conversationElement);

    setupSidebarToggle();
}

function deleteConversation(conversationId) {
    if (!confirm("Are you sure you want to delete this conversation?")) {
        return;
    }

    fetch(`/chatbots/conversations/${conversationId}`, { method: "DELETE" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete conversation");
            }

            const itemToRemove = document.querySelector(`.conversation-item-wrapper .nav-link[data-id="${conversationId}"]`);
            if (itemToRemove) {
                itemToRemove.closest('.conversation-item-wrapper').remove();
            }

            if (localStorage.getItem("conversationId") === conversationId.toString()) {
                localStorage.removeItem("conversationId");
                showWelcomeMessage();
            }
        })
        .catch(error => {
            console.error("Error deleting conversation:", error);
            alert("Failed to delete conversation. Please try again.");
        });
}

function updateChatInputPosition() {
    const welcomeMessage = DOM.welcomeMessage;
    const chatInputContainer = DOM.chatInputContainer;
    const chatMessage = DOM.chatMessages;

    if (!chatInputContainer || !chatMessage) return; // Guard clause

    if (welcomeMessage && getComputedStyle(welcomeMessage).display !== "none") {
        chatInputContainer.style.bottom = "35vh";
    } else {
        chatInputContainer.style.bottom = "15px";
        chatMessage.style.paddingBottom = "120px";
    }

    setTimeout(() => {
        if (chatMessage) chatMessage.scrollTop = chatMessage.scrollHeight;
    }, 100);
}