// Utility function to check if a URL is bookmarked
async function isUrlBookmarked(url) {
  try {
    const results = await chrome.bookmarks.search({ url });
    return results.length > 0;
  } catch (error) {
    console.error("Error searching bookmarks:", error);
    throw error; // Rethrow to handle in the caller
  }
}

// Update the context menu item based on bookmark status
async function updateContextMenu(url) {
  // Initially disable the context menu item while checking
  await chrome.contextMenus.update("bookmark-link", {
    enabled: false,
    title: "Checking bookmark status...",
  });

  try {
    const bookmarked = await isUrlBookmarked(url);
    const title = bookmarked
      ? "URL is already bookmarked"
      : "Bookmark this URL";

    // Enable the context menu item with the updated title
    await chrome.contextMenus.update("bookmark-link", { title, enabled: true });
  } catch (error) {
    console.error("Error updating context menu:", error);
    // If an error occurs, update the context menu item to a default state
    await chrome.contextMenus.update("bookmark-link", {
      title: "Bookmark this URL (error)",
      enabled: true,
    });
  }
}

// Capture the tab's screenshot
async function captureTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const screenshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "jpeg",
      quality: 90,
    });
    return screenshotUrl;
  } catch (error) {
    console.error("Error capturing tab:", error);
    throw error;
  }
}

// Handle incoming messages
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "captureTab" && typeof request.tabId === "number") {
    try {
      const screenshotUrl = await captureTab(request.tabId);
      sendResponse({ screenshotUrl });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  } else if (request.action === "checkBookmark") {
    try {
      await updateContextMenu(request.url);
      sendResponse({});
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }
  return true; // Indicate asynchronous response
});

// Handle context menu item clicks
async function onContextMenuClick(info, tab) {
  if (info.menuItemId === "bookmark-link") {
    console.log("Context menu item clicked. URL:", info.linkUrl);
    // Optional: Implement bookmarking functionality here
  }
}

// Initialize the context menu
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "bookmark-link",
    title: "Bookmark this URL", // Default title
    contexts: ["link"],
  });

  chrome.contextMenus.onClicked.addListener(onContextMenuClick);

  // Optional: Listen for tab updates to refresh the context menu based on the current tab URL
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
      await updateContextMenu(tab.url);
    }
  });
});
