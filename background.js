// Ensure the context menu is created when the extension is installed or reloaded
browser.runtime.onInstalled.addListener(() => {
    createContextMenu();
});

function createContextMenu() {
    browser.contextMenus.create({
        id: "uploadToOwncloud",
        title: "Upload to Owncloud",
        contexts: ["image", "video", "audio"]
    });
}

// Ensure context menu is available when the background script starts running
browser.runtime.onStartup.addListener(() => {
    createContextMenu();
});

function showNotification(title, message) {
    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.runtime.getURL("icon48.png"),
        "title": title,
        "message": message
    });
}

function generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = originalFilename.split('.').pop();
    const nameWithoutExtension = originalFilename.split('.').slice(0, -1).join('.');
    return `${nameWithoutExtension}_${timestamp}_${randomString}.${fileExtension}`;
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "uploadToOwncloud") {
        const mediaURL = info.srcUrl;

        if (mediaURL) {
            try {
                // Fetch user settings
                const { serverURL, username, password, uploadFolder, copyUrlToClipboard } = await browser.storage.sync.get(['serverURL', 'username', 'password', 'uploadFolder', 'copyUrlToClipboard']);

                if (!serverURL || !username || !password) {
                    showNotification("Configuration Required", "Please configure your Owncloud settings in the extension options.");
                    browser.runtime.openOptionsPage();
                    return;
                }

                // Fetch the media directly
                const response = await fetch(mediaURL);
                const blob = await response.blob();
                let originalFilename = mediaURL.split("/").pop().split("?")[0];  // Get the filename without query params

                // Remove invisible characters from the filename
                originalFilename = originalFilename.replace(/[\u200B-\u200D\uFEFF]/g, '');

                // Generate unique filename
                let uniqueFilename = generateUniqueFilename(originalFilename);

                // Use the full selected upload folder path
                const folderPath = uploadFolder || '/';

                // Upload the media to Owncloud
                const uploadURL = `${serverURL}/remote.php/webdav${folderPath}/${uniqueFilename}`;
                const uploadResponse = await fetch(uploadURL, {
                    method: "PUT",
                    headers: {
                        "Authorization": "Basic " + btoa(username + ":" + password),
                        "Content-Type": blob.type
                    },
                    body: blob
                });

                if (uploadResponse.ok) {
                    const finalURL = `${serverURL}/index.php/apps/files/?dir=/${encodeURIComponent(folderPath)}&openfile=${encodeURIComponent(uniqueFilename)}`;

                    let notificationMessage = "The file was uploaded successfully to Owncloud.";

                    if (copyUrlToClipboard) {
                        await navigator.clipboard.writeText(finalURL);
                        notificationMessage += " The URL has been copied to your clipboard.";
                    }

                    showNotification("Upload Successful", notificationMessage);
                    console.log("Upload successful! File URL: " + finalURL);
                } else {
                    throw new Error("Upload failed with status: " + uploadResponse.status);
                }
            } catch (error) {
                console.error("Upload failed:", error);
                showNotification("Upload Failed", "An error occurred while uploading the file to Owncloud. Please check your settings and try again.");
            }
        }
    }
});
