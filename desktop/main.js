const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;
const WEB_PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'WeatherLink Live Viewer',
    backgroundColor: '#1e3c72'
  });

  mainWindow.loadURL(`http://localhost:${WEB_PORT}`);

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard',
          click: () => {
            mainWindow.loadURL(`http://localhost:${WEB_PORT}`);
          }
        },
        {
          label: 'Debug Console',
          click: () => {
            mainWindow.loadURL(`http://localhost:${WEB_PORT}/debug.html`);
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    // Determine if we're in development or production
    const isDev = !app.isPackaged;

    let serverPath;
    let serverCwd;

    if (isDev) {
      // Development: server.js is in parent directory
      serverPath = path.join(__dirname, '..', 'server.js');
      serverCwd = path.join(__dirname, '..');
    } else {
      // Production: server.js is in Resources/app
      serverPath = path.join(process.resourcesPath, 'app', 'server.js');
      serverCwd = path.join(process.resourcesPath, 'app');
    }

    console.log('Environment:', isDev ? 'Development' : 'Production');
    console.log('Starting server from:', serverPath);
    console.log('Server working directory:', serverCwd);

    // Verify server.js exists
    if (!fs.existsSync(serverPath)) {
      const error = new Error(`Server file not found at: ${serverPath}`);
      console.error(error.message);
      reject(error);
      return;
    }

    let resolved = false;
    let stderrOutput = '';

    // Set timeout for server startup
    const startupTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        const error = new Error('Server failed to start within 30 seconds');
        console.error(error.message);
        if (serverProcess) {
          serverProcess.kill();
        }
        reject(error);
      }
    }, 30000);

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: serverCwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1'
      }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('Web server running') && !resolved) {
        resolved = true;
        clearTimeout(startupTimeout);
        console.log('Server started successfully');
        setTimeout(resolve, 1000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errorText = data.toString();
      console.error(`Server Error: ${errorText}`);
      stderrOutput += errorText;
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to spawn server process:', error);
      if (!resolved) {
        resolved = true;
        clearTimeout(startupTimeout);
        reject(new Error(`Failed to spawn server: ${error.message}`));
      }
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (!resolved && code !== 0) {
        resolved = true;
        clearTimeout(startupTimeout);
        const errorMsg = stderrOutput
          ? `Server exited with code ${code}:\n${stderrOutput}`
          : `Server exited with code ${code}`;
        reject(new Error(errorMsg));
      }
    });
  });
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);

    // Show error dialog to user before quitting
    dialog.showErrorBox(
      'Startup Failed',
      `WeatherLink Live Viewer failed to start.\n\nError: ${error.message}\n\nPlease check:\n- The application was built correctly\n- Port 3000 is not already in use\n- You have Node.js installed`
    );

    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});

app.on('before-quit', () => {
  stopServer();
});
