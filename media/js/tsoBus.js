const vscode = acquireVsCodeApi();



const libreriaValue = document.getElementById('libreriaInput').value;
const elementoValue = document.getElementById('elementoInput').value;

// Escuchar mensajes desde el backend
window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'zoweResponse') {




        const stdout = message.response;

        // Dividir stdout en líneas
        const lines = stdout.split('\n');

        // Buscar la fila que comienza con "BUSCANDO"
        const startIndex = lines.findIndex(line => line.startsWith("BUSCANDO"));

        if (startIndex !== -1) {
            // Buscar la fila que comienza con "ISPS118L"
            const endIndex = lines.findIndex((line, index) => index > startIndex && line.startsWith("ISPS118L"));

            // Extraer las líneas desde "BUSCANDO" hasta antes de "ISPS118L"
            const resultLines = endIndex !== -1
                ? lines.slice(startIndex, endIndex) // Desde "BUSCANDO" hasta antes de "ISPS118L"
                : lines.slice(startIndex); // Desde "BUSCANDO" hasta el final si no hay "ISPS118L"

            // Imprimir las líneas extraídas en el elemento <p>
            document.getElementById('stdoutOutput').textContent = resultLines.join('\n');

            vscode.postMessage({
                command: 'logMessage',
                text: resultLines.join('\n')
            });
        }
        // Mostrar mensaje en log
        vscode.postMessage({
            command: 'logMessage',
            text: "aqui"
        });

        // Mostrar la respuesta en el <pre>
        document.getElementById('output').textContent = message.response;

        // Ocultar el progreso
        document.getElementById('progressBar').style.display = 'none';
    }
});

//document.getElementById('additionalOutput').textContent = libreriaValue + ' PRG ' + elementoValue;

/*document.getElementById('libreriaInput').addEventListener('input', (event) => {
    const libreriaValue = event.target.value;
    const elementoValue = document.getElementById('elementoInput').value;
    document.getElementById('additionalOutput').textContent = libreriaValue + ' PRG' + elementoValue;
});*/

document.getElementById('elementoBuscar').addEventListener('click', () => {
    const elementoValue = document.getElementById('elementoInput').value;
    const libreriaValue = document.getElementById('libreriaInput').value;
    const typeValue = document.getElementById('typeSelect').value;

    const zoweCommandConcat = 'zowe tso issue cmd "EX \'' + libreriaValue + '\' \'' + typeValue + ' ' + elementoValue + '\'" -a 9999/UTI/00';

    //document.getElementById('commandOutput').textContent = 'Generated Command: ' + zoweCommandConcat;

    // Mostrar el progreso
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';

    vscode.postMessage({ command: 'runZoweCommand', zoweCommand: zoweCommandConcat });
});