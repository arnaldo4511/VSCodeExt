// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {



    const webviews = [
        { command: 'vscodeext.openTsoBusWebview', viewId: 'tsoBusWebview', title: 'TSO BUS', htmlFile: 'tsoBus.html' },
        { command: 'vscodeext.openTsoBusMultipleWebview', viewId: 'tsoBusMultipleWebview', title: 'TSO BUS Multiple', htmlFile: 'tsoBusMultiple.html' },
        { command: 'vscodeext.openDestaWebview', viewId: 'destaWebview', title: 'DESTA', htmlFile: 'desta.html' },
        { command: 'vscodeext.openDeslogueWebview', viewId: 'deslogueWebview', title: 'DESLOGUE', htmlFile: 'deslogue.html' },
    ];

    webviews.forEach(({ command, viewId, title, htmlFile }) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(command, () => {
                createWebview(context, viewId, title, htmlFile);
            })
        );
    });

    console.log(`context.extensionPath: ${context.extensionPath}`);

    // Registrar un proveedor de vista para la Activity Bar
    const myViewProvider = new MyViewProvider(context.extensionUri, context);
    //context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscodeext-activitybar.vscodeext-view', myViewProvider);
    //);
    console.log('MyViewProvider registered');



}

function createWebview(context: vscode.ExtensionContext, viewId: string, title: string, htmlFileName: string) {

    const logChannel = vscode.window.createOutputChannel('Webview Logs');

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

    console.log(`context.extensionPath: ${context.extensionPath}`);

    // Reemplazar las rutas de CSS y JS en el HTML
    htmlContent = replacePathsInHtml(context, panel, htmlContent, htmlFileName);



    panel.webview.html = htmlContent;   // Asignar el contenido HTML al Webview



    // Escuchar mensajes desde el Webview
    panel.webview.onDidReceiveMessage((message) => {
        // Mostrar mensaje en log
        if (message.command === 'logMessage') {
            logChannel.appendLine(`Mensaje desde el Webview: ${message.text}`);
            logChannel.show(); // Mostrar el canal de log (opcional)
        }

        if (message.command === 'runZoweCommand') {
            const zoweCommand = message.zoweCommand;

            logChannel.appendLine('message.index ts: ' + message.index);

            exec(zoweCommand, (error, stdout, stderr) => {
                if (handleZoweCommandError(panel, error, stderr, message)) {
                    return;
                }

                logChannel.appendLine('message.index ' + message.index);
                logChannel.show();

                panel.webview.postMessage({
                    command: 'zoweResponse',
                    response: stdout,
                    index: message.index
                });
            });
        }
    });

    return panel;
}

function replacePathsInHtml(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    htmlContent: string,
    htmlFileName: string
): string {

    console.log(`context: ${context}`);
    console.log(`panel: ${panel}`);
    console.log(`htmlContent: ${htmlContent}`);
    console.log(`htmlFileName: ${htmlFileName}`);


    const cssFileName = htmlFileName.replace('.html', '.css'); // Asumir que el CSS tiene el mismo nombre que el HTML
    const jsFileName = htmlFileName.replace('.html', '.js');   // Asumir que el JS tiene el mismo nombre que el HTML

    console.log(`cssFileName: ${cssFileName}`);
    console.log(`jsFileName: ${jsFileName}`);

    console.log(`__dirname: ${__dirname}`);
    console.log(`path.join(context.extensionPath, 'media', cssFileName): ${path.join(__dirname, 'media', 'css', cssFileName)}`);
    console.log(`context.extensionPath: ${context.extensionPath}`);
    console.log(`path.join(context.extensionPath, 'media', cssFileName): ${path.join(context.extensionPath, 'media', 'css', cssFileName)}`);

    const cssPathPrueba = path.join('d','VSCodeExtension','vscodeext', 'media', 'css', cssFileName);
    console.log(`cssPathPrueba: ${cssPathPrueba}`);


    // Generar URI para el archivo CSS
    const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'css', cssFileName));
    //const cssPath = vscode.Uri.file(path.join(cssPathPrueba, 'media', 'css', cssFileName));
    const cssUri = panel.webview.asWebviewUri(cssPath);

    console.log(`cssPath: ${cssPath}`);
    console.log(`cssUri: ${cssUri}`);
    

    // Generar URI para el archivo JavaScript
    const jsPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'js', jsFileName));
    const jsUri = panel.webview.asWebviewUri(jsPath);

    console.log(`jsPath: ${jsPath}`);
    console.log(`jsUri: ${jsUri}`);

    // Reemplazar las rutas en el contenido HTML
    htmlContent = htmlContent.replace(`css/${cssFileName}`, cssUri.toString());
    htmlContent = htmlContent.replace(`js/${jsFileName}`, jsUri.toString());

    console.log(`htmlContent BEFORE: ${htmlContent}`);

    return htmlContent;
}

function handleZoweCommandError(panel: vscode.WebviewPanel, error: Error | null, stderr: string | null, message: any) {
    if (error) {
        panel.webview.postMessage({
            command: 'zoweResponse',
            response: `Error: ${error.message}`,
            index: message.index
        });
        return true;
    }

    if (stderr) {
        panel.webview.postMessage({
            command: 'zoweResponse',
            response: `Stderr: ${stderr}`,
            index: message.index
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
            //localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, '..', 'media'))] // Permitir acceso a la carpeta 'media'
        };

        console.log(`__dirname: ` + __dirname);
        console.log(`path.join(__dirname, '..', 'media'): ` + path.join(__dirname, '..', 'media'));
        console.log(`this.extensionPath: ` + this.extensionPath);
        console.log(`path.join(this.extensionPath, '..', 'media'): ` + path.join(this.extensionPath, '..', 'media'));

        // Leer el contenido del archivo HTML
        const htmlPath = path.join(__dirname, '..', 'media', 'view.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        console.log(`htmlPath:` + htmlPath);

        // Reemplazar las rutas de CSS y JS en el HTML
        /*htmlContent = replacePathsInHtml(
            { extensionPath: path.join(this.extensionPath, '..') } as vscode.ExtensionContext, // Simular el contexto
            webviewView.webview as unknown as vscode.WebviewPanel, // Adaptar el tipo
            htmlContent,
            'view.html'
        );*/
        console.log(`htmlContent HERE: ` + htmlContent);

        //webviewView.webview.html = htmlContent; // Asignar el contenido HTML al Webview



        console.log(`this.extensionPath: ${this.extensionPath}`);

        console.log(`prov1:` + __dirname);


        webviewView.webview.html = this.getHtmlForWebview();

        // Escuchar mensajes desde el Webview
        webviewView.webview.onDidReceiveMessage((message) => {
            vscode.commands.executeCommand(`vscodeext.${message.command}`);
            console.log(`prov2:`);
        });
    }

    private getHtmlForWebview(): string {
        const pathon = 'd:\\VSCodeExtension\\vscodeext\\out';
        console.log(`pathon: ${pathon}`);
        console.log(`this.extensionPath: ${this.extensionPath}`);
        const htmlPath = path.join(__dirname, '..', 'media', 'view.html'); // Ruta al archivo HTML
        //const htmlPath = path.join("d:", 'VSCodeExtension', 'vscodeext', '..', 'media', 'view.html'); // Ruta al archivo HTML
        console.log(`htmlPath: ${htmlPath}`);
        return fs.readFileSync(htmlPath, 'utf8'); // Leer el contenido del archivo HTML
    }
}