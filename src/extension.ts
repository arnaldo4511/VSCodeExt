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


    // Registrar un proveedor de vista para la Activity Bar
    const myViewProvider = new MyViewProvider(context.extensionUri);
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
            retainContextWhenHidden: true // Mantener el contexto cuando la vista está oculta
        }
    );

    const htmlPath = path.join(context.extensionPath, 'media', htmlFileName);
    panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

    // Escuchar mensajes desde el Webview
    panel.webview.onDidReceiveMessage((message) => {
        // Mostrar mensaje en log
        if (message.command === 'logMessage') {
            logChannel.appendLine(`Mensaje desde el Webview: ${message.text}`);
            logChannel.show(); // Mostrar el canal de log (opcional)
        }

        if (message.command === 'runZoweCommand') {
            const zoweCommand = message.zoweCommand;

            logChannel.appendLine('message.index ts: '+message.index);

            exec(zoweCommand, (error, stdout, stderr) => {
                if (handleZoweCommandError(panel, error, stderr,message)) {
                    return;
                }

                logChannel.appendLine('message.index '+message.index);
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

function handleZoweCommandError(panel: vscode.WebviewPanel, error: Error | null, stderr: string | null, message:any) {
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
    constructor(private readonly extensionUri: vscode.Uri) { }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
            enableScripts: true,
        };

        // Escuchar mensajes desde el Webview
        webviewView.webview.onDidReceiveMessage((message) => {
            vscode.commands.executeCommand(`vscodeext.${message.command}`);
        });

        webviewView.webview.html = this.getHtmlForWebview();
    }

    private getHtmlForWebview(): string {
        const htmlPath = path.join(__dirname, '..', 'media', 'view.html'); // Ruta al archivo HTML
        return fs.readFileSync(htmlPath, 'utf8'); // Leer el contenido del archivo HTML
    }
}