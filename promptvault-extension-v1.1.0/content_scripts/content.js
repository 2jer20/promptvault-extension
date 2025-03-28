// PromptVault Content Script
// Captures prompts and responses from AI chat interfaces

// Identify which AI chat platform we're on
const currentURL = window.location.href;
let platform = '';

if (currentURL.includes('chat.openai.com')) {
  platform = 'openai';
} else if (currentURL.includes('claude.ai')) {
  platform = 'claude';
} else if (currentURL.includes('gemini.google.com')) {
  platform = 'gemini';
} else if (currentURL.includes('x.ai')) {
  platform = 'x.ai';
} else if (currentURL.includes('deepseek.com')) {
  platform = 'deepseek';
}

console.log(`PromptVault activated on ${platform}`);

// Create capture button
function injectCaptureButton() {
  // Create button container
  const captureButtonContainer = document.createElement('div');
  captureButtonContainer.className = 'pv-capture-button-container';
  
  // Create button
  const captureButton = document.createElement('button');
  captureButton.className = 'pv-capture-button';
  captureButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    <span>Save Prompt</span>
  `;
  
  captureButtonContainer.appendChild(captureButton);
  document.body.appendChild(captureButtonContainer);
  
  // Add click event listener
  captureButton.addEventListener('click', captureCurrentPrompt);
}

// Capture the current prompt and response
function captureCurrentPrompt() {
  let promptText = '';
  let responseText = '';
  
  switch (platform) {
    case 'openai':
      promptText = captureOpenAIPrompt();
      responseText = captureOpenAIResponse();
      break;
    case 'claude':
      promptText = captureClaudePrompt();
      responseText = captureClaudeResponse();
      break;
    case 'gemini':
      promptText = captureGeminiPrompt();
      responseText = captureGeminiResponse();
      break;
    case 'x.ai':
      promptText = captureXAIPrompt();
      responseText = captureXAIResponse();
      break;
    case 'deepseek':
      promptText = captureDeepseekPrompt();
      responseText = captureDeepseekResponse();
      break;
    default:
      console.log('Platform not supported for capturing');
      return;
  }
  
  if (promptText || responseText) {
    // Send prompt data to background script for storage
    chrome.runtime.sendMessage({
      action: 'savePrompt',
      data: {
        promptText,
        responseText,
        source: window.location.hostname || platform,
        createdAt: new Date().toISOString()
      }
    }, (response) => {
      if (response && response.success) {
        showNotification('Prompt saved successfully!');
      } else {
        showNotification('Failed to save prompt', true);
      }
    });
  } else {
    showNotification('No prompt or response found to capture', true);
  }
}

// Platform-specific capture functions
function captureOpenAIPrompt() {
  // Find the most recent user prompt in ChatGPT
  const promptElements = document.querySelectorAll('[data-message-author-role="user"]');
  if (promptElements.length > 0) {
    const lastPromptElement = promptElements[promptElements.length - 1];
    return lastPromptElement.textContent.trim();
  }
  return '';
}

function captureOpenAIResponse() {
  // Find the most recent assistant response in ChatGPT
  const responseElements = document.querySelectorAll('[data-message-author-role="assistant"]');
  if (responseElements.length > 0) {
    const lastResponseElement = responseElements[responseElements.length - 1];
    return lastResponseElement.textContent.trim();
  }
  return '';
}

function captureClaudePrompt() {
  // Placeholder for Claude-specific prompt capturing
  const promptElements = document.querySelectorAll('.human-message-content');
  if (promptElements.length > 0) {
    const lastPromptElement = promptElements[promptElements.length - 1];
    return lastPromptElement.textContent.trim();
  }
  return '';
}

function captureClaudeResponse() {
  // Placeholder for Claude-specific response capturing
  const responseElements = document.querySelectorAll('.assistant-message-content');
  if (responseElements.length > 0) {
    const lastResponseElement = responseElements[responseElements.length - 1];
    return lastResponseElement.textContent.trim();
  }
  return '';
}

function captureGeminiPrompt() {
  // Placeholder for Gemini-specific prompt capturing
  const promptElements = document.querySelectorAll('.user-query');
  if (promptElements.length > 0) {
    const lastPromptElement = promptElements[promptElements.length - 1];
    return lastPromptElement.textContent.trim();
  }
  return '';
}

function captureGeminiResponse() {
  // Placeholder for Gemini-specific response capturing
  const responseElements = document.querySelectorAll('.model-response');
  if (responseElements.length > 0) {
    const lastResponseElement = responseElements[responseElements.length - 1];
    return lastResponseElement.textContent.trim();
  }
  return '';
}

function captureXAIPrompt() {
  // Placeholder for X.AI-specific prompt capturing
  return document.querySelector('.user-message')?.textContent.trim() || '';
}

function captureXAIResponse() {
  // Placeholder for X.AI-specific response capturing
  return document.querySelector('.ai-message')?.textContent.trim() || '';
}

function captureDeepseekPrompt() {
  // Placeholder for Deepseek-specific prompt capturing
  return document.querySelector('.user-message')?.textContent.trim() || '';
}

function captureDeepseekResponse() {
  // Placeholder for Deepseek-specific response capturing
  return document.querySelector('.assistant-message')?.textContent.trim() || '';
}

// Show notification
function showNotification(message, isError = false) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `pv-notification ${isError ? 'pv-notification-error' : 'pv-notification-success'}`;
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.add('pv-notification-hide');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Function for copying prompt to clipboard
function copyPromptToClipboard(promptText) {
  console.log("Copying prompt to clipboard");
  
  try {
    // Use Clipboard API to copy text to clipboard
    navigator.clipboard.writeText(promptText).then(() => {
      console.log("Text copied to clipboard successfully");
      showNotification("Prompt copied to clipboard successfully");
      return true;
    }).catch(e => {
      console.error("Clipboard write failed:", e);
      showNotification("Failed to copy to clipboard", true);
      return false;
    });
  } catch (e) {
    console.error("Clipboard API not available:", e);
    showNotification("Clipboard functionality not available", true);
    return false;
  }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === 'copyPrompt' && message.promptText) {
    console.log("Copying prompt:", message.promptText.substring(0, 30) + "...");
    copyPromptToClipboard(message.promptText);
    sendResponse({ success: true });
    return true;
  } else if (message.action === 'showNotification') {
    console.log("Showing notification:", message.message);
    showNotification(message.message, message.isError);
    sendResponse({ success: true });
    return true;
  }
  
  // Always return true for asynchronous response
  return true;
});

// Initialize on page load
function initialize() {
  if (platform) {
    injectCaptureButton();
    
    // Observe DOM changes to re-inject button if needed
    const observer = new MutationObserver((mutations) => {
      if (!document.querySelector('.pv-capture-button-container')) {
        injectCaptureButton();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Run initialization when page is fully loaded
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}