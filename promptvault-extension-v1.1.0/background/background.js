// PromptVault Background Script
// Handles storage and communication between popup and content scripts

// Initialize data structure in Chrome storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['prompts', 'folders', 'tags', 'preferences'], (result) => {
    // Initialize prompts if not exists
    if (!result.prompts) {
      chrome.storage.local.set({ prompts: [] });
    }
    
    // Initialize folders if not exists
    if (!result.folders) {
      chrome.storage.local.set({
        folders: [
          { id: 1, name: 'Favorites' }
        ]
      });
    }
    
    // Initialize tags if not exists
    if (!result.tags) {
      chrome.storage.local.set({
        tags: [
          { id: 1, name: 'Important', color: '#EF4444' },
          { id: 2, name: 'Work', color: '#10B981' },
          { id: 3, name: 'Personal', color: '#4A7BF7' }
        ]
      });
    }
    
    // Initialize preferences if not exists
    if (!result.preferences) {
      chrome.storage.local.set({
        preferences: {
          includeTags: true,
          includeTimestamps: true,
          exportAsJson: true,
          lastBackup: null
        }
      });
    }
    
    // Create context menus
    chrome.contextMenus.create({
      id: "saveSelectedText",
      title: "Save to PromptVault",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "pastePrompt",
      title: "Paste prompt from PromptVault",
      contexts: ["editable"]
    });
    
    chrome.contextMenus.create({
      id: "promptsSubmenu",
      title: "Select prompt to paste",
      parentId: "pastePrompt",
      contexts: ["editable"]
    });
    
    console.log('PromptVault initialized');
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  switch (message.action) {
    case 'savePrompt':
      handleSavePrompt(message.data, sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'getPrompts':
      handleGetPrompts(sendResponse);
      return true;
      
    case 'getPrompt':
      handleGetPrompt(message.id, sendResponse);
      return true;
      
    case 'deletePrompt':
      handleDeletePrompt(message.id, sendResponse);
      return true;
      
    case 'updatePrompt':
      handleUpdatePrompt(message.id, message.prompt, sendResponse);
      return true;
      
    case 'getFolders':
      handleGetFolders(sendResponse);
      return true;
      
    case 'deleteFolder':
      handleDeleteFolder(message.id, sendResponse);
      return true;
      
    case 'createFolder':
      handleCreateFolder(message.name, sendResponse);
      return true;
      
    case 'getTags':
      handleGetTags(sendResponse);
      return true;
      
    case 'deleteTag':
      handleDeleteTag(message.id, sendResponse);
      return true;
      
    case 'createTag':
      handleCreateTag(message.name, message.color, sendResponse);
      return true;
      
    case 'updatePreferences':
      handleUpdatePreferences(message.preferences, sendResponse);
      return true;
      
    case 'getPreferences':
      handleGetPreferences(sendResponse);
      return true;
  }
});

// Handle saving a prompt
function handleSavePrompt(promptData, sendResponse) {
  chrome.storage.local.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    
    // Generate a unique ID for the prompt
    const newId = prompts.length > 0 
      ? Math.max(...prompts.map(p => p.id)) + 1 
      : 1;
    
    // Create a default title if not provided
    if (!promptData.title) {
      const previewText = promptData.promptText.substring(0, 50);
      promptData.title = previewText.length < promptData.promptText.length
        ? `${previewText}...`
        : previewText;
    }
    
    // Add new prompt
    const newPrompt = {
      id: newId,
      title: promptData.title,
      promptText: promptData.promptText,
      responseText: promptData.responseText,
      folderId: promptData.folderId || null,
      tagIds: promptData.tagIds || [],
      source: promptData.source || 'manual',
      createdAt: promptData.createdAt || new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    
    chrome.storage.local.set({ prompts }, () => {
      sendResponse({ success: true, prompt: newPrompt });
    });
  });
}

// Handle getting all prompts
function handleGetPrompts(sendResponse) {
  chrome.storage.local.get(['prompts'], (result) => {
    sendResponse({ success: true, prompts: result.prompts || [] });
  });
}

// Handle getting a single prompt by ID
function handleGetPrompt(id, sendResponse) {
  chrome.storage.local.get(['prompts'], (result) => {
    const prompt = (result.prompts || []).find(p => p.id === id);
    if (prompt) {
      sendResponse({ success: true, prompt });
    } else {
      sendResponse({ success: false, message: 'Prompt not found' });
    }
  });
}

// Handle deleting a prompt
function handleDeletePrompt(id, sendResponse) {
  chrome.storage.local.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    const newPrompts = prompts.filter(p => p.id !== id);
    
    chrome.storage.local.set({ prompts: newPrompts }, () => {
      sendResponse({ success: true });
    });
  });
}

// Handle getting all folders
function handleGetFolders(sendResponse) {
  chrome.storage.local.get(['folders'], (result) => {
    sendResponse({ success: true, folders: result.folders || [] });
  });
}

// Handle creating a new folder
function handleCreateFolder(name, sendResponse) {
  chrome.storage.local.get(['folders'], (result) => {
    const folders = result.folders || [];
    
    // Generate a unique ID for the folder
    const newId = folders.length > 0 
      ? Math.max(...folders.map(f => f.id)) + 1 
      : 1;
    
    // Add new folder
    const newFolder = {
      id: newId,
      name: name
    };
    
    folders.push(newFolder);
    
    chrome.storage.local.set({ folders }, () => {
      sendResponse({ success: true, folder: newFolder });
    });
  });
}

// Handle getting all tags
function handleGetTags(sendResponse) {
  chrome.storage.local.get(['tags'], (result) => {
    sendResponse({ success: true, tags: result.tags || [] });
  });
}

// Handle creating a new tag
function handleCreateTag(name, color, sendResponse) {
  chrome.storage.local.get(['tags'], (result) => {
    const tags = result.tags || [];
    
    // Generate a unique ID for the tag
    const newId = tags.length > 0 
      ? Math.max(...tags.map(t => t.id)) + 1 
      : 1;
    
    // Add new tag
    const newTag = {
      id: newId,
      name: name,
      color: color
    };
    
    tags.push(newTag);
    
    chrome.storage.local.set({ tags }, () => {
      sendResponse({ success: true, tag: newTag });
    });
  });
}

// Handle updating preferences
function handleUpdatePreferences(preferences, sendResponse) {
  chrome.storage.local.get(['preferences'], (result) => {
    const currentPreferences = result.preferences || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    chrome.storage.local.set({ preferences: updatedPreferences }, () => {
      sendResponse({ success: true, preferences: updatedPreferences });
    });
  });
}

// Handle getting preferences
function handleGetPreferences(sendResponse) {
  chrome.storage.local.get(['preferences'], (result) => {
    sendResponse({ success: true, preferences: result.preferences || {} });
  });
}

// Handle updating a prompt
function handleUpdatePrompt(id, promptData, sendResponse) {
  chrome.storage.local.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      sendResponse({ success: false, message: 'Prompt not found' });
      return;
    }
    
    // Update the prompt with new data, keeping existing data for fields not provided
    const updatedPrompt = {
      ...prompts[promptIndex],
      ...promptData,
      id // Ensure ID doesn't change
    };
    
    prompts[promptIndex] = updatedPrompt;
    
    chrome.storage.local.set({ prompts }, () => {
      sendResponse({ success: true, prompt: updatedPrompt });
    });
  });
}

// Handle deleting a folder
function handleDeleteFolder(id, sendResponse) {
  chrome.storage.local.get(['folders'], (result) => {
    const folders = result.folders || [];
    const newFolders = folders.filter(f => f.id !== id);
    
    if (folders.length === newFolders.length) {
      sendResponse({ success: false, message: 'Folder not found' });
      return;
    }
    
    chrome.storage.local.set({ folders: newFolders }, () => {
      sendResponse({ success: true });
    });
  });
}

// Handle deleting a tag
function handleDeleteTag(id, sendResponse) {
  chrome.storage.local.get(['tags'], (result) => {
    const tags = result.tags || [];
    const newTags = tags.filter(t => t.id !== id);
    
    if (tags.length === newTags.length) {
      sendResponse({ success: false, message: 'Tag not found' });
      return;
    }
    
    chrome.storage.local.set({ tags: newTags }, () => {
      sendResponse({ success: true });
    });
  });
}

// Update context menu items with saved prompts
function updatePromptsContextMenu() {
  console.log("Updating prompts context menu");
  
  // First remove all existing prompt items
  chrome.contextMenus.removeAll(() => {
    try {
      // Create only the save selection menu item
      chrome.contextMenus.create({
        id: "saveSelectedText",
        title: "Save to PromptVault",
        contexts: ["selection"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error creating saveSelectedText menu:", chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error("Error recreating context menus:", error);
    }
  });
}

// Add event listener for context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  
  if (info.menuItemId === "saveSelectedText") {
    // Get selected text and send it to popup for the save dialog
    const selectedText = info.selectionText;
    if (selectedText) {
      console.log("Selected text for save dialog:", selectedText.substring(0, 30) + "...");
      
      // Store the selected text temporarily in storage
      chrome.storage.local.set({ 
        tempSelectedText: {
          text: selectedText,
          source: tab.url,
          timestamp: new Date().toISOString()
        }
      }, () => {
        // Instead of using chrome.action.openPopup() which may not be supported,
        // create a notification to tell the user the text is ready to be saved
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
          title: 'PromptVault',
          message: 'Text selected. Open extension to save it.',
          priority: 2
        });
        
        // The popup will check for tempSelectedText in storage when it opens
      });
    }
  }
});

// Update context menu when prompts change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.prompts) {
    updatePromptsContextMenu();
  }
});

// Initial context menu update
setTimeout(updatePromptsContextMenu, 1000);