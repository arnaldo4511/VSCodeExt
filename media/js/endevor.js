const vscode = acquireVsCodeApi();

let elementosFPH;

//vscode.postMessage({ command: 'logMessage', text: "clickJs" });

document.getElementById('elementosBuscar').addEventListener('click', async () => {



    const elementosValue = document.getElementById('elementosTextarea').value;

    console.log('elementosValue:', elementosValue);
    // Dividir el contenido del textarea en líneas
    const linesConsult = elementosValue.split('\n').filter(line => line.trim() !== '');

    console.log('linesConsult:', linesConsult);

    // crear tabla de resultados (THEAD y TBODY)
    const tableBody = crearTablaResultados();

    // Recorrer cada línea
    for (let i = 0; i < linesConsult.length; i++) {

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        const lineConsult = linesConsult[i].trim();

        console.log('lineConsult:', lineConsult);

        const [elemento, environment, system, subSystem, type, ccid] = lineConsult.split(';');

        const errorParametros = crearTablaLine(i, tableBody, elemento, environment, system, subSystem, type, ccid);

        if (errorParametros) {
            // Si hay un error en los parámetros, continuar con la siguiente línea
            continue;
        }

        // Generar el comando Zowe CLI
        const zoweCommandConcat = 'endevor list elements ' + elemento + ' -i ENDEVOR --env ' + environment + ' --sys ' + system + ' --sub ' + subSystem + ' --typ ' + type + ' --rft list --data ALL --wcll ' + ccid;

        // Enviar el comando al backend
        vscode.postMessage({ command: 'runZoweCommand', zoweCommand: zoweCommandConcat, index: i });

        // Esperar un breve momento para evitar saturar el backend
        await new Promise(resolve => setTimeout(resolve, 500));

    }

    //vscode.postMessage({command: 'logMessage',text: 'click Procesamiento completado para todos los elementos.'});
});


function crearTablaResultados() {
    // Contenedor para los resultados
    const tablaContenedora = document.getElementById('tablaContenedora');
    tablaContenedora.innerHTML = ''; // Limpiar resultados previos


    const tableContent = document.createElement('table');
    tableContent.id = 'tableContent';
    tablaContenedora.appendChild(tableContent);

    const theadContent = document.createElement('thead');
    tableContent.appendChild(theadContent);

    const trHeader = document.createElement('tr');
    theadContent.appendChild(trHeader);

    const thBusqueda = document.createElement('th');
    thBusqueda.textContent = 'BUSQUEDA';
    thBusqueda.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    trHeader.appendChild(thBusqueda);

    const thData = document.createElement('th');
    thData.textContent = 'RESULTADO';
    thData.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    trHeader.appendChild(thData);

    const thExtra = document.createElement('th');
    thExtra.textContent = 'EXTRA';
    thExtra.style.cursor = 'pointer'; // Cambiar el cursor al pasar por encima
    //trHeader.appendChild(thExtra);

    const tableBody = document.createElement('tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados
    tableContent.appendChild(tableBody);

    return tableBody;
}

function crearTablaLine(i, tableBody, elemento, environment, system, subSystem, type, ccid) {

    // Crear una nueva fila para la tabla de resultados


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
        'System:        <b>' + system + '</b><br>' +
        'SubSystem:     <b>' + subSystem + '</b><br>' +
        'Type:          <b>' + type + '</b><br>' +
        'CCID:          <b>' + ccid + '</b><br>';
    preBusqueda.style.fontWeight = 'normal'; // Aplicar negrita directamente
    tdBusqueda.appendChild(preBusqueda);

    const tdElement = document.createElement('td');
    tdElement.id = `tdElement-${i}`;
    //tdElement.classList.add('rowSingle');
    tdElement.style.width = '800px'; // Establecer ancho fijo
    //divMain.appendChild(tdElement);
    //tdElement.innerHTML = 'fffff';
    trContent.appendChild(tdElement);


    // Crear un nuevo <pre> para mostrar el resultado de esta consulta
    const preElement = document.createElement('pre');
    preElement.id = `result-${i}`;
    tdElement.appendChild(preElement);


    // Crear una barra de progreso para esta consulta
    const progressBar = document.createElement('progress');
    progressBar.id = `progress-${i}`;
    tdElement.appendChild(progressBar);

    const tdExtra = document.createElement('td');
    tdExtra.id = `tdExtra-${i}`;
    tdExtra.style.width = '200px'; // Establecer ancho fijo


    const preExtra = document.createElement('pre');
    preExtra.id = `preExtra-${i}`;
    tdElement.appendChild(preExtra);

    if (!elemento || !environment || !system || !subSystem || !type || !ccid) {
        preElement.innerHTML = `Error: Línea inválida. Asegúrate de que todos los campos estén completos.`;
        progressBar.style.display = 'none';
        return true; // Retornar true para indicar que hay un error
    }

    return false; // Retornar false para indicar que no hay error

}

// Escuchar mensajes desde el backend
window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'zoweResponse') {

        const stdout = message.response;

        //console.log('stdout:', stdout);

        const progressBarId = `progress-${message.index}`;
        const progressBar = document.getElementById(progressBarId);


        const tdBusqueda = document.getElementById(`tdElement-${message.index}`);



        // Después de procesar stdout y antes de mostrar los resultados
        const warnLines = stdout.split('\n').filter(line =>
            line.startsWith('[WARN]') && line.includes('No matching elements found.')
        );



        if (warnLines.length > 0) {

            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);
            preElement.innerHTML = '[WARN] No se encontraron los elementos';

            progressBar.style.display = 'none';

            return;
        }

        const errorLines = stdout.split('\n').filter(line =>
            line.startsWith('Error:')
        );

        if (errorLines.length > 0) {

            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);
            preElement.innerHTML = stdout;

            progressBar.style.display = 'none';

            return;
        }

        try {


            // Dividir la respuesta en líneas
            const lines = stdout.split('\n');

            console.log('lines: ', lines);
            console.log('lines.length: ', lines.length);

            // Procesar cada línea para buscar JSON válidos
            let resultText = '';
            let resultExtraText = '';
            let headerAdded = false; // Bandera para controlar la cabecera

            let cantidadLines = 0; // Contador de líneas procesadas

            lines.forEach((line) => {
                try {

                    cantidadLines++;



                    // Intentar analizar la línea como JSON
                    const jsonResponse = JSON.parse(line);


                    // Extraer los campos específicos del JSON
                    const elmName = (jsonResponse.elmName ?? '').toString();
                    const typeName = (jsonResponse.typeName ?? '').toString();
                    const envName = (jsonResponse.envName ?? '').toString();
                    const stgId = (jsonResponse.stgId ?? '').toString();
                    const sysName = (jsonResponse.sysName ?? '').toString();
                    const sbsName = (jsonResponse.sbsName ?? '').toString();
                    const elmVVLL = (jsonResponse.elmVVLL ?? '').toString();
                    const procGrpName = (jsonResponse.procGrpName ?? '').toString();
                    const elmLastLLDate = (jsonResponse.elmLastLLDate ?? '').toString();
                    const elmLastLLCcid = (jsonResponse.elmLastLLCcid ?? '').toString();
                    const signoutId = (jsonResponse.signoutId ?? '').toString();

                    //vscode.postMessage({ command: 'logMessage', text: 'signoutId: ' + signoutId });

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
                    const formatSignoutId = signoutId.padEnd(6, ' ');

                    //vscode.postMessage({ command: 'logMessage', text: 'formatSignoutId: ' + formatSignoutId });

                    if (!headerAdded) {
                        /*const headerElement = 'ELEMENT --  ';
                        const headerType = 'TYPE      ';
                        const headerEnv = 'ENVIRON ';
                        const headerStgId = 'S';
                        const headerSysName = 'SYSTEM  ';
                        const headerSbsName = 'SUBSYS  ';

                        const headerElmVVLL = 'VVLL';
                        const headerProcGrpName = 'PROCGRP ';
                        const headerElmLastLLCcid = 'CCID       ';
                        const headerSignout = 'SIGNOUT';

                        resultText += headerElement + blank +
                            headerType + blank +
                            headerEnv + blank +
                            headerStgId + blank +
                            headerSysName + blank +
                            headerSbsName + blank + '\n';


                        resultExtraText +=
                            headerElmVVLL + blank +
                            headerProcGrpName + blank +
                            headerElmLastLLCcid + blank +
                            headerSignout + '\n';

                        headerAdded = true; // Marcar que la cabecera ya fue agregada*/

                        const trHeadContent = document.createElement('tr');
                        trHeadContent.id = `trHeadContent-${message.index}`;
                        trHeadContent.style.fontFamily = 'Courier New';
                        tdBusqueda.appendChild(trHeadContent);

                        const tdHeadElemento = document.createElement('td');
                        tdHeadElemento.innerHTML = "ELEMENT";
                        trHeadContent.appendChild(tdHeadElemento);

                        const tdHeadType = document.createElement('td');
                        tdHeadType.innerHTML = "TYPE";
                        trHeadContent.appendChild(tdHeadType);

                        const tdHeadEnviroment = document.createElement('td');
                        tdHeadEnviroment.innerHTML = "ENVIRON";
                        trHeadContent.appendChild(tdHeadEnviroment);

                        const tdHeadStage = document.createElement('td');
                        tdHeadStage.innerHTML = "S";
                        trHeadContent.appendChild(tdHeadStage);

                        const tdHeadSystem = document.createElement('td');
                        tdHeadSystem.innerHTML = "SYSTEM";
                        trHeadContent.appendChild(tdHeadSystem);
                        
                        const tdHeadSubSystem = document.createElement('td');
                        tdHeadSubSystem.innerHTML = "SUBSYS";
                        trHeadContent.appendChild(tdHeadSubSystem);



                        


                    }

                    // Construir el texto para mostrar en el <pre>
                    resultText += '<button>D</button>';
                    resultText += formatElmName + blank +
                        formatTypeName + blank +
                        formatEnvName + blank +
                        formatStgId + blank +
                        formatSysName + blank +
                        formatSbsName + blank + '\n';


                    resultExtraText +=
                        formatElmVVLL + blank +
                        formatProcGrpName + blank +
                        formatElmLastLLCcid + blank +
                        formatSignoutId + '\n';



                    const trResultContent = document.createElement('tr');
                    trResultContent.id = `trResultContent-${message.index}`;
                    trResultContent.style.fontFamily = 'Courier New';
                    tdBusqueda.appendChild(trResultContent);


                    const tdElemento = document.createElement('td');
                    tdElemento.innerHTML = formatElmName;
                    trResultContent.appendChild(tdElemento);

                    const tdType = document.createElement('td');
                    tdType.innerHTML = formatTypeName;
                    trResultContent.appendChild(tdType);

                    const tdEnviroment = document.createElement('td');
                    tdEnviroment.innerHTML = formatEnvName;
                    trResultContent.appendChild(tdEnviroment);

                    const tdStage = document.createElement('td');
                    tdStage.innerHTML = formatStgId;
                    trResultContent.appendChild(tdStage);

                    const tdSystem = document.createElement('td');
                    tdSystem.innerHTML = formatSysName;
                    trResultContent.appendChild(tdSystem);

                    const tdSubSystem = document.createElement('td');
                    tdSubSystem.innerHTML = formatSbsName;
                    trResultContent.appendChild(tdSubSystem);

                    //vscode.postMessage({ command: 'logMessage', text: 'resultText: ' + resultText });
                    //vscode.postMessage({ command: 'logMessage', text: 'resultExtraText: ' + resultExtraText });

                } catch (jsonError) {
                    // Si la línea no es un JSON válido, ignorarla
                }
            });

            console.log('cantidadLines: ', cantidadLines);



            // Buscar el <pre> correspondiente al comando actual
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            const spanElementId = `spanElement-${message.index}`;
            const spanElement = document.getElementById(spanElementId);

            const preExtraId = `preExtra-${message.index}`;
            const preExtra = document.getElementById(preExtraId);


            //vscode.postMessage({ command: 'logMessage', text: 'click: ' + resultText });

            if (preElement) {
                //preElement.innerHTML = resultText;
                //preExtra.innerHTML = resultExtraText;

                //vscode.postMessage({ command: 'logMessage', text: 'stdout: ' + stdout });

                elementosFPH += resultText; // Acumula el texto en la variable global
                console.log('elementosFPH 1: ', elementosFPH);
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




function getResultadoColumnText() {
    // Selecciona todos los <pre> cuyo id comienza con "result-"
    const preElements = document.querySelectorAll('pre[id^="result-"]');
    const resultadoLines = [];
    preElements.forEach(pre => {
        // Divide el contenido en líneas, filtra las que no empiezan con "ELEMENT" y no están vacías
        const lines = pre.textContent
            .split('\n')
            .filter(line => line.trim() !== '' && !line.trim().startsWith('ELEMENT'));
        resultadoLines.push(...lines);
    });
    // Une todas las líneas, separadas por salto de línea
    return resultadoLines.join('\n');
}



document.getElementById('exportarTxt').addEventListener('click', () => {

    const resultadoTxt = getResultadoColumnText();

    console.log('elementosFPH: ', elementosFPH);


    vscode.postMessage({
        command: 'exportarTxtBackend',
        content: resultadoTxt // o la variable que acumula tu texto
    });

    // Crea un blob con el contenido acumulado
    const blob = new Blob([resultadoTxt], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    // Crea un enlace temporal y simula el click
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DESCARGAR.txt';
    document.body.appendChild(a);
    a.click();


    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1000);


    // Limpia el enlace temporal
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});


const textarea = document.getElementById('elementosInput');
const MAX_ROWS = 10;

textarea.addEventListener('input', function () {
    const lines = textarea.value.split('\n');
    if (lines.length > MAX_ROWS) {
        textarea.value = lines.slice(0, MAX_ROWS).join('\n');
        // Opcional: notificar al usuario
        vscode.postMessage({ command: 'alertaMaxRows', text: ' Solo se permiten ' + MAX_ROWS + ' consultas.' });
        //alert('Solo se permiten ' + MAX_ROWS + ' filas.');
    }
});