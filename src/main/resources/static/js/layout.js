document.addEventListener("DOMContentLoaded", function() {
    // Get the floating chatbot container
    const floatingChatbotContainer = document.getElementById('floating-chatbot-container');
    if (!floatingChatbotContainer) return;

    // Check for data attribute first (more reliable with Thymeleaf)
    const contentPath = floatingChatbotContainer.getAttribute('data-content-path');

    // If we have the data attribute and it indicates we're on the chatbot page, hide the container
    if (contentPath === 'chatbots/chatbot') {
        floatingChatbotContainer.style.display = 'none';
    }
    // Fallback: check URL if no data attribute or for additional safety
    else if (window.location.pathname.includes('/chatbots/chatbot')) {
        floatingChatbotContainer.style.display = 'none';
    }

    // Add console log for debugging
    console.log('Floating chatbot visibility check - Content path:', contentPath, 'Container visibility:', floatingChatbotContainer.style.display);
});