const vscode = acquireVsCodeApi();

document.getElementById('datasetBuscar').addEventListener('click', () => {
    const datasetValue = document.getElementById('datasetInput').value;
    document.getElementById('output').textContent =''; // Limpiar el contenido previo
    // Mostrar el progreso
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    // Obtener el directorio del espacio de trabajo desde el backend
    vscode.postMessage({
        command: 'getWorkspaceFolder'
    });

    // Escuchar la respuesta del backend para obtener el directorio
    window.addEventListener('message', (event) => {
        const message = event.data;

        if (message.command === 'workspaceFolder') {
            const workspaceFolder = message.workspaceFolder;

            // Construir la ruta completa para guardar el archivo
            const filePath = `${workspaceFolder}/${datasetValue}.txt`;

            vscode.postMessage({
                command: 'logMessage',
                text: "aqui " + filePath
            });

            // Enviar el comando Zowe CLI al backend
            vscode.postMessage({
                command: 'runZoweCommand',
                zoweCommand: `zowe zos-files download data-set "'${datasetValue}'" -f "${filePath}"`
            });
        }
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