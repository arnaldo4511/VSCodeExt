const vscode = acquireVsCodeApi();

vscode.postMessage({command: 'logMessage',text: "clickJs"});

const elementoValue = document.getElementById('elementosInput').value;

document.getElementById('elementosBuscar').addEventListener('click', async () => {

    vscode.postMessage({command: 'logMessage',text: "clickJs"});

    const elementoValue = document.getElementById('elementosInput').value;

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
        const [elemento, environment,stage,system, subSystem, type, ccid] = line.split(';');

        if (!elemento || !environment || !stage || !system || !subSystem || !type || !ccid) {
            continue; // Saltar líneas inválidas
        }

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        // Generar el comando Zowe CLI
        const zoweCommandConcat = 'zowe endevor list elements ' + elemento + ' -i ENDEVOR --env ' + environment + ' --sn ' + stage + ' --sys ' + system + ' --sub ' + subSystem + ' --typ ' + type +' --rft list --data ALL --wcll '+ ccid;


        //vscode.postMessage({command: 'logMessage',text: "qqq"});

        const divMain = document.createElement('div');
        divMain.id = `divMain-${i}`;
        divMain.classList.add('row');
        //divMain.style.width = '450px'; // Establecer ancho fijo
        resultsContainer.appendChild(divMain);

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const pElement = document.createElement('p');
        pElement.id = `resultP-${i}`;
        pElement.textContent = `${elemento} - ${environment} - ${stage} - ${system} - ${subSystem} - ${type} - ${ccid}`;
        pElement.style.fontWeight = 'bold'; // Aplicar negrita directamente
        //pElement.style.textDecoration = 'underline'; // Aplicar subrayado directamente
        pElement.style.width = '150px'; // Establecer ancho fijo
        pElement.classList.add('content');
        divMain.appendChild(pElement);

        const divElement = document.createElement('div');
        divElement.id = `divElement-${i}`;
        //divElement.classList.add('row');
        //divElement.style.width = '450px'; // Establecer ancho fijo
        divMain.appendChild(divElement);

        // Crear una barra de progreso para esta consulta
        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        //progressBar.max = 100;
        //progressBar.value = 0;
        //progressBar.classList.add('row');
        divElement.appendChild(progressBar);

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const preElement = document.createElement('pre');
        preElement.id = `result-${i}`;
        preElement.classList.add('content');
        preElement.textContent = `Procesando: TSO BUS ${elemento} ${environment} ${stage} ${system} ${subSystem} ${type} ${ccid}`;
        preElement.style.width = '400px'; // Establecer ancho fijo
        divElement.appendChild(preElement);

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
            // Intentar analizar la respuesta como JSON
            const jsonResponse = JSON.parse(stdout);

            // Extraer los campos específicos del JSON
            const { elmName, envName, stgId, sysName, sbsName, typeName, elmLastLLCcid } = jsonResponse;

            // Construir el texto para mostrar en el <pre>
            const resultText = `
                Elemento: ${elmName}
                Entorno: ${envName}
                Stage: ${stgId}
                Sistema: ${sysName}
                SubSistema: ${sbsName}
                Tipo: ${typeName}
                CCID: ${elmLastLLCcid}
            `;

            // Buscar el <pre> correspondiente al comando actual
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            if (preElement) {
                preElement.textContent = resultText; // Actualizar el contenido del <pre> con los datos del JSON
            }
        } catch (error) {
            // Si no es un JSON válido, mostrar la respuesta completa
            const preElementId = `result-${message.index}`;
            const preElement = document.getElementById(preElementId);

            if (preElement) {
                preElement.textContent = `Error al analizar JSON: ${error.message}\nRespuesta completa:\n${stdout}`;
            }
        }

        // Ocultar la barra de progreso
        if (progressBar) {
            setTimeout(() => progressBar.remove(), 1000); // Eliminar la barra después de 1 segundo
        }

    }
});
