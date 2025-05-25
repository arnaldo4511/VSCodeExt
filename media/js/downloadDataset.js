const vscode = acquireVsCodeApi();

document.getElementById('datasetBuscar').addEventListener('click', () => {


    // Solicitar al backend que muestre el diálogo para elegir carpeta y descargue el archivo
    vscode.postMessage({
        command: 'descargarDataset'
    });


    // Escuchar la respuesta del backend para obtener el directorio
    /*window.addEventListener('message', (event) => {
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
    });*/
});

let carpeta = "";;

// Escuchar mensajes desde el backend
window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'descargarDatasetResponse') {
        // Mostrar el mensaje en la consola del navegador
        console.log("sss ",message.response);
        carpeta = message.response;
        downloadDataset(carpeta);
    }
    if (message.command === 'zoweResponse') {
        // Mostrar la respuesta en el <pre>
        //document.getElementById('output').textContent = message.response;

        console.log('Respuesta del backend:', message.response);
        console.log('Índice de la respuesta:', message.index);


        const tdResultado = document.getElementById(`result-${message.index}`);
        if (tdResultado) {
            tdResultado.textContent = message.response;
            document.getElementById(`progress${message.index}`).style.display = 'none';
        }

        // Ocultar el progreso
        //document.getElementById('progressBar').style.display = 'none';
    }
});

// Función para descargar el dataset
function downloadDataset(carpeta) {

    console.log('downloadDataset');
    console.log('Carpeta seleccionadaaa:', carpeta);

    const datasetValue = document.getElementById('datasetInput');
    //console.log('datasetValue', datasetValue);
    //document.getElementById('output').textContent = ''; // Limpiar el contenido previo
    // Mostrar el progreso
    //const progressBar = document.getElementById('progressBar');
    //progressBar.style.display = 'block';

    const datasets = datasetValue.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    console.log('datasets', datasets);
    //vscode.postMessage({command: 'logMessage',text: "aqui " + filePath});


    // Crear tabla de resultados
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Limpiar resultados previos

    const table = document.createElement('table');
    table.id = 'resultTable';
    resultsContainer.appendChild(table);

    // Encabezados
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const trHead = document.createElement('tr');
    thead.appendChild(trHead);

    const thBusqueda = document.createElement('th');
    thBusqueda.textContent = 'ARCHIVO';
    trHead.appendChild(thBusqueda);

    const thResultado = document.createElement('th');
    thResultado.textContent = 'DESTINO';
    trHead.appendChild(thResultado);

    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Crear filas para cada consulta
    datasets.forEach((line, i) => {
        const datasetName = line;
        if (!datasetName) return;

        console.log('datasetNameee: ', datasetName);

        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        // Columna de búsqueda
        const tdBusqueda = document.createElement('td');
        tdBusqueda.textContent = datasetName;
        tr.appendChild(tdBusqueda);

        // Columna de resultado (vacía al inicio)
        const tdResultado = document.createElement('td');
        tdResultado.id = `result-${i}`;
        tdResultado.textContent = 'Procesando...';
        tr.appendChild(tdResultado);

        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        tdResultado.appendChild(progressBar);

        // Construir la ruta completa para guardar el archivo
        const filePath = `${carpeta}/${datasetName}.txt`;

        console.log('filePath: ', filePath);

        // Enviar el comando Zowe CLI al backend
        vscode.postMessage({
            command: 'runZoweCommand',
            zoweCommand: `zowe zos-files download data-set "'${datasetName}'" -f "${filePath}"`,
            index: i 
        });

    });


}