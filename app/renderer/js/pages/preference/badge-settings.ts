import electron, {app, Notification} from 'electron';
import path from 'path';

import * as ConfigUtil from '../../utils/config-util';

const ICON_DIR = '../../../../resources/';
const APP_ICON = path.join(__dirname, ICON_DIR, 'Icon');
const iconPath = (): string => APP_ICON + (process.platform === 'win32' ? '.ico' : '.png');

function showBadgeCount(messageCount: number, mainWindow: electron.BrowserWindow): void {
	if (process.platform === 'linux') {
		if (ConfigUtil.getConfigItem('popUpOnMessage', false)) {
			if (app.badgeCount === 0 && messageCount > 0) {
				const persistentNotification = new Notification({title: 'Zulip', body: 'New message', urgency: 'critical', icon: iconPath()});
				persistentNotification.on('click', () => {
					mainWindow.show();
				});
				persistentNotification.show();
			}
		}
	}

	if (process.platform === 'win32') {
		if (ConfigUtil.getConfigItem('openToBackgroundFromTray', false)) {
			if (!mainWindow.isVisible()) {
				mainWindow.minimize();
				mainWindow.blur();
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
