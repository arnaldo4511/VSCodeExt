const vscode = acquireVsCodeApi();

vscode.postMessage({ command: 'logMessage', text: "clickJs" });

const elementoValue = document.getElementById('elementosInput').value;

document.getElementById('elementosBuscar').addEventListener('click', async () => {

    vscode.postMessage({ command: 'logMessage', text: "clickJs" });

    const elementoValue = document.getElementById('elementosInput').value;

    vscode.postMessage({ command: 'logMessage', text: "elementoValue: " + elementoValue });

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

    // Recorrer cada línea
    for (let i = 0; i < lines.length; i++) {

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        const line = lines[i].trim();
        const [elemento, environment, stage, system, subSystem, type, ccid] = line.split(';');



        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        vscode.postMessage({ command: 'logMessage', text: "111" });

        // Generar el comando Zowe CLI
        const zoweCommandConcat = 'zowe endevor list elements ' + elemento + ' -i ENDEVOR --env ' + environment + ' --sn ' + stage + ' --sys ' + system + ' --sub ' + subSystem + ' --typ ' + type + ' --rft list --data ALL --wcll ' + ccid;


        vscode.postMessage({ command: 'logMessage', text: "222" });

        const divMain = document.createElement('div');
        divMain.id = `divMain-${i}`;
        divMain.classList.add('row');
        //divMain.style.width = '450px'; // Establecer ancho fijo
        //resultsContainer.appendChild(divMain);

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const pElement = document.createElement('p');
        pElement.id = `resultP-${i}`;
        pElement.textContent = `${elemento} - ${environment} - ${stage} - ${system} - ${subSystem} - ${type} - ${ccid}`;
        pElement.style.fontWeight = 'bold'; // Aplicar negrita directamente
        //pElement.style.textDecoration = 'underline'; // Aplicar subrayado directamente
        pElement.style.width = '150px'; // Establecer ancho fijo
        pElement.classList.add('content');
        //divMain.appendChild(pElement);

        const divElement = document.createElement('div');
        divElement.id = `divElement-${i}`;
        //divElement.classList.add('row');
        //divElement.style.width = '450px'; // Establecer ancho fijo
        //divMain.appendChild(divElement);
        resultsContainer.appendChild(divElement);

        // Crear una barra de progreso para esta consulta
        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        //progressBar.max = 100;
        //progressBar.value = 0;
        //progressBar.classList.add('row');
        divElement.appendChild(progressBar);

        const preCabecera = document.createElement('pre');
        preCabecera.id = `preCabecera-${i}`;
        divElement.appendChild(preCabecera);

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const preElement = document.createElement('pre');
        preElement.id = `result-${i}`;
        preElement.classList.add('content');
        preElement.textContent = `Procesando: ${elemento} ${environment} ${stage} ${system} ${subSystem} ${type} ${ccid}`;
        preElement.style.width = '100%'; // Establecer ancho fijo
        divElement.appendChild(preElement);

        if (!elemento || !environment || !stage || !system || !subSystem || !type || !ccid) {
            preElement.textContent = `Error: Línea inválida. Asegúrate de que todos los campos estén completos.`;
            setTimeout(() => progressBar.remove(), 500); // Eliminar la barra después de 1 segundo
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
            let headerAdded = false; // Bandera para controlar la cabecera

            lines.forEach((line) => {
                try {
                    // Intentar analizar la línea como JSON
                    const jsonResponse = JSON.parse(line);

                    // Extraer los campos específicos del JSON
                    const { elmName, typeName, envName, stgId, sysName, sbsName, elmVVLL, procGrpName, elmLastLLDate, elmLastLLCcid } = jsonResponse;

                    if (!headerAdded) {
                        resultText += 'ELEMENT --   TYPE       ENVIRON  S SYSTEM   SUBSYS   VVLL PROCGRP CUR DTE   CCID' + '\n';
                        headerAdded = true; // Marcar que la cabecera ya fue agregada
                    }

                    // Construir el texto para mostrar en el <pre>
                    resultText += `${elmName}      ${typeName}   ${envName}  ${stgId} ${sysName} ${sbsName}   ${elmVVLL} ${procGrpName}  ${elmLastLLCcid}` + '\n';

                } catch (jsonError) {
                    // Si la línea no es un JSON válido, ignorarla
                }
            });

            // Buscar el <pre> correspondiente al comando actual
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            vscode.postMessage({ command: 'logMessage', text: 'click: ' + resultText });

            if (preElement) {
                preElement.textContent = resultText || 'No se encontraron datos JSON válidos.';
                
            }
        } catch (error) {
            // Si ocurre un error general, mostrar la respuesta completa
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            if (preElement) {
                preElement.textContent = `Error al procesar la respuesta: ${error.message}\nRespuesta completa:\n${stdout}`;
            }
        }

        // Ocultar la barra de progreso
        if (progressBar) {
            setTimeout(() => progressBar.remove(), 1000); // Eliminar la barra después de 1 segundo
        }

    }
});
