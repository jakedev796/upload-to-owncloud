chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "uploadToOwncloud",
        title: "Upload to Owncloud",
        contexts: ["image", "video", "audio"]
    });
});

function showNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("../icons/icon48.png"),
        title: title,
        message: message
    });
}

function generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = originalFilename.split('.').pop();
    const nameWithoutExtension = originalFilename.split('.').slice(0, -1).join('.');
    return `${nameWithoutExtension}_${timestamp}_${randomString}.${fileExtension}`;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "uploadToOwncloud") {
        const mediaURL = info.srcUrl;

        if (mediaURL) {
            try {
                // Fetch user settings
                const { serverURL, username, password, uploadFolder, copyUrlToClipboard } = await chrome.storage.sync.get(['serverURL', 'username', 'password', 'uploadFolder', 'copyUrlToClipboard']);

                if (!serverURL || !username || !password) {
                    showNotification("Configuration Required", "Please configure your Owncloud settings in the extension options.");
                    chrome.runtime.openOptionsPage();
                    return;
                }

                // Fetch the media
                const response = await fetch(mediaURL);
                const blob = await response.blob();
                let originalFilename = mediaURL.split("/").pop().split("?")[0];

                // Remove invisible characters from the filename
                originalFilename = originalFilename.replace(/[\u200B-\u200D\uFEFF]/g, '');

                // Generate unique filename
                let uniqueFilename = generateUniqueFilename(originalFilename);

                // Use the selected upload folder
                const folderPath = uploadFolder ? uploadFolder + '/' : '';

                // Upload the media to Owncloud
                const uploadURL = `${serverURL}/remote.php/webdav/${folderPath}${uniqueFilename}`;
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