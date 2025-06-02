const vscode = acquireVsCodeApi();

const libreriaValue = document.getElementById('libreriaInput').value;
const elementoValue = document.getElementById('elementosInput').value;

document.getElementById('elementosBuscar').addEventListener('click', async () => {

    //vscode.postMessage({command: 'logMessage',text: "clickJs"});

    const elementoValue = document.getElementById('elementosInput').value;
    const libreriaValue = document.getElementById('libreriaInput').value;

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

    const tableBody = document.createElement('tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados
    tableContent.appendChild(tableBody);

    // Recorrer cada línea
    for (let i = 0; i < lines.length; i++) {

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        const line = lines[i].trim();
        const [elementoValue, typeValue] = line.split(';');

        if (!elementoValue || !typeValue) {
            continue; // Saltar líneas inválidas
        }

        //vscode.postMessage({command: 'logMessage',text: "i: " + i});

        // Generar el comando Zowe CLI
        const zoweCommandConcat = 'tso issue cmd "EX \'' + libreriaValue + '\' \'' + typeValue + ' ' + elementoValue + '\'" -a 9999/UTI/00 --ru false';


        //vscode.postMessage({command: 'logMessage',text: "qqq"});

        const trMain = document.createElement('tr');
        trMain.id = `trMain-${i}`;
        //trMain.classList.add('row');
        //trMain.style.width = '450px'; // Establecer ancho fijo
        tableBody.appendChild(trMain);

        const tdBusqueda = document.createElement('td');
        tdBusqueda.id = `tdBusqueda-${i}`;
        //tdElement.classList.add('row');
        //tdElement.style.width = '450px'; // Establecer ancho fijo
        trMain.appendChild(tdBusqueda);


        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const preBusqueda = document.createElement('pre');
        preBusqueda.id = `preElement-${i}`;
        preBusqueda.textContent = `${elementoValue} - ${typeValue}`;
        preBusqueda.style.fontWeight = 'bold'; // Aplicar negrita directamente
        //pElement.style.textDecoration = 'underline'; // Aplicar subrayado directamente
        preBusqueda.style.width = '150px'; // Establecer ancho fijo
        preBusqueda.classList.add('content');
        tdBusqueda.appendChild(preBusqueda);


        const tdResultado = document.createElement('td');
        tdResultado.id = `tdResultado-${i}`;
        //tdElement.classList.add('row');
        //tdElement.style.width = '450px'; // Establecer ancho fijo
        trMain.appendChild(tdResultado);

        // Crear una barra de progreso para esta consulta
        const progressBar = document.createElement('progress');
        progressBar.id = `progress-${i}`;
        //progressBar.max = 100;
        //progressBar.value = 0;
        //progressBar.classList.add('row');
        tdResultado.appendChild(progressBar);

        // Crear un nuevo <pre> para mostrar el resultado de esta consulta
        const preElement = document.createElement('pre');
        preElement.id = `result-${i}`;
        preElement.classList.add('content');
        //preElement.textContent = `Procesando: TSO BUS ${typeValue} ${elementoValue} ...`;
        preElement.style.width = '400px'; // Establecer ancho fijo
        tdResultado.appendChild(preElement);

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
        //const progressBarMain = document.getElementById('progressBarMain');

        const progressBarId = `progress-${message.index}`;
        const progressBar = document.getElementById(progressBarId);

        //progressBar.value = 75;

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
            //document.getElementById('stdoutOutput').textContent = resultLines.join('\n');

            // Buscar el <pre> correspondiente al comando actual
            //const preElement = document.querySelector(`#resultsContainer pre:last-child`);
            const preElementId = `result-${message.index}`;

            const preElement = document.getElementById(preElementId);
            if (preElement) {
                //preElement.textContent = stdout; // Actualizar el contenido del <pre> con la respuesta
                preElement.textContent = resultLines.join('\n'); // Actualizar el contenido del <pre> con la respuesta

            }

        } else {

            // Buscar el <pre> correspondiente al comando actual
            //const preElement = document.querySelector(`#resultsContainer pre:last-child`);
            const preElementId = `result-${message.index}`;

            const preElement = document.getElementById(preElementId);
            if (preElement) {
                //preElement.textContent = stdout; // Actualizar el contenido del <pre> con la respuesta
                preElement.textContent = message.response; // Actualizar el contenido del <pre> con la respuesta

            }



            // Si no se encuentra "BUSCANDO", mostrar un mensaje de error
            //document.getElementById('stdoutOutput').textContent = "No se encontró la línea 'BUSCANDO' en la salida.";
        }

        // Mostrar mensaje en log

        // Mostrar la respuesta en el <pre>
        //document.getElementById('output').textContent = message.response;

        // Ocultar el progreso
        //document.getElementById('progressBar').style.display = 'none';

        // Finalizar la barra de progreso correspondiente

        //if (progressBar) {
        //progressBar.value = 100; // Completar la barra de progreso
        setTimeout(() => progressBar.remove(), 1000); // Eliminar la barra después de 1 segundo
        //}



        // Ocultar la barra de progreso al finalizar
        //progressBarMain.style.display = 'none';

    }
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
