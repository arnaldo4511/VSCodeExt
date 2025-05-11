const vscode = acquireVsCodeApi();
document.getElementById('tsoBusButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openTsoBusWebview' });
});

document.getElementById('tsoBusMultipleButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openTsoBusMultipleWebview' });
});

document.getElementById('destaButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openDestaWebview' });
});

document.getElementById('deslogueButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openDeslogueWebview' });
});

document.getElementById('downloadDatasetButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openDownloadDatasetWebview' });
});

document.getElementById('endevorButton').addEventListener('click', () => {
    vscode.postMessage({ command: 'openEndevorWebview' });
});