// PromptVault Popup Script
// Handles the popup UI and interactions

// DOM Elements
const elementsToInitialize = {};

// Check for any pending actions (like saved selected text)
function checkPendingActions() {
  // Check URL parameters for actions
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  // Always check for tempSelectedText, regardless of how popup was opened
  chrome.storage.local.get(['tempSelectedText'], (result) => {
    if (result.tempSelectedText) {
      const { text, source, timestamp } = result.tempSelectedText;
      
      console.log('Found temporarily stored text, opening save dialog');
      
      // Open the save prompt modal and populate it
      elementsToInitialize.savePromptModal.style.display = 'block';
      elementsToInitialize.promptText.value = text;
      
      // Create a default title from the text (first 50 chars)
      const title = text.length > 50 ? text.substring(0, 50) + '...' : text;
      elementsToInitialize.titleInput.value = title;
      
      // Set source if available
      if (source) {
        try {
          const hostname = new URL(source).hostname;
          elementsToInitialize.sourceInput.value = hostname;
        } catch (e) {
          console.error("Error parsing URL:", e);
          elementsToInitialize.sourceInput.value = source;
        }
      }
      
      // Clear the temporary storage
      chrome.storage.local.remove('tempSelectedText');
    }
  });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize tab switching
  initTabs();
  
  // Initialize DOM elements
  initializeElements();
  
  // Load data and populate UI
  await loadPrompts();
  await loadFolders();
  await loadTags();
  await loadPreferences();
  
  // Initialize event handlers
  initEventHandlers();
  
  // Check for pending actions (like saved selected text)
  checkPendingActions();
  
  console.log('PromptVault popup initialized');
});

// Initialize tab switching functionality
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      button.classList.add('active');
      const tabId = `${button.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Initialize DOM element references
function initializeElements() {
  // Prompt list elements
  elementsToInitialize.promptsList = document.getElementById('promptsList');
  elementsToInitialize.searchInput = document.getElementById('searchInput');
  elementsToInitialize.tagsList = document.getElementById('tagsList');
  elementsToInitialize.sortBtn = document.getElementById('sortBtn');
  
  // Folder elements
  elementsToInitialize.foldersList = document.getElementById('foldersList');
  elementsToInitialize.newFolderBtn = document.getElementById('newFolderBtn');
  
  // Modal elements
  elementsToInitialize.saveCurrentBtn = document.getElementById('saveCurrentBtn');
  elementsToInitialize.newTagBtn = document.getElementById('newTagBtn');
  
  // Save prompt modal elements
  elementsToInitialize.savePromptModal = document.getElementById('savePromptModal');
  elementsToInitialize.promptText = document.getElementById('promptText');
  elementsToInitialize.folderSelect = document.getElementById('folderSelect');
  elementsToInitialize.modalTagsList = document.getElementById('modalTagsList');
  elementsToInitialize.titleInput = document.getElementById('titleInput');
  elementsToInitialize.sourceInput = document.getElementById('sourceInput');
  elementsToInitialize.savePromptBtn = document.getElementById('savePromptBtn');
  
  // Tag modal elements
  elementsToInitialize.tagModal = document.getElementById('tagModal');
  elementsToInitialize.tagNameInput = document.getElementById('tagNameInput');
  elementsToInitialize.createTagBtn = document.getElementById('createTagBtn');
  
  // Folder modal elements
  elementsToInitialize.folderModal = document.getElementById('folderModal');
  elementsToInitialize.folderNameInput = document.getElementById('folderNameInput');
  elementsToInitialize.createFolderBtn = document.getElementById('createFolderBtn');
  
  // View prompt modal elements
  elementsToInitialize.viewPromptModal = document.getElementById('viewPromptModal');
  elementsToInitialize.viewPromptTitle = document.getElementById('viewPromptTitle');
  elementsToInitialize.viewPromptTags = document.getElementById('viewPromptTags');
  elementsToInitialize.viewPromptText = document.getElementById('viewPromptText');
  elementsToInitialize.viewResponseSection = document.getElementById('viewResponseSection');
  elementsToInitialize.viewResponseText = document.getElementById('viewResponseText');
  elementsToInitialize.viewPromptFolder = document.getElementById('viewPromptFolder');
  elementsToInitialize.viewPromptDate = document.getElementById('viewPromptDate');
  elementsToInitialize.copyPromptBtn = document.getElementById('copyPromptBtn');
  elementsToInitialize.deletePromptBtn = document.getElementById('deletePromptBtn');
  elementsToInitialize.moveToFolderSelect = document.getElementById('moveToFolderSelect');
  elementsToInitialize.moveToFolderBtn = document.getElementById('moveToFolderBtn');
  // insertPromptBtn element has been removed
  
  // Settings page elements
  elementsToInitialize.settingsTagsList = document.getElementById('settingsTagsList');
  elementsToInitialize.settingsFoldersList = document.getElementById('settingsFoldersList');
  // Privacy URL button removed as per requirements
  
  // Privacy URL modal elements removed as per requirements
  
  // Close buttons for modals
  document.querySelectorAll('.close-button, .close-modal-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
}

// Initialize all event handlers
function initEventHandlers() {
  // Search input event
  elementsToInitialize.searchInput.addEventListener('input', filterPrompts);
  
  // Sort button event
  elementsToInitialize.sortBtn.addEventListener('click', toggleSortOrder);
  
  // Save current button event
  elementsToInitialize.saveCurrentBtn.addEventListener('click', openSavePromptModal);
  
  // New tag button event
  elementsToInitialize.newTagBtn.addEventListener('click', openTagModal);
  
  // New folder button event
  elementsToInitialize.newFolderBtn.addEventListener('click', openFolderModal);
  
  // Save prompt button event
  elementsToInitialize.savePromptBtn.addEventListener('click', savePrompt);
  
  // Create tag button event
  elementsToInitialize.createTagBtn.addEventListener('click', createTag);
  
  // Create folder button event
  elementsToInitialize.createFolderBtn.addEventListener('click', createFolder);
  
  // Copy prompt button event
  elementsToInitialize.copyPromptBtn.addEventListener('click', copyPromptToClipboard);
  
  // Privacy URL modal events removed as per requirements
  
  // Color selection in tag modal
  document.querySelectorAll('.color-option').forEach(colorOption => {
    colorOption.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      colorOption.classList.add('selected');
    });
  });
}

// Load prompts from storage
async function loadPrompts() {
  try {
    const response = await sendMessage({ action: 'getPrompts' });
    if (response.success) {
      const prompts = response.prompts || [];
      
      console.log(`Loaded ${prompts.length} prompts from storage`);
      
      // Sort prompts by date (newest first) and render
      prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      renderPrompts(prompts);
    }
  } catch (error) {
    console.error('Error loading prompts:', error);
  }
}

// Load folders from storage
async function loadFolders() {
  try {
    const response = await sendMessage({ action: 'getFolders' });
    if (response.success) {
      const folders = response.folders || [];
      renderFolders(folders);
      populateFolderDropdown(folders);
      renderSettingsFolders(folders);
    }
  } catch (error) {
    console.error('Error loading folders:', error);
  }
}

// Load tags from storage
async function loadTags() {
  try {
    const response = await sendMessage({ action: 'getTags' });
    if (response.success) {
      const tags = response.tags || [];
      renderTags(tags);
      populateTagsSelection(tags);
      renderSettingsTags(tags);
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

// Load preferences from storage
async function loadPreferences() {
  try {
    const response = await sendMessage({ action: 'getPreferences' });
    if (response.success) {
      const preferences = response.preferences || {};
      console.log("Loaded preferences:", preferences);
      
      // No need to update UI elements that have been removed or are not part of the design
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// Render the list of prompts
function renderPrompts(prompts) {
  elementsToInitialize.promptsList.innerHTML = '';
  
  if (!prompts || prompts.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No prompts saved yet. Use "Save Current" to capture prompts from AI chats.';
    elementsToInitialize.promptsList.appendChild(emptyMessage);
    return;
  }
  
  console.log("Rendering", prompts.length, "prompts");
  
  // Sort prompts by creation date (newest first)
  try {
    prompts.sort((a, b) => {
      // Make sure dates exist and are valid
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error sorting prompts:", error);
  }
  
  prompts.forEach(prompt => {
    try {
      if (!prompt || !prompt.id) {
        console.error("Invalid prompt object:", prompt);
        return;
      }
      
      const promptItem = document.createElement('div');
      promptItem.className = 'prompt-item';
      // Store the prompt ID as a data attribute for direct access
      promptItem.dataset.promptId = prompt.id;
      promptItem.id = `prompt-item-${prompt.id}`;
      
      // Handle missing text gracefully
      let previewText = prompt.promptText || "No text content";
      if (previewText.length > 100) {
        previewText = previewText.substring(0, 100) + '...';
      }
      
      // Use safe title or fallback
      const title = prompt.title || "Untitled Prompt";
      
      // Format date safely
      let dateStr = "";
      try {
        if (prompt.createdAt) {
          dateStr = formatDate(new Date(prompt.createdAt));
        }
      } catch (e) {
        console.warn("Error formatting date for prompt:", prompt.id, e);
      }
      
      // Generate HTML with escaped content
      promptItem.innerHTML = `
        <div class="prompt-title">${escapeHTML(title)}</div>
        <div class="prompt-preview">${escapeHTML(previewText)}</div>
        <div class="prompt-meta">
          <span>${dateStr}</span>
          <span>${prompt.source ? escapeHTML(prompt.source) : ''}</span>
        </div>
        <div class="prompt-tags" id="prompt-tags-${prompt.id}"></div>
      `;
      
      promptItem.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Prompt clicked:", prompt.id);
        viewPrompt(prompt.id);
      });
      
      elementsToInitialize.promptsList.appendChild(promptItem);
      
      // Add tags to the prompt item if available
      if (prompt.tagIds && Array.isArray(prompt.tagIds) && prompt.tagIds.length > 0) {
        renderPromptTags(prompt.id, prompt.tagIds);
      }
    } catch (error) {
      console.error("Error rendering prompt:", error, prompt);
    }
  });
}

// Render tags for a specific prompt
async function renderPromptTags(promptId, tagIds) {
  try {
    const response = await sendMessage({ action: 'getTags' });
    if (response.success) {
      const allTags = response.tags || [];
      const tagsContainer = document.getElementById(`prompt-tags-${promptId}`);
      
      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        
        const promptTags = allTags.filter(tag => tagIds.includes(tag.id));
        promptTags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'tag';
          tagElement.textContent = tag.name;
          tagElement.dataset.color = tag.color;
          tagElement.style.backgroundColor = tag.color;
          
          tagsContainer.appendChild(tagElement);
        });
      }
    }
  } catch (error) {
    console.error('Error rendering prompt tags:', error);
  }
}

// Render the list of folders
function renderFolders(folders) {
  elementsToInitialize.foldersList.innerHTML = '';
  
  folders.forEach(folder => {
    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    folderItem.dataset.id = folder.id;
    
    folderItem.innerHTML = `
      <div class="folder-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="folder-name">${escapeHTML(folder.name)}</div>
      <div class="folder-count" id="folder-count-${folder.id}">0</div>
    `;
    
    folderItem.addEventListener('click', () => {
      filterPromptsByFolder(folder.id);
    });
    
    elementsToInitialize.foldersList.appendChild(folderItem);
    
    // Count prompts in this folder
    updateFolderCount(folder.id);
  });
}

// Update count of prompts in a folder
async function updateFolderCount(folderId) {
  try {
    const response = await sendMessage({ action: 'getPrompts' });
    if (response.success) {
      const prompts = response.prompts || [];
      const count = prompts.filter(p => p.folderId === folderId).length;
      
      const countElement = document.getElementById(`folder-count-${folderId}`);
      if (countElement) {
        countElement.textContent = count;
      }
    }
  } catch (error) {
    console.error('Error updating folder count:', error);
  }
}

// Render the tags list for filtering
function renderTags(tags) {
  elementsToInitialize.tagsList.innerHTML = '';
  
  tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.textContent = tag.name;
    tagElement.dataset.id = tag.id;
    tagElement.dataset.color = tag.color;
    tagElement.style.backgroundColor = tag.color;
    
    tagElement.addEventListener('click', () => {
      filterPromptsByTag(tag.id);
      
      // Toggle selected state
      tagElement.classList.toggle('selected');
    });
    
    elementsToInitialize.tagsList.appendChild(tagElement);
  });
}

// Populate the folder dropdown in the save prompt modal
function populateFolderDropdown(folders) {
  elementsToInitialize.folderSelect.innerHTML = '<option value="null">No folder</option>';
  
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    elementsToInitialize.folderSelect.appendChild(option);
  });
}

// Populate the tags selection in the save prompt modal
function populateTagsSelection(tags) {
  elementsToInitialize.modalTagsList.innerHTML = '';
  
  tags.forEach(tag => {
    const tagCheckbox = document.createElement('div');
    tagCheckbox.className = 'checkbox-group';
    
    tagCheckbox.innerHTML = `
      <input type="checkbox" id="tag-${tag.id}" data-tag-id="${tag.id}">
      <label for="tag-${tag.id}" style="color: ${tag.color}">${escapeHTML(tag.name)}</label>
    `;
    
    elementsToInitialize.modalTagsList.appendChild(tagCheckbox);
  });
}

// Filter prompts based on search input
function filterPrompts() {
  const searchText = elementsToInitialize.searchInput.value.toLowerCase();
  const promptItems = document.querySelectorAll('.prompt-item');
  
  promptItems.forEach(item => {
    const title = item.querySelector('.prompt-title').textContent.toLowerCase();
    const preview = item.querySelector('.prompt-preview').textContent.toLowerCase();
    
    if (title.includes(searchText) || preview.includes(searchText)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Filter prompts by folder ID
async function filterPromptsByFolder(folderId) {
  try {
    // Get folder name
    const foldersResponse = await sendMessage({ action: 'getFolders' });
    if (foldersResponse.success) {
      const folders = foldersResponse.folders || [];
      const selectedFolder = folders.find(f => f.id === folderId);
      
      if (selectedFolder) {
        // Switch to prompts tab
        document.querySelector('[data-tab="prompts"]').click();
        
        // Update title to show we're filtering
        const sectionTitle = document.querySelector('.section-title span');
        if (sectionTitle) {
          sectionTitle.textContent = `Prompts in "${selectedFolder.name}"`;
        }
        
        // Get and filter prompts
        const response = await sendMessage({ action: 'getPrompts' });
        if (response.success) {
          const prompts = response.prompts || [];
          const filteredPrompts = prompts.filter(p => p.folderId === folderId);
          renderPrompts(filteredPrompts);
          
          // Add a "back to all" button
          const promptsList = document.getElementById('promptsList');
          if (promptsList) {
            const backButton = document.createElement('div');
            backButton.className = 'back-button';
            backButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Back to All Prompts
            `;
            
            backButton.addEventListener('click', async (e) => {
              e.stopPropagation();
              sectionTitle.textContent = 'Recent Prompts';
              await loadPrompts();
            });
            
            // Insert at the beginning of the list
            if (promptsList.firstChild) {
              promptsList.insertBefore(backButton, promptsList.firstChild);
            } else {
              promptsList.appendChild(backButton);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error filtering prompts by folder:', error);
  }
}

// Filter prompts by tag ID
async function filterPromptsByTag(tagId) {
  try {
    // Get tag name
    const tagsResponse = await sendMessage({ action: 'getTags' });
    if (tagsResponse.success) {
      const tags = tagsResponse.tags || [];
      const selectedTag = tags.find(t => t.id === tagId);
      
      if (selectedTag) {
        // Switch to prompts tab
        document.querySelector('[data-tab="prompts"]').click();
        
        // Update title to show we're filtering
        const sectionTitle = document.querySelector('.section-title span');
        if (sectionTitle) {
          sectionTitle.textContent = `Prompts with tag "${selectedTag.name}"`;
        }
        
        // Get and filter prompts
        const response = await sendMessage({ action: 'getPrompts' });
        if (response.success) {
          const prompts = response.prompts || [];
          const filteredPrompts = prompts.filter(p => p.tagIds && p.tagIds.includes(tagId));
          renderPrompts(filteredPrompts);
          
          // Add a "back to all" button
          const promptsList = document.getElementById('promptsList');
          if (promptsList) {
            const backButton = document.createElement('div');
            backButton.className = 'back-button';
            backButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Back to All Prompts
            `;
            
            backButton.addEventListener('click', async (e) => {
              e.stopPropagation();
              sectionTitle.textContent = 'Recent Prompts';
              await loadPrompts();
            });
            
            // Insert at the beginning of the list
            if (promptsList.firstChild) {
              promptsList.insertBefore(backButton, promptsList.firstChild);
            } else {
              promptsList.appendChild(backButton);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error filtering prompts by tag:', error);
  }
}

// Toggle the sort order of prompts
let sortNewestFirst = true;
async function toggleSortOrder() {
  try {
    const response = await sendMessage({ action: 'getPrompts' });
    if (response.success) {
      const prompts = response.prompts || [];
      
      sortNewestFirst = !sortNewestFirst;
      
      if (sortNewestFirst) {
        prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        prompts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
      
      renderPrompts(prompts);
    }
  } catch (error) {
    console.error('Error toggling sort order:', error);
  }
}

// Download prompts as a ZIP file
async function downloadPrompts() {
  try {
    // Get all prompts
    const promptsResponse = await sendMessage({ action: 'getPrompts' });
    if (!promptsResponse.success) throw new Error('Failed to get prompts');
    
    // Get all folders
    const foldersResponse = await sendMessage({ action: 'getFolders' });
    if (!foldersResponse.success) throw new Error('Failed to get folders');
    
    // Get all tags
    const tagsResponse = await sendMessage({ action: 'getTags' });
    if (!tagsResponse.success) throw new Error('Failed to get tags');
    
    // Get preferences
    const preferencesResponse = await sendMessage({ action: 'getPreferences' });
    if (!preferencesResponse.success) throw new Error('Failed to get preferences');
    
    const prompts = promptsResponse.prompts || [];
    const folders = foldersResponse.folders || [];
    const tags = tagsResponse.tags || [];
    const preferences = preferencesResponse.preferences || {};
    
    // Use default export options
    const exportOptions = {
      includeTags: true,
      includeTimestamps: true,
      exportAsJson: true,
      lastBackup: new Date().toISOString()
    };
    
    // Save updated preferences
    await sendMessage({
      action: 'updatePreferences',
      preferences: exportOptions
    });
    
    console.log("Exporting data with options:", exportOptions);
    
    // Prepare data for export
    const exportData = {
      prompts: preparePromptsForExport(prompts, folders, tags, exportOptions),
      folders: folders,
      tags: exportOptions.includeTags ? tags : undefined,
      exportDate: new Date().toISOString()
    };
    
    // Export as JSON
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_vault_export_${formatDateForFilename(new Date())}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('Prompts exported successfully!');
  } catch (error) {
    console.error('Error downloading prompts:', error);
    alert('Failed to download prompts. Please try again.');
  }
}

// Prepare prompts for export based on preferences
function preparePromptsForExport(prompts, folders, tags, preferences) {
  return prompts.map(prompt => {
    const exportPrompt = {
      id: prompt.id,
      title: prompt.title,
      promptText: prompt.promptText,
      responseText: prompt.responseText
    };
    
    // Include timestamps if selected
    if (preferences.includeTimestamps) {
      exportPrompt.createdAt = prompt.createdAt;
    }
    
    // Include folder name if applicable
    if (prompt.folderId) {
      const folder = folders.find(f => f.id === prompt.folderId);
      if (folder) {
        exportPrompt.folder = folder.name;
      }
    }
    
    // Include tags if selected
    if (preferences.includeTags && prompt.tagIds && prompt.tagIds.length > 0) {
      exportPrompt.tags = prompt.tagIds.map(tagId => {
        const tag = tags.find(t => t.id === tagId);
        return tag ? tag.name : null;
      }).filter(Boolean);
    }
    
    return exportPrompt;
  });
}

// Update preferences based on current UI state
async function updatePreferences() {
  // Using default preferences since UI elements have been removed
  const preferences = {
    includeTags: true,
    includeTimestamps: true,
    exportAsJson: true
  };
  
  try {
    await sendMessage({
      action: 'updatePreferences',
      preferences: preferences
    });
    console.log("Updated preferences:", preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
}

// Open the save prompt modal
function openSavePromptModal() {
  // Reset form fields
  elementsToInitialize.promptText.value = '';
  elementsToInitialize.titleInput.value = '';
  elementsToInitialize.sourceInput.value = '';
  elementsToInitialize.folderSelect.value = 'null';
  
  // Reset tag checkboxes
  document.querySelectorAll('#modalTagsList input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Get active tab
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    
    // Try to extract text from the current tab
    try {
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: getCurrentChatContent
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const { prompt, response } = results[0].result;
          
          if (prompt) {
            elementsToInitialize.promptText.value = prompt;
            
            // Generate a default title from the first line of the prompt
            const firstLine = prompt.split('\n')[0];
            elementsToInitialize.titleInput.value = firstLine.length > 50 
              ? firstLine.substring(0, 50) + '...' 
              : firstLine;
            
            // Set the source based on the current URL
            if (activeTab.url) {
              try {
                const hostname = new URL(activeTab.url).hostname;
                elementsToInitialize.sourceInput.value = hostname;
              } catch (e) {
                console.error("Error parsing URL:", e);
                elementsToInitialize.sourceInput.value = 'manual';
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error extracting chat content:', error);
    }
    
    // Reset sourceInput if it wasn't set above
    if (!elementsToInitialize.sourceInput.value) {
      elementsToInitialize.sourceInput.value = 'manual';
    }
    
    // Show the modal
    elementsToInitialize.savePromptModal.style.display = 'block';
  });
}

// Extract prompt and response from current chat page
function getCurrentChatContent() {
  // Function to be executed in the context of the page
  let prompt = '';
  let response = '';
  
  // Attempt to detect AI platform and extract content
  if (window.location.href.includes('chat.openai.com')) {
    // ChatGPT
    const promptElements = document.querySelectorAll('[data-message-author-role="user"]');
    const responseElements = document.querySelectorAll('[data-message-author-role="assistant"]');
    
    if (promptElements.length > 0) {
      prompt = promptElements[promptElements.length - 1].textContent.trim();
    }
    
    if (responseElements.length > 0) {
      response = responseElements[responseElements.length - 1].textContent.trim();
    }
  } else if (window.location.href.includes('claude.ai')) {
    // Claude
    const promptElements = document.querySelectorAll('.human-message-content');
    const responseElements = document.querySelectorAll('.assistant-message-content');
    
    if (promptElements.length > 0) {
      prompt = promptElements[promptElements.length - 1].textContent.trim();
    }
    
    if (responseElements.length > 0) {
      response = responseElements[responseElements.length - 1].textContent.trim();
    }
  } else if (window.location.href.includes('gemini.google.com')) {
    // Gemini
    const promptElements = document.querySelectorAll('.user-query');
    const responseElements = document.querySelectorAll('.model-response');
    
    if (promptElements.length > 0) {
      prompt = promptElements[promptElements.length - 1].textContent.trim();
    }
    
    if (responseElements.length > 0) {
      response = responseElements[responseElements.length - 1].textContent.trim();
    }
  }
  
  return { prompt, response };
}

// Open the tag creation modal
function openTagModal() {
  // Reset form fields
  elementsToInitialize.tagNameInput.value = '';
  
  // Reset color selection
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector('.color-option').classList.add('selected');
  
  // Show the modal
  elementsToInitialize.tagModal.style.display = 'block';
}

// Open the folder creation modal
function openFolderModal() {
  // Reset form fields
  elementsToInitialize.folderNameInput.value = '';
  
  // Show the modal
  elementsToInitialize.folderModal.style.display = 'block';
}

// Save a prompt
async function savePrompt() {
  const promptText = elementsToInitialize.promptText.value.trim();
  const title = elementsToInitialize.titleInput.value.trim();
  let folderId = elementsToInitialize.folderSelect.value;
  
  // Convert folderId to number or null
  folderId = folderId === 'null' ? null : parseInt(folderId, 10);
  
  // Get selected tags
  const tagIds = [];
  document.querySelectorAll('#modalTagsList input[type="checkbox"]:checked').forEach(checkbox => {
    tagIds.push(parseInt(checkbox.dataset.tagId, 10));
  });
  
  if (!promptText) {
    alert('Please enter a prompt text');
    return;
  }
  
  try {
    // Get the source value if the field exists
    let source = 'manual';
    if (elementsToInitialize.sourceInput && elementsToInitialize.sourceInput.value) {
      source = elementsToInitialize.sourceInput.value;
    }
    
    const promptData = {
      title: title || 'Untitled Prompt',
      promptText: promptText,
      folderId: folderId,
      tagIds: tagIds,
      source: source,
      createdAt: new Date().toISOString()
    };
    
    const response = await sendMessage({
      action: 'savePrompt',
      data: promptData
    });
    
    if (response.success) {
      // Close the modal
      elementsToInitialize.savePromptModal.style.display = 'none';
      
      // Reload prompts
      await loadPrompts();
      
      // Update folder counts
      if (folderId) {
        updateFolderCount(folderId);
      }
    } else {
      alert('Failed to save prompt. Please try again.');
    }
  } catch (error) {
    console.error('Error saving prompt:', error);
    alert('An error occurred while saving the prompt');
  }
}

// Create a new tag
async function createTag() {
  const name = elementsToInitialize.tagNameInput.value.trim();
  
  if (!name) {
    alert('Please enter a tag name');
    return;
  }
  
  // Get selected color
  const selectedColor = document.querySelector('.color-option.selected');
  const color = selectedColor ? selectedColor.dataset.color : '#4A7BF7';
  
  try {
    const response = await sendMessage({
      action: 'createTag',
      name: name,
      color: color
    });
    
    if (response.success) {
      // Close the modal
      elementsToInitialize.tagModal.style.display = 'none';
      
      // Reload tags
      await loadTags();
    } else {
      alert('Failed to create tag. Please try again.');
    }
  } catch (error) {
    console.error('Error creating tag:', error);
    alert('An error occurred while creating the tag');
  }
}

// Create a new folder
async function createFolder() {
  const name = elementsToInitialize.folderNameInput.value.trim();
  
  if (!name) {
    alert('Please enter a folder name');
    return;
  }
  
  try {
    const response = await sendMessage({
      action: 'createFolder',
      name: name
    });
    
    if (response.success) {
      // Close the modal
      elementsToInitialize.folderModal.style.display = 'none';
      
      // Reload folders
      await loadFolders();
    } else {
      alert('Failed to create folder. Please try again.');
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    alert('An error occurred while creating the folder');
  }
}

// View a specific prompt
async function viewPrompt(promptId) {
  try {
    console.log("Viewing prompt with ID:", promptId);
    const response = await sendMessage({
      action: 'getPrompt',
      id: promptId
    });
    
    if (response.success) {
      const prompt = response.prompt;
      console.log("Prompt data received:", prompt);
      
      // Set modal content
      elementsToInitialize.viewPromptTitle.textContent = prompt.title;
      elementsToInitialize.viewPromptText.textContent = prompt.promptText;
      
      // Show or hide response section
      if (prompt.responseText) {
        elementsToInitialize.viewResponseSection.style.display = 'block';
        elementsToInitialize.viewResponseText.textContent = prompt.responseText;
      } else {
        elementsToInitialize.viewResponseSection.style.display = 'none';
      }
      
      // Set folder info
      if (prompt.folderId) {
        const foldersResponse = await sendMessage({ action: 'getFolders' });
        if (foldersResponse.success) {
          const folder = foldersResponse.folders.find(f => f.id === prompt.folderId);
          if (folder) {
            elementsToInitialize.viewPromptFolder.textContent = `Folder: ${folder.name}`;
          } else {
            elementsToInitialize.viewPromptFolder.textContent = '';
          }
        }
      } else {
        elementsToInitialize.viewPromptFolder.textContent = '';
      }
      
      // Set date
      elementsToInitialize.viewPromptDate.textContent = `Created: ${formatDate(new Date(prompt.createdAt))}`;
      
      // Set tags
      elementsToInitialize.viewPromptTags.innerHTML = '';
      if (prompt.tagIds && prompt.tagIds.length > 0) {
        const tagsResponse = await sendMessage({ action: 'getTags' });
        if (tagsResponse.success) {
          const tags = tagsResponse.tags || [];
          prompt.tagIds.forEach(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (tag) {
              const tagElement = document.createElement('span');
              tagElement.className = 'tag';
              tagElement.textContent = tag.name;
              tagElement.style.backgroundColor = tag.color;
              elementsToInitialize.viewPromptTags.appendChild(tagElement);
            }
          });
        }
      }
      
      // Set data attributes for copy action
      elementsToInitialize.copyPromptBtn.dataset.promptText = prompt.promptText;
      
      // The insert button has been completely removed
      // No need to set data for it anymore
      
      // Populate the "Move to folder" dropdown
      const foldersResponse = await sendMessage({ action: 'getFolders' });
      if (foldersResponse.success) {
        const folders = foldersResponse.folders || [];
        elementsToInitialize.moveToFolderSelect.innerHTML = '<option value="">Move to folder...</option><option value="null">No folder</option>';
        
        folders.forEach(folder => {
          const option = document.createElement('option');
          option.value = folder.id;
          option.textContent = folder.name;
          // If this is the current folder, select it
          if (prompt.folderId !== null && prompt.folderId === folder.id) {
            option.selected = true;
          }
          elementsToInitialize.moveToFolderSelect.appendChild(option);
        });
      }
      
      // Set up delete button
      elementsToInitialize.deletePromptBtn.onclick = async () => {
        if (confirm('Are you sure you want to delete this prompt?')) {
          const deleteResponse = await sendMessage({
            action: 'deletePrompt',
            id: promptId
          });
          
          if (deleteResponse.success) {
            // Close the modal
            elementsToInitialize.viewPromptModal.style.display = 'none';
            // Reload prompts list
            await loadPrompts();
          } else {
            alert('Failed to delete prompt');
          }
        }
      };
      
      // Set up move to folder button
      elementsToInitialize.moveToFolderBtn.onclick = async () => {
        const newFolderId = elementsToInitialize.moveToFolderSelect.value;
        if (newFolderId === '') {
          alert('Please select a folder');
          return;
        }
        
        // Convert to null or number
        const folderId = newFolderId === 'null' ? null : parseInt(newFolderId);
        
        const updateResponse = await sendMessage({
          action: 'updatePrompt',
          id: promptId,
          prompt: { folderId }
        });
        
        if (updateResponse.success) {
          // Close the modal
          elementsToInitialize.viewPromptModal.style.display = 'none';
          // Reload prompts list
          await loadPrompts();
        } else {
          alert('Failed to move prompt to folder');
        }
      };
      
      // Show the modal - make sure it's visible
      elementsToInitialize.viewPromptModal.style.display = 'block';
      console.log("Modal should be visible now");
    } else {
      console.error("Failed to load prompt details", response);
      alert('Failed to load prompt details');
    }
  } catch (error) {
    console.error('Error viewing prompt:', error);
    alert('An error occurred while loading the prompt details');
  }
}

// Copy prompt to clipboard
function copyPromptToClipboard() {
  const promptText = elementsToInitialize.copyPromptBtn.dataset.promptText;
  
  if (promptText) {
    navigator.clipboard.writeText(promptText)
      .then(() => {
        alert('Prompt copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy prompt:', err);
        alert('Failed to copy prompt. Please try again.');
      });
  }
}

// Function removed per user request
// This functionality has been completely removed
/*
function insertPromptToChat() {
  const promptText = elementsToInitialize.insertPromptBtn.dataset.promptText;
  
  if (promptText) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'insertPrompt',
        promptText: promptText
      }, response => {
        if (response && response.success) {
          elementsToInitialize.viewPromptModal.style.display = 'none';
          window.close(); // Close popup to return to the chat
        } else {
          alert('Failed to insert prompt. Make sure you are on a supported AI chat interface.');
        }
      });
    });
  }
}
*/

// Send a message to the background script
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Format date for display
function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Format date for filename
function formatDateForFilename(date) {
  return date.toISOString().split('T')[0];
}

// Escape HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Open the privacy URL modal
// Functions for privacy URL modal removed as per requirements

// Render tags in settings page
function renderSettingsTags(tags) {
  if (!elementsToInitialize.settingsTagsList) return;
  
  elementsToInitialize.settingsTagsList.innerHTML = '';
  
  if (tags.length === 0) {
    elementsToInitialize.settingsTagsList.innerHTML = '<div class="empty-state">No tags created yet</div>';
    return;
  }
  
  tags.forEach(tag => {
    const tagItem = document.createElement('div');
    tagItem.className = 'settings-tag-item';
    
    tagItem.innerHTML = `
      <div class="settings-tag-item-name">
        <div class="settings-tag-color" style="background-color: ${tag.color}"></div>
        <span>${escapeHTML(tag.name)}</span>
      </div>
      <button class="settings-delete-btn" data-tag-id="${tag.id}">
        &times;
      </button>
    `;
    
    const deleteBtn = tagItem.querySelector('.settings-delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
        try {
          // First get all prompts that use this tag
          const promptsResponse = await sendMessage({ action: 'getPrompts' });
          if (promptsResponse.success) {
            const prompts = promptsResponse.prompts || [];
            
            // For each prompt that has this tag, update it to remove the tag
            for (const prompt of prompts) {
              if (prompt.tagIds && prompt.tagIds.includes(tag.id)) {
                // Remove this tag ID from the prompt's tagIds array
                const updatedTagIds = prompt.tagIds.filter(id => id !== tag.id);
                
                // Update the prompt
                await sendMessage({
                  action: 'updatePrompt',
                  id: prompt.id,
                  prompt: { tagIds: updatedTagIds }
                });
              }
            }
          }
          
          // Then delete the tag
          const response = await sendMessage({
            action: 'deleteTag',
            id: tag.id
          });
          
          if (response.success) {
            // Reload tags data
            loadTags();
          } else {
            alert('Failed to delete tag. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting tag:', error);
          alert('An error occurred while deleting the tag.');
        }
      }
    });
    
    elementsToInitialize.settingsTagsList.appendChild(tagItem);
  });
}

// Render folders in settings page
function renderSettingsFolders(folders) {
  if (!elementsToInitialize.settingsFoldersList) return;
  
  elementsToInitialize.settingsFoldersList.innerHTML = '';
  
  if (folders.length === 0) {
    elementsToInitialize.settingsFoldersList.innerHTML = '<div class="empty-state">No folders created yet</div>';
    return;
  }
  
  folders.forEach(folder => {
    const folderItem = document.createElement('div');
    folderItem.className = 'settings-folder-item';
    
    folderItem.innerHTML = `
      <div class="folder-name">${escapeHTML(folder.name)}</div>
      <button class="settings-delete-btn" data-folder-id="${folder.id}">
        &times;
      </button>
    `;
    
    const deleteBtn = folderItem.querySelector('.settings-delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
        try {
          // First get all prompts in this folder
          const promptsResponse = await sendMessage({ action: 'getPrompts' });
          if (promptsResponse.success) {
            const prompts = promptsResponse.prompts || [];
            
            // For each prompt in this folder, update it to remove the folder
            for (const prompt of prompts) {
              if (prompt.folderId === folder.id) {
                // Update the prompt to have no folder
                await sendMessage({
                  action: 'updatePrompt',
                  id: prompt.id,
                  prompt: { folderId: null }
                });
              }
            }
          }
          
          // Then delete the folder
          const response = await sendMessage({
            action: 'deleteFolder',
            id: folder.id
          });
          
          if (response.success) {
            // Reload folders data
            loadFolders();
            // Also update settings folders display
            const foldersResponse = await sendMessage({ action: 'getFolders' });
            if (foldersResponse.success) {
              renderSettingsFolders(foldersResponse.folders || []);
            }
          } else {
            alert('Failed to delete folder. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting folder:', error);
          alert('An error occurred while deleting the folder.');
        }
      }
    });
    
    elementsToInitialize.settingsFoldersList.appendChild(folderItem);
  });
}