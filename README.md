# Upload to Owncloud

This browser extension allows you to easily upload media files to your Owncloud instance directly from your browser. It's compatible with Firefox, Chrome, and their respective derivatives (e.g., Firefox-based browsers like Zen, and Chromium-based browsers like Brave or Edge).

## Features

- Right-click context menu for uploading images, videos, and audio files to Owncloud
- Configurable Owncloud server settings
- Folder browser to select upload destination
- Optional URL copying after successful upload

## Setup and Installation

### Prerequisites

- Firefox, Firefox-based browser, Chrome, or any Chromium-based browser
- Node.js and npm (for signing the Firefox extension)
- An Owncloud instance that is exposed to the internet (local instances may not work)

### Loading as a Temporary Extension

#### For Firefox and Firefox-based browsers:

1. Clone or download this repository to your local machine.
2. Open Firefox and navigate to `about:debugging`.
3. Click on "This Firefox" in the left sidebar.
4. Click on the "Load Temporary Add-on" button.
5. Navigate to the `firefox` directory in the repository and select the `manifest.json` file.

The extension will now be loaded temporarily and will remain active until you restart the browser.

#### For Chrome and Chromium-based browsers:

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `chrome` directory from the repository.

The extension will now be loaded and active in Chrome.

### Permanent Installation

#### For Firefox and Firefox-based browsers:

1. Install web-ext globally:
   ```
   npm install --global web-ext
   ```

2. Create a Mozilla Add-ons account at https://addons.mozilla.org/en-US/developers/ if you don't already have one.

3. Generate an API key and secret:
   - Go to https://addons.mozilla.org/en-US/developers/addon/api/key/
   - Note down your JWT issuer (API key) and JWT secret (API secret)

4. In your terminal, navigate to the `firefox` directory containing the extension files.

5. Run the following command, replacing `your_api_key` and `your_api_secret` with your actual credentials:
   ```
   web-ext sign --api-key=your_api_key --api-secret=your_api_secret --channel=unlisted
   ```

6. Wait for the signing process to complete. This may take a few minutes.

7. Once complete, web-ext will generate a signed `.xpi` file.

8. To install, open Firefox and go to `about:addons`.

9. Click the gear icon and select "Install Add-on From File".

10. Choose the `.xpi` file that was created during the signing process.

#### For Chrome and Chromium-based browsers:

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Pack extension".
4. Browse to the `chrome` folder of this project and select it.
5. Chrome will create a `.crx` file (the packaged extension) and a `.pem` file (the private key for updates).
6. To install, users can drag and drop the `.crx` file into their Chrome browser.

Note: Due to security policies, some browsers may prevent installation of extensions not from their official store. In this case, you may need to publish your extension to the respective store for wider distribution.

## Configuration

To configure the extension:

1. Click on the extension icon in the browser toolbar.
2. Select "Options" or "Preferences".
3. Enter your Owncloud server URL, username, and password.
4. Optionally, enable or disable URL copying after upload.
5. Click "Save and Test Connection" to verify your settings.
6. Use the folder browser to select your default upload destination.

## Usage

1. After installation, right-click on any image, video, or audio file on a webpage.
2. Select "Upload to Owncloud" from the context menu.
3. If you haven't configured the extension yet, you'll be prompted to do so. Enter your Owncloud server details in the options page.
4. Choose the destination folder for uploads.
5. The file will be uploaded to your Owncloud instance.

## Troubleshooting

- If you encounter any issues with uploading, check your Owncloud server URL and credentials in the extension options.
- Ensure your Owncloud server is accessible and that you have the necessary permissions to upload files.
- For temporary installations, remember that the extension will need to be reloaded every time you restart your browser.
- If you're using a Chromium-based browser and can't install the `.crx` file directly, try loading it as an unpacked extension in developer mode.

## Privacy and Security

This extension stores your Owncloud credentials locally in your browser. Always ensure you're using it on a secure device. The extension communicates directly with your specified Owncloud server and does not send data to any third parties.

## Contributing

Contributions to improve the extension are welcome. Please feel free to submit issues or pull requests on the project repository.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.