const vscode = acquireVsCodeApi();

let resultTextGlobal = '';

//vscode.postMessage({ command: 'logMessage', text: "clickJs" });

const elementoValue = document.getElementById('elementosInput').value;

document.getElementById('elementosBuscar').addEventListener('click', async () => {

    resultTextGlobal = '';

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
    //trHeader.appendChild(thExtra);

    const tableBody = document.createElement('tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados
    tableContent.appendChild(tableBody);



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
        tdBusqueda.style.width = '150px'; // Establecer ancho fijo
        trContent.appendChild(tdBusqueda);

        const preBusqueda = document.createElement('pre');
        preBusqueda.innerHTML =
            'Elemento:      <b>' + elemento + '</b><br>' +
            'Environment:   <b>' + environment + '</b><br>' +
            'Stage:         <b>' + stage + '</b><br>' +
            'System:        <b>' + system + '</b><br>' +
            'SubSystem:     <b>' + subSystem + '</b><br>' +
            'Type:          <b>' + type + '</b><br>' +
            'CCID:          <b>' + ccid + '</b><br>';

        preBusqueda.style.fontWeight = 'normal'; // Aplicar negrita directamente
        //preBusqueda.style.width = '200px'; // Establecer ancho fijo
        tdBusqueda.appendChild(preBusqueda);





        const tdElement = document.createElement('td');
        tdElement.id = `tdElement-${i}`;
        //tdElement.classList.add('rowSingle');
        tdElement.style.width = '800px'; // Establecer ancho fijo
        //divMain.appendChild(tdElement);
        //tdElement.innerHTML = 'fffff';
        trContent.appendChild(tdElement);



        // Agregar un salto de línea después de la barra de progreso
        //tdElement.appendChild(document.createElement('br'));

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const preElement = document.createElement('pre');
        preElement.id = `result-${i}`;
        //preElement.classList.add('content');
        //preElement.innerHTML = `Procesando: ${elemento} ${environment} ${stage} ${system} ${subSystem} ${type} ${ccid}`;
        //preElement.style.width = '100%'; // Establecer ancho fijo
        tdElement.appendChild(preElement);

        /*const spanElement = document.createElement('span');
        spanElement.id = `spanElement-${i}`;*/

        // Crear una barra de progreso para esta consulta
        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        //progressBar.max = 100;
        //progressBar.value = 0;
        //progressBar.classList.add('row');
        tdElement.appendChild(progressBar);




        const tdExtra = document.createElement('td');
        tdExtra.id = `tdExtra-${i}`;
        //tdElement.classList.add('row');
        tdExtra.style.width = '200px'; // Establecer ancho fijo
        //divMain.appendChild(tdElement);
        //trContent.appendChild(tdExtra);

        const preExtra = document.createElement('pre');
        preExtra.id = `preExtra-${i}`;
        //preExtra.textContent = `Comando Zowe`;
        tdElement.appendChild(preExtra);

        if (!elemento || !environment || !stage || !system || !subSystem || !type || !ccid) {
            preElement.innerHTML = `Error: Línea inválida. Asegúrate de que todos los campos estén completos.`;
            progressBar.style.display = 'none';
            //setTimeout(() => progressBar.remove(), 500); // Eliminar la barra después de 1 segundo
            continue; // Saltar líneas inválidas
        }



        //vscode.postMessage({command: 'logMessage',text: "sss " + preElement.getHTML()});

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

                        resultText += headerElement + blank +
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
                    resultText += formatElmName + blank +
                        formatTypeName + blank +
                        formatEnvName + blank +
                        formatStgId + blank +
                        formatSysName + blank +
                        formatSbsName + blank + '\n';

                    resultTextGlobal += formatElmName + blank +
                        formatTypeName + blank +
                        formatEnvName + blank +
                        formatStgId + blank +
                        formatSysName + blank +
                        formatSbsName + blank + '\n';

                    vscode.postMessage({ command: 'logMessage', text: 'resultTextGlobalIn: ' + resultTextGlobal });

                    resultExtraText +=
                        formatElmVVLL + blank +
                        formatProcGrpName + blank +
                        formatElmLastLLCcid + '\n';



                } catch (jsonError) {
                    // Si la línea no es un JSON válido, ignorarla
                }
            });



            // Buscar el <pre> correspondiente al comando actual
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            const spanElementId = `spanElement-${message.index}`;
            const spanElement = document.getElementById(spanElementId);

            const preExtraId = `preExtra-${message.index}`;
            const preExtra = document.getElementById(preExtraId);


            //vscode.postMessage({ command: 'logMessage', text: 'click: ' + resultText });

            if (preElement) {
                preElement.innerHTML = resultText || 'No se encontraron datos JSON válidos.';
                preExtra.innerHTML = resultExtraText;
                vscode.postMessage({ command: 'logMessage', text: 'stdout: ' + stdout });

            }



        } catch (error) {
            // Si ocurre un error general, mostrar la respuesta completa
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            if (preElement) {
                preElement.innerHTML = `Error al procesar la respuesta: ${error.message}\nRespuesta completa:\n${stdout}`;
            }
        }


        // Ocultar la barra de progreso
        if (progressBar) {
            progressBar.style.display = 'none';
            //setTimeout(() => progressBar.remove(), 1000); // Eliminar la barra después de 1 segundo
        }




    }
});

let lastSelectedColumn = null; // Variable para rastrear la última columna seleccionada

function seleccionarColumna(colIndex) {
    const table = document.getElementById('tableContent');
    const rows = table.querySelectorAll('tbody tr');
    const columnData = [];



    // Si la columna seleccionada es la misma que la última, deseleccionarla
    if (lastSelectedColumn === colIndex) {
        // Limpiar resaltado previo
        table.querySelectorAll('td, th').forEach(cell => {
            cell.classList.remove('selected-column');
        });
        lastSelectedColumn = null; // Restablecer la selección
        return; // Salir de la función
    }
    // Limpiar resaltado previo
    table.querySelectorAll('td, th').forEach(cell => {
        cell.classList.remove('selected-column');
    });

    // Recopilar datos de la columna seleccionada y resaltar celdas
    rows.forEach(row => {
        const cell = row.cells[colIndex];
        if (cell) {
            columnData.push(cell.textContent.trim());
            cell.classList.add('selected-column');
        }
    });

    // Resaltar el encabezado de la columna seleccionada
    const headerCell = table.querySelector(`thead th:nth-child(${colIndex + 1})`);
    if (headerCell) {
        headerCell.classList.add('selected-column');
    }

    // Copiar los datos al portapapeles
    const columnText = columnData.join('\n'); // Unir los datos con saltos de línea
    navigator.clipboard.writeText(columnText).then(() => {
        //alert('Columna copiada al portapapeles:\n' + columnText);
        vscode.postMessage({ command: 'logMessage', text: 'Columna copiada al portapapeles:\n' + columnText });
    }).catch(err => {
        //console.error('Error al copiar al portapapeles:', err);
        vscode.postMessage({ command: 'logMessage', text: 'Error al copiar al portapapeles:' + err });
    });

    // Actualizar la última columna seleccionada
    lastSelectedColumn = colIndex;

}


document.getElementById('exportarTxt').addEventListener('click', () => {

    vscode.postMessage({ command: 'logMessage', text: 'in' });

    vscode.postMessage({ command: 'logMessage', text: 'resultTextGlobal: ' + resultTextGlobal });

    vscode.postMessage({
        command: 'exportarTxtBackend',
        content: resultTextGlobal // o la variable que acumula tu texto
    });

    resultTextGlobal = '';

    // Crea un blob con el contenido acumulado
    const blob = new Blob([resultTextGlobal], { type: 'text/plain' });
    vscode.postMessage({ command: 'logMessage', text: 'blob :' + blob });

    const url = URL.createObjectURL(blob);
    vscode.postMessage({ command: 'logMessage', text: 'url :' + url });

    // Crea un enlace temporal y simula el click
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultado.txt';
    document.body.appendChild(a);
    a.click();

    alert('here');

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Si no ves el archivo "resultado.txt" en tu carpeta de descargas, revisa la configuración de seguridad de VS Code o intenta abrir la WebView en una ventana separada.');
    }, 1000);

    vscode.postMessage({ command: 'logMessage', text: 'a.textContent :' + a.textContent });

    // Limpia el enlace temporal
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});