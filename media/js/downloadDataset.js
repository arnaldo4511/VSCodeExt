const vscode = acquireVsCodeApi();

document.getElementById('datasetBuscar').addEventListener('click', () => {
    const datasetValue = document.getElementById('datasetInput').value;

    // Mostrar el progreso
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    // Enviar el comando al backend
    vscode.postMessage({
        command: 'runZoweCommand',
        zoweCommand: `zowe zos-files download data-set "'${datasetValue}'" -f ${datasetValue}.txt` // Comando Zowe CLI
    });
});

// Escuchar mensajes desde el backend
window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'zoweResponse') {
        // Mostrar la respuesta en el <pre>
        document.getElementById('output').textContent = message.response;

        // Ocultar el progreso
        document.getElementById('progressBar').style.display = 'none';
    }
});