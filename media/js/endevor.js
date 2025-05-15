const vscode = acquireVsCodeApi();

//vscode.postMessage({ command: 'logMessage', text: "clickJs" });

const elementoValue = document.getElementById('elementosInput').value;

document.getElementById('elementosBuscar').addEventListener('click', async () => {

    //vscode.postMessage({ command: 'logMessage', text: "clickJs" });

    const elementoValue = document.getElementById('elementosInput').value;

    //vscode.postMessage({ command: 'logMessage', text: "elementoValue: " + elementoValue });

    // Dividir el contenido del textarea en líneas
    const lines = elementoValue.split('\n').filter(line => line.trim() !== '');

    //vscode.postMessage({command: 'logMessage',text: "lines: " + lines});

    //vscode.postMessage({command: 'logMessage',text: "lines: " + lines.length});

    // Configurar la barra de progreso
    //const progressBarMain = document.getElementById('progressBarMain');
    //progressBarMain.style.display = 'block';
    //progressBar.max = lines.length;
    //progressBar.value = 0;


    // Contenedor para los resultados
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Limpiar resultados previos


    const tableContent = document.createElement('table');
    tableContent.id = 'tableContent';
    resultsContainer.appendChild(tableContent);

    const theadContent = document.createElement('thead');
    tableContent.appendChild(theadContent);

    const trHeader = document.createElement('tr');
    theadContent.appendChild(trHeader);

    const thBusqueda = document.createElement('th');
    thBusqueda.textContent = 'BUSQUEDA';
    thBusqueda.onclick = () => seleccionarColumna(0); // Llamar a la función al hacer clic
    thBusqueda.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    trHeader.appendChild(thBusqueda);

    const thData = document.createElement('th');
    thData.textContent = 'DATA';
    thData.onclick = () => seleccionarColumna(1); // Llamar a la función al hacer clic
    thData.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    trHeader.appendChild(thData);

    const thExtra = document.createElement('th');
    thExtra.textContent = 'EXTRA';
    thExtra.onclick = () => seleccionarColumna(2); // Llamar a la función al hacer clic
    thExtra.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    trHeader.appendChild(thExtra);

    const tableBody = document.createElement('tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados
    tableContent.appendChild(tableBody);

    vscode.postMessage({command: 'logMessage',text: "tableContent.innerHTML: " + tableContent.innerHTML});

    // Recorrer cada línea
    for (let i = 0; i < lines.length; i++) {

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        const line = lines[i].trim();
        const [elemento, environment, stage, system, subSystem, type, ccid] = line.split(';');



        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        //vscode.postMessage({ command: 'logMessage', text: "111" });

        // Generar el comando Zowe CLI
        const zoweCommandConcat = 'zowe endevor list elements ' + elemento + ' -i ENDEVOR --env ' + environment + ' --sn ' + stage + ' --sys ' + system + ' --sub ' + subSystem + ' --typ ' + type + ' --rft list --data ALL --wcll ' + ccid;


        //vscode.postMessage({ command: 'logMessage', text: "222" });

        const trContent = document.createElement('tr');
        trContent.id = `trContent-${i}`;
        //trContent.classList.add('row');
        tableBody.appendChild(trContent);

        const tdBusqueda = document.createElement('td');
        tdBusqueda.id = `tdBusqueda-${i}`;
        //tdBusqueda.classList.add('row');
        tdBusqueda.style.width = '200px'; // Establecer ancho fijo
        trContent.appendChild(tdBusqueda);

        const spanElement = document.createElement('span');
        spanElement.innerHTML = '<span style="display: inline-block; width: 100px;">Elemento:</span><b>' + elemento + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">Environment:</span><b>' + environment + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">Stage:</span><b>' + stage + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">System:</span><b>' + system + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">SubSystem:</span><b>' + subSystem + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">Type:</span><b>' + type + '</b><br>' +
            '<span style="display: inline-block; width: 100px;">CCID:</span><b>' + ccid + '</b><br>';
            

        spanElement.style.fontWeight = 'normal'; // Aplicar negrita directamente
        //spanElement.style.width = '200px'; // Establecer ancho fijo
        tdBusqueda.appendChild(spanElement);

        const tdElement = document.createElement('td');
        tdElement.id = `tdElement-${i}`;
        //tdElement.classList.add('row');
        tdElement.style.width = '500px'; // Establecer ancho fijo
        //divMain.appendChild(tdElement);
        trContent.appendChild(tdElement);






        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const pElement = document.createElement('p');
        pElement.id = `result-${i}`;
        pElement.classList.add('content');
        pElement.textContent = `Procesando: ${elemento} ${environment} ${stage} ${system} ${subSystem} ${type} ${ccid}`;
        //pElement.style.width = '100%'; // Establecer ancho fijo
        tdElement.appendChild(pElement);

        // Crear una barra de progreso para esta consulta
        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        //progressBar.max = 100;
        //progressBar.value = 0;
        //progressBar.classList.add('row');
        tdElement.appendChild(progressBar);

        const spanDash = document.createElement('span');
        const repeatCount = 52; // Define la longitud de la línea punteada
        const dashedLine = '-'.repeat(repeatCount);
        spanDash.innerHTML = '<br>' + dashedLine + '<br>'; // Agregar la línea punteada al resultado
        tdElement.appendChild(spanDash);


        const tdExtra = document.createElement('td');
        tdExtra.id = `tdExtra-${i}`;
        //tdElement.classList.add('row');
        tdExtra.style.width = '300px'; // Establecer ancho fijo
        //divMain.appendChild(tdElement);
        trContent.appendChild(tdExtra);

        const pExtra = document.createElement('p');
        pExtra.id = `pExtra-${i}`;
        pExtra.textContent = `Comando Zowe`;
        tdExtra.appendChild(pExtra);

        if (!elemento || !environment || !stage || !system || !subSystem || !type || !ccid) {
            pElement.textContent = `Error: Línea inválida. Asegúrate de que todos los campos estén completos.`;
            setTimeout(() => progressBar.remove(), 500); // Eliminar la barra después de 1 segundo
            continue; // Saltar líneas inválidas
        }

        vscode.postMessage({command: 'logMessage',text: "tableContent.innerHTML: " + tableContent.innerHTML});

        //vscode.postMessage({command: 'logMessage',text: "sss " + pElement.getHTML()});

        // Simular progreso inicial
        //progressBar.value = 50;

        // Enviar el comando al backend
        vscode.postMessage({ command: 'runZoweCommand', zoweCommand: zoweCommandConcat, index: i });

        // Actualizar la barra de progreso
        //progressBar.value = i + 1;

        // Esperar un breve momento para evitar saturar el backend
        await new Promise(resolve => setTimeout(resolve, 500));


    }




    //vscode.postMessage({command: 'logMessage',text: 'click Procesamiento completado para todos los elementos.'});
});


// Escuchar mensajes desde el backend
window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'zoweResponse') {
        const progressBarId = `progress-${message.index}`;
        const progressBar = document.getElementById(progressBarId);

        const stdout = message.response;

        try {
            // Dividir la respuesta en líneas
            const lines = stdout.split('\n');

            // Procesar cada línea para buscar JSON válidos
            let resultText = '';
            let resultExtraText = '';
            let headerAdded = false; // Bandera para controlar la cabecera

            lines.forEach((line) => {
                try {
                    // Intentar analizar la línea como JSON
                    const jsonResponse = JSON.parse(line);

                    //vscode.postMessage({ command: 'logMessage', text: 'jsonResponse: ' + jsonResponse });

                    // Extraer los campos específicos del JSON
                    const { elmName, typeName, envName, stgId, sysName, sbsName, elmVVLL, procGrpName, elmLastLLDate, elmLastLLCcid } = jsonResponse;

                    const blank = ' ';
                    const formatElmName = elmName.padEnd(12, ' ');
                    const formatTypeName = typeName.padEnd(10, ' ');
                    const formatEnvName = envName.padEnd(8, ' ');
                    const formatStgId = stgId.padEnd(1, ' ');
                    const formatSysName = sysName.padEnd(8, ' ');
                    const formatSbsName = sbsName.padEnd(8, ' ');

                    const formatElmVVLL = elmVVLL.padEnd(4, ' ');
                    const formatProcGrpName = procGrpName.padEnd(8, ' ');
                    const formatElmLastLLCcid = elmLastLLCcid.padEnd(11, ' ');

                    if (!headerAdded) {
                        const headerElement = 'ELEMENT --  ';
                        const headerType = 'TYPE      ';
                        const headerEnv = 'ENVIRON ';
                        const headerStgId = 'S';
                        const headerSysName = 'SYSTEM  ';
                        const headerSbsName = 'SUBSYS  ';

                        const headerElmVVLL = 'VVLL';
                        const headerProcGrpName = 'PROCGRP ';
                        const headerElmLastLLCcid = 'CCID';

                        resultText +=headerElement + blank +
                            headerType + blank +
                            headerEnv + blank +
                            headerStgId + blank +
                            headerSysName + blank +
                            headerSbsName + blank + '\n';
                            

                        resultExtraText +=
                            headerElmVVLL + blank +
                            headerProcGrpName + blank +
                            headerElmLastLLCcid + '\n';
                        headerAdded = true; // Marcar que la cabecera ya fue agregada
                    }

                    // Construir el texto para mostrar en el <pre>
                    resultText +=formatElmName + blank +
                        formatTypeName + blank +
                        formatEnvName + blank +
                        formatStgId + blank +
                        formatSysName + blank +
                        formatSbsName + blank + '\n';
                        

                    resultExtraText +=
                        formatElmVVLL + blank +
                        formatProcGrpName + blank +
                        formatElmLastLLCcid + '\n';



                } catch (jsonError) {
                    // Si la línea no es un JSON válido, ignorarla
                }
            });



            // Buscar el <pre> correspondiente al comando actual
            const pElementId = `result-${message.index}`;
            const pElement = document.getElementById(pElementId);

            const pExtraId = `pExtra-${message.index}`;
            const pExtra = document.getElementById(pExtraId);


            //vscode.postMessage({ command: 'logMessage', text: 'click: ' + resultText });

            if (pElement) {
                pElement.textContent = resultText || 'No se encontraron datos JSON válidos.' + '\n' + stdout;
                pExtra.textContent = resultExtraText;
            }
        } catch (error) {
            // Si ocurre un error general, mostrar la respuesta completa
            const pElementId = `result-${message.index}`;
            const pElement = document.getElementById(pElementId);

            if (pElement) {
                pElement.textContent = `Error al procesar la respuesta: ${error.message}\nRespuesta completa:\n${stdout}`;
            }
        }


        // Ocultar la barra de progreso
        if (progressBar) {
            setTimeout(() => progressBar.remove(), 1000); // Eliminar la barra después de 1 segundo
        }

    }
});

let lastSelectedColumn = null; // Variable para rastrear la última columna seleccionada

function seleccionarColumna(colIndex) {
    const table = document.getElementById('tableContent');
    const rows = table.querySelectorAll('tbody tr');
    const columnData = [];

    vscode.postMessage({ command: 'logMessage', text: '----------------------' });
    vscode.postMessage({ command: 'logMessage', text: 'lastSelectedColumn: ' + lastSelectedColumn });
    vscode.postMessage({ command: 'logMessage', text: 'colIndex: ' + colIndex });

    // Si la columna seleccionada es la misma que la última, deseleccionarla
    if (lastSelectedColumn === colIndex) {
        // Limpiar resaltado previo
        vscode.postMessage({ command: 'logMessage', text: 'Limpiar resaltado previo' });
        table.querySelectorAll('td, th').forEach(cell => {
            cell.classList.remove('selected-column');
        });
        lastSelectedColumn = null; // Restablecer la selección
        return; // Salir de la función
    }
    vscode.postMessage({ command: 'logMessage', text: 'AAA' });
    // Limpiar resaltado previo
    table.querySelectorAll('td, th').forEach(cell => {
        vscode.postMessage({ command: 'logMessage', text: 'Limpiar resaltado previoP' });
        cell.classList.remove('selected-column');
    });

    vscode.postMessage({ command: 'logMessage', text: 'BBB' });
    // Recopilar datos de la columna seleccionada y resaltar celdas
    rows.forEach(row => {
        vscode.postMessage({ command: 'logMessage', text: 'Recopilar datos de la columna seleccionada y resaltar celdas' });
        const cell = row.cells[colIndex];
        if (cell) {
            columnData.push(cell.textContent.trim());
            cell.classList.add('selected-column');
        }
    });

    vscode.postMessage({ command: 'logMessage', text: 'CCC' });
    // Resaltar el encabezado de la columna seleccionada
    const headerCell = table.querySelector(`thead th:nth-child(${colIndex + 1})`);
    if (headerCell) {
        vscode.postMessage({ command: 'logMessage', text: 'Resaltar el encabezado de la columna seleccionada' });
        headerCell.classList.add('selected-column');
    }

    vscode.postMessage({ command: 'logMessage', text: 'DDD' });
    // Copiar los datos al portapapeles
    const columnText = columnData.join('\n'); // Unir los datos con saltos de línea
    navigator.clipboard.writeText(columnText).then(() => {
        //alert('Columna copiada al portapapeles:\n' + columnText);
        vscode.postMessage({ command: 'logMessage', text: 'Columna copiada al portapapeles:\n' + columnText });
    }).catch(err => {
        //console.error('Error al copiar al portapapeles:', err);
        vscode.postMessage({ command: 'logMessage', text: 'Error al copiar al portapapeles:' + err });
    });

    vscode.postMessage({ command: 'logMessage', text: 'EEE' });
    // Actualizar la última columna seleccionada
    lastSelectedColumn = colIndex;
    vscode.postMessage({ command: 'logMessage', text: 'lastSelectedColumn: ' + lastSelectedColumn });
}