const vscode = acquireVsCodeApi();

document.getElementById('desestandarizarBuscar').addEventListener('click', () => {
    const archivoValue = document.getElementById('archivoInput').value;

    // Mostrar el progreso
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    // Enviar el comando al backend
    vscode.postMessage({
        command: 'runZoweCommand',
        zoweCommand: `zowe tso issue cmd "EX 'T49546.JCLLIB(DESTA2)' 'T ${archivoValue}'" -a 9999/UTI/00`
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