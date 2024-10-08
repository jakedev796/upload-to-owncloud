let currentPath = '/';

function displayStatus(message, success = true, elementId = 'status') {
    const statusElement = document.getElementById(elementId);
    statusElement.textContent = message;
    statusElement.style.color = success ? 'green' : 'red';
    setTimeout(() => statusElement.textContent = '', 3000);
}

async function testConnection(serverURL, username, password) {
    try {
        const response = await fetch(`${serverURL}/remote.php/webdav/`, {
            method: 'PROPFIND',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Depth': '1'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}

async function getFolders(serverURL, username, password, path) {
    try {
        console.log(`Fetching folders for path: ${path}`);
        const response = await fetch(`${serverURL}/remote.php/webdav${path}`, {
            method: 'PROPFIND',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Depth': '1'
            }
        });

        if (response.ok) {
            const text = await response.text();
            console.log('PROPFIND response:', text);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            const responses = xmlDoc.getElementsByTagNameNS('DAV:', 'response');

            console.log(`Found ${responses.length} responses`);

            const folders = [];
            for (let i = 0; i < responses.length; i++) {
                const href = responses[i].getElementsByTagNameNS('DAV:', 'href')[0].textContent;
                const isCollection = responses[i].getElementsByTagNameNS('DAV:', 'resourcetype')[0].getElementsByTagNameNS('DAV:', 'collection').length > 0;
                console.log(`Item ${i}: href=${href}, isCollection=${isCollection}`);
                if (isCollection && href !== `/remote.php/webdav${path}`) {
                    let folderName = decodeURIComponent(href.split('/').filter(Boolean).pop());
                    if (folderName) {
                        folders.push(folderName);
                    }
                }
            }
            console.log('Folders found:', folders);
            return folders;
        } else {
            console.error('Failed to fetch folders. Status:', response.status);
            throw new Error('Failed to fetch folders');
        }
    } catch (error) {
        console.error('Error fetching folders:', error);
        return [];
    }
}

function updateFolderBrowser(folders) {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';

    console.log('Updating folder browser with folders:', folders);

    // Display current path more prominently
    const currentPathDiv = document.createElement('div');
    currentPathDiv.textContent = `Current path: ${currentPath}`;
    currentPathDiv.style.fontWeight = 'bold';
    currentPathDiv.style.marginBottom = '10px';
    currentPathDiv.style.padding = '5px';
    currentPathDiv.style.backgroundColor = '#f0f0f0';
    currentPathDiv.style.borderRadius = '3px';
    folderList.appendChild(currentPathDiv);

    if (currentPath !== '/') {
        const backFolder = document.createElement('div');
        backFolder.textContent = '.. (Go back)';
        backFolder.className = 'folder back-folder';
        backFolder.addEventListener('click', () => {
            currentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            loadFolders();
        });
        folderList.appendChild(backFolder);
    }

    if (folders.length === 0) {
        const noFoldersDiv = document.createElement('div');
        noFoldersDiv.textContent = 'No subfolders found';
        noFoldersDiv.className = 'folder no-folders';
        folderList.appendChild(noFoldersDiv);
    } else {
        folders.forEach(folder => {
            // Skip the current directory
            if (folder === currentPath.split('/').pop()) {
                return;
            }
            const folderDiv = document.createElement('div');
            folderDiv.textContent = folder;
            folderDiv.className = 'folder';
            folderDiv.addEventListener('click', () => {
                currentPath = currentPath === '/' ? `/${folder}` : `${currentPath}/${folder}`;
                loadFolders();
            });
            folderList.appendChild(folderDiv);
        });
    }

    console.log('Folder browser updated. Current path:', currentPath);
}

async function loadFolders() {
    console.log('Loading folders...');
    const { serverURL, username, password } = await chrome.storage.sync.get(['serverURL', 'username', 'password']);
    console.log('Server URL:', serverURL);
    console.log('Username:', username);
    console.log('Current path:', currentPath);
    const folders = await getFolders(serverURL, username, password, currentPath);
    updateFolderBrowser(folders);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log("Options page loaded");

    const items = await chrome.storage.sync.get(['serverURL', 'username', 'password', 'uploadFolder', 'copyUrlToClipboard']);
    if (items.serverURL) document.getElementById('serverURL').value = items.serverURL;
    if (items.username) document.getElementById('username').value = items.username;
    if (items.password) document.getElementById('password').value = items.password;
    if (items.copyUrlToClipboard !== undefined) {
        document.getElementById('copyUrlToClipboard').checked = items.copyUrlToClipboard;
    }

    if (items.uploadFolder) {
        currentPath = items.uploadFolder;
    }

    if (items.serverURL && items.username && items.password) {
        document.getElementById('folderSection').style.display = 'block';
        await loadFolders();
    }
});

document.getElementById('save').addEventListener('click', async function () {
    const serverURL = document.getElementById('serverURL').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const copyUrlToClipboard = document.getElementById('copyUrlToClipboard').checked;

    if (!isValidUrl(serverURL)) {
        displayStatus('Invalid server URL. Please enter a valid URL.', false);
        return;
    }

    if (!username || !password) {
        displayStatus('Please enter both username and password.', false);
        return;
    }

    console.log("Testing connection...");
    const connectionSuccessful = await testConnection(serverURL, username, password);

    if (connectionSuccessful) {
        await chrome.storage.sync.set({ serverURL, username, password, copyUrlToClipboard });
        displayStatus('Connection successful! Settings saved.', true);
        document.getElementById('folderSection').style.display = 'block';
        currentPath = '/';
        await loadFolders();
    } else {
        displayStatus('Connection failed. Please check your settings and try again.', false);
    }
});

document.getElementById('saveFolder').addEventListener('click', async function () {
    await chrome.storage.sync.set({ uploadFolder: currentPath });
    displayStatus('Upload folder saved!', true, 'folderStatus');
});