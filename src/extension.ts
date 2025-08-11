// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';


const logChannel = vscode.window.createOutputChannel('Webview Logs');

let zowePathMain: string = '';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    logChannel.appendLine('Activating z/OS Dev Extension...');


    exec('npm config get prefix', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('No se pudo obtener el prefijo de npm.');
            zowePathMain = '';
        } else {
            zowePathMain = stdout.trim().replace(/\\/g, '/');
            zowePathMain = path.join(zowePathMain, 'zowe.cmd');
            logChannel.appendLine('npm prefix: ' + zowePathMain);
        }
        const prefix = stdout.trim();
    });


    const webviews = [
        { command: 'vscodeext.openTsoBusWebview', viewId: 'tsoBusWebview', title: 'TSO BUS', htmlFile: 'tsoBus.html' },
        { command: 'vscodeext.openTsoBusMultipleWebview', viewId: 'tsoBusMultipleWebview', title: 'TSO BUS', htmlFile: 'tsoBusMultiple.html' },
        { command: 'vscodeext.openDestaWebview', viewId: 'destaWebview', title: 'TSO DESTA', htmlFile: 'desta.html' },
        { command: 'vscodeext.openDeslogueWebview', viewId: 'deslogueWebview', title: 'TSO DESLOGUE', htmlFile: 'deslogue.html' },
        { command: 'vscodeext.openDownloadDatasetWebview', viewId: 'downloadDatasetWebview', title: 'DOWNLOAD DATASET', htmlFile: 'downloadDataset.html' },
        { command: 'vscodeext.openEndevorWebview', viewId: 'endevorWebview', title: 'ENDEVOR', htmlFile: 'endevor.html' },

    ];

    webviews.forEach(({ command, viewId, title, htmlFile }) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(command, () => {
                createWebview(context, viewId, title, htmlFile);
            })
        );
    });


    // Registrar un proveedor de vista para la Activity Bar
    //const myViewProvider = new MyViewProvider(context.extensionUri, context);
    /*context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('vscodeext-activitybar.vscodeext-view', new MyViewProvider(context.extensionUri, context))
    );*/


    const disposable = vscode.commands.registerCommand(
        'welcome-view-content-sample.hello',
        async () => {
            vscode.window.showInformationMessage('Hello world!');
        }
    );
    context.subscriptions.push(disposable);


    const treeDataProvider = new EmptyTreeDataProvider();
    vscode.window.createTreeView('vscodeext-view', {
        treeDataProvider
    });

    // Ejemplo de comando para el enlace del Welcome View
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.tuComando', () => {
            vscode.window.showInformationMessage('¡Bienvenido a z/OS Dev!');
        })
    );

}

class EmptyTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        // Devuelve un array vacío para que el Welcome View siempre se muestre
        return [];
    }
}

function createWebview(context: vscode.ExtensionContext, viewId: string, title: string, htmlFileName: string) {

    //const logChannel = vscode.window.createOutputChannel('Webview Logs');

    const panel = vscode.window.createWebviewPanel(
        viewId,
        title,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true, // Mantener el contexto cuando la vista está oculta
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))] // Permitir acceso a la carpeta 'media'
        }
    );

    const htmlPath = path.join(context.extensionPath, 'media', htmlFileName);
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');


    // Reemplazar las rutas de CSS y JS en el HTML
    htmlContent = replacePathsInHtml(context, panel, htmlContent, htmlFileName);



    panel.webview.html = htmlContent;   // Asignar el contenido HTML al Webview



    // Escuchar mensajes desde el Webview
    panel.webview.onDidReceiveMessage(async (message) => {

        if (message.command === 'alertaMaxRows') {
            vscode.window.showWarningMessage(message.text);
        }

        // Mostrar mensaje en log
        if (message.command === 'logMessage') {
            logChannel.appendLine(`Mensaje: ${message.text}`);
            //logChannel.show(); // Mostrar el canal de log (opcional)
        }

        if (message.command === 'descargarDataset') {
            // Mostrar diálogo para elegir carpeta
            const folderUris = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Seleccionar carpeta de destino'
            });

            //logChannel.appendLine('message.index ts: ' + message.index);
            //logChannel.appendLine('message.datasetName ts: ' + message.datasetName);
            //logChannel.appendLine('folderUris ts: ' + folderUris);
            //logChannel.appendLine('folderUris ts: ' + folderUris?.length);

            if (folderUris && folderUris.length > 0) {
                const folderPath = folderUris[0].fsPath;
                //logChannel.appendLine('Carpeta seleccionada: ' + folderPath);

                panel.webview.postMessage({
                    command: 'descargarDatasetResponse',
                    response: folderPath
                });

            } else {
                panel.webview.postMessage({
                    command: 'descargarDatasetResponse',
                    response: 'Operación cancelada por el usuario.'
                });
            }
        }

        if (message.command === 'getWorkspaceFolder') {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            panel.webview.postMessage({
                command: 'workspaceFolder',
                workspaceFolder: workspaceFolder
            });
        }

        if (message.command === 'runZoweCommand') {
            const zoweCommand = message.zoweCommand;

            //logChannel.appendLine('message.index ts: ' + message.index);
            //logChannel.appendLine('Comando Zowe CLI: ' + zoweCommand);

            vscode.window.showInformationMessage('Comando Zowe CLI: ' + zoweCommand);

            // Ejemplo de uso:
            /*getZowePath((zowePath) => {
                //logChannel.appendLine('Zowe CLI Path: ' + zowePath);
                if (!zowePath) return;
                exec(`"${zowePath}" --version`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage('No se pudo ejecutar Zowe CLI.');
                        return;
                    }
                    vscode.window.showInformationMessage('Zowe CLI versión: ' + stdout);
                });
            });*/

            // Ejemplo de uso:
            /*getZowePath((zowePath) => {
                //logChannel.appendLine('Zowe CLI Path: ' + zowePath);
                if (!zowePath) return;
                exec(`set PATH=%PATH%;"${zowePath}"`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage('No se pudo ejecutar PATH.');
                        return;
                    }
                    vscode.window.showInformationMessage('PATH: ' + stdout);
                });
            });*/



            logChannel.appendLine('zowePathMain: ' + zowePathMain);
            // Ejecutar el comando Zowe CLI
            exec(`"${zowePathMain}" ` + zoweCommand, (error, stdout, stderr) => {
                if (handleZoweCommandError(panel, error, stderr, message)) {
                    return;
                }

                logChannel.appendLine('message.index ' + message.index);
                logChannel.show();

                panel.webview.postMessage({
                    command: 'zoweResponse',
                    response: stdout,
                    index: message.index,
                    status: 'success'
                });


            });



        }

        if (message.command === 'exportarTxtBackend') {
            // Mostrar diálogo para elegir ubicación y nombre del archivo
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('DESCARGAR.txt'),
                filters: { 'Text Files': ['txt'] }
            });
            if (uri) {
                fs.writeFileSync(uri.fsPath, message.content, 'utf8');
                vscode.window.showInformationMessage('Archivo exportado correctamente: ' + uri.fsPath);
            }
        }

        if (message.command === 'mostrarElementoEndevor') {
            // Construye el comando Zowe CLI
            const zoweCmd = `"${zowePathMain}" endevor retrieve element ${message.elmName} -i ENDEVOR --env ${message.envName} --sys ${message.sysName} --sub ${message.sbsName} --typ ${message.typeName}`;

            exec(zoweCmd, async (error, stdout, stderr) => {
                if (error || stderr) {
                    vscode.window.showErrorMessage('Error al mostrar el elemento: ' + (stderr || error));
                    return;
                }

                // Crea un documento temporal y muestra el resultado
                /*const doc = await vscode.workspace.openTextDocument({ content: stdout, language: 'plaintext' });
                await vscode.window.showTextDocument(doc, { preview: true });*/
                mostrarResultadoEnWebview(`Elemento: ${message.elemento}`, stdout);
            });
        }
    });

    return panel;
}

function mostrarResultadoEnWebview(title: string, content: string) {
    const panel = vscode.window.createWebviewPanel(
        'endevorElemento', // Identificador
        title,             // Título de la pestaña
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    // Puedes personalizar el HTML según lo que necesites
    panel.webview.html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: monospace; background: #222; color: #fff; padding: 1em; }
                pre { white-space: pre-wrap; word-break: break-all; }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            <pre>${content}</pre>
        </body>
        </html>
    `;
}

function replacePathsInHtml(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    htmlContent: string,
    htmlFileName: string
): string {


    const cssFileName = htmlFileName.replace('.html', '.css'); // Asumir que el CSS tiene el mismo nombre que el HTML
    const jsFileName = htmlFileName.replace('.html', '.js');   // Asumir que el JS tiene el mismo nombre que el HTML

    // Generar URI para el archivo CSS Style
    const cssStylePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'css', "style.css"));
    const cssStyleUri = panel.webview.asWebviewUri(cssStylePath);

    // Generar URI para el archivo CSS
    const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'css', cssFileName));
    const cssUri = panel.webview.asWebviewUri(cssPath);

    // Generar URI para el archivo JavaScript
    const jsPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'js', jsFileName));
    const jsUri = panel.webview.asWebviewUri(jsPath);

    // Reemplazar las rutas en el contenido HTML
    htmlContent = htmlContent.replace(`css/style.css`, cssStyleUri.toString());
    htmlContent = htmlContent.replace(`css/${cssFileName}`, cssUri.toString());
    htmlContent = htmlContent.replace(`js/${jsFileName}`, jsUri.toString());

    return htmlContent;
}

function handleZoweCommandError(panel: vscode.WebviewPanel, error: Error | null, stderr: string | null, message: any) {
    if (error) {

        logChannel.appendLine(`Error ejecutando comando Zowe: ${error.message}`);
        panel.webview.postMessage({
            command: 'zoweResponse',
            response: `Error: ${error.message}`,
            index: message.index,
            status: 'error'
        });
        return true;
    }

    if (stderr) {
        logChannel.appendLine(`Stderr ejecutando comando Zowe: ${stderr}`);
        panel.webview.postMessage({
            command: 'zoweResponse',
            response: `Stderr: ${stderr}`,
            index: message.index,
            status: 'stderror'
        });
        return true;
    }

    return false;
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Clase para manejar la vista personalizada
class MyViewProvider implements vscode.WebviewViewProvider {
    private readonly extensionPath: string;

    constructor(private readonly extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this.extensionPath = context.extensionPath;
    }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, 'media'))] // Permitir acceso a la carpeta 'media'
        };

        //const logChannel = vscode.window.createOutputChannel('Webview Logs');
        logChannel.appendLine('Mensaje desde MyViewProvider!!!');
        //logChannel.show();


        // Leer el contenido del archivo HTML
        //const htmlPath = path.join(__dirname, '..', 'media', 'view.html');
        const htmlPath = path.join(this.extensionPath, 'media', 'view.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');


        // Generar URI para el archivo CSS
        const cssPath = vscode.Uri.file(path.join(this.extensionPath, 'media', 'css', 'view.css'));
        const cssUri = webviewView.webview.asWebviewUri(cssPath);

        // Generar URI para el archivo JS
        const jsPath = vscode.Uri.file(path.join(this.extensionPath, 'media', 'js', 'view.js'));
        const jsUri = webviewView.webview.asWebviewUri(jsPath);

        // Reemplazar las rutas relativas en el contenido HTML
        htmlContent = htmlContent.replace('css/view.css', cssUri.toString());
        htmlContent = htmlContent.replace('js/view.js', jsUri.toString());

        //webviewView.webview.html = this.getHtmlForWebview();
        webviewView.webview.html = htmlContent;

        // Escuchar mensajes desde el Webview
        webviewView.webview.onDidReceiveMessage((message) => {
            vscode.commands.executeCommand(`vscodeext.${message.command}`);
        });
    }

    private getHtmlForWebview(): string {
        const pathon = 'd:\\VSCodeExtension\\vscodeext\\out';


        const htmlPath = path.join(__dirname, '..', 'media', 'view.html'); // Ruta al archivo HTML
        //const htmlPath = path.join("d:", 'VSCodeExtension', 'vscodeext', '..', 'media', 'view.html'); // Ruta al archivo HTML
        return fs.readFileSync(htmlPath, 'utf8'); // Leer el contenido del archivo HTML
    }
}

// Función para obtener el prefijo de npm y construir la ruta a zowe
function getZowePath(callback: (zowePath: string | null) => void) {

    //const logChannel = vscode.window.createOutputChannel('Webview Logs');

    exec('npm config get prefix', (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage('No se pudo obtener el prefijo de npm.');
            callback(null);
            return;
        }
        const prefix = stdout.trim();

        // En Windows, el ejecutable suele ser zowe.cmd
        let zowePath = path.join(prefix, 'zowe.cmd');
        zowePath = zowePath.replace(/\\/g, '/');
        callback(zowePath);
    });
}