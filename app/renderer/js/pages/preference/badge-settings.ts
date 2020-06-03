import electron, {app} from 'electron';

import * as ConfigUtil from '../../utils/config-util';

function showBadgeCount(messageCount: number, mainWindow: electron.BrowserWindow): void {
	if (process.platform === 'linux') {
		if (ConfigUtil.getConfigItem('popUpOnMessage', false)) {
			if (mainWindow.isVisible() && !mainWindow.isFocused()) {
				mainWindow.setVisibleOnAllWorkspaces(true);
				mainWindow.moveTop();
				mainWindow.setVisibleOnAllWorkspaces(false);
			}

			if (!mainWindow.isVisible()) { // When closed to tray or minimized
				mainWindow.setVisibleOnAllWorkspaces(true);
				mainWindow.show();
				mainWindow.once('focus', () => {
					mainWindow.blur();
					mainWindow.showInactive();
					mainWindow.moveTop();
					mainWindow.setVisibleOnAllWorkspaces(false);
				});
			}
		}
	}

	if (process.platform === 'win32') {
		if (ConfigUtil.getConfigItem('openToBackgroundFromTray', false)) {
			if (!mainWindow.isVisible()) {
				mainWindow.showInactive();
			}
		}

		updateOverlayIcon(messageCount, mainWindow);
	} else {
		app.badgeCount = messageCount;
	}
}

function hideBadgeCount(mainWindow: electron.BrowserWindow): void {
	if (process.platform === 'win32') {
		mainWindow.setOverlayIcon(null, '');
	} else {
		app.badgeCount = 0;
	}
}

export function updateBadge(badgeCount: number, mainWindow: electron.BrowserWindow): void {
	if (ConfigUtil.getConfigItem('badgeOption', true)) {
		showBadgeCount(badgeCount, mainWindow);
	} else {
		hideBadgeCount(mainWindow);
	}
}

function updateOverlayIcon(messageCount: number, mainWindow: electron.BrowserWindow): void {
	if (!mainWindow.isFocused()) {
		mainWindow.flashFrame(ConfigUtil.getConfigItem('flashTaskbarOnMessage'));
	}

	if (messageCount === 0) {
		mainWindow.setOverlayIcon(null, '');
	} else {
		mainWindow.webContents.send('render-taskbar-icon', messageCount);
	}
}

export function updateTaskbarIcon(data: string, text: string, mainWindow: electron.BrowserWindow): void {
	const img = electron.nativeImage.createFromDataURL(data);
	mainWindow.setOverlayIcon(img, text);
}
