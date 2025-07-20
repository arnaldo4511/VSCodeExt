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
    thData.textContent = 'RESULTADO';
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
        const zoweCommandConcat = 'endevor list elements ' + elemento + ' -i ENDEVOR --env ' + environment + ' --sn ' + stage + ' --sys ' + system + ' --sub ' + subSystem + ' --typ ' + type + ' --rft list --data ALL --wcll ' + ccid;


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

        // Después de procesar stdout y antes de mostrar los resultados
        const warnLines = stdout.split('\n').filter(line =>
            line.startsWith('[WARN]') && line.includes('No matching elements found.')
        );

        if (warnLines.length > 0) {

            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);
            preElement.innerHTML = 'No se encontraron los elementos';

            progressBar.style.display = 'none';

            //vscode.postMessage({ command: 'logMessage', text: 'No se encontraron los elementos' });
            // O si prefieres mostrarlo en la UI:
            // alert('No se encontraron los elementos');
            return;
        }

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
                        const headerElement = 'ELEMENT --  ';
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

                        headerAdded = true; // Marcar que la cabecera ya fue agregada
                    }

                    // Construir el texto para mostrar en el <pre>
                    resultText += <button id="btn-${message.index}" class="btn btn-primary" onclick="vscode.postMessage({ command: 'logMessage', text: 'click: ' + resultText })">Click</button> +
                        '<span id="spanElement-' + message.index + '">' +
                        '<b>' + elmName + '</b></span>' + blank +
                        formatElmName + blank +
                        formatTypeName + blank +
                        formatEnvName + blank +
                        formatStgId + blank +
                        formatSysName + blank +
                        formatSbsName + blank;
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


                    //vscode.postMessage({ command: 'logMessage', text: 'resultText: ' + resultText });
                    //vscode.postMessage({ command: 'logMessage', text: 'resultExtraText: ' + resultExtraText });

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
                //vscode.postMessage({ command: 'logMessage', text: 'stdout: ' + stdout });

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