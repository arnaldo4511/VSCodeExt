// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const path = require('path');
    const fs = require('fs');

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscodeext" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('vscodeext.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from VSCodeExt!');
    });

    context.subscriptions.push(disposable);

    // Registrar el comando para abrir un Webview en el área del editor
    const openWebviewCommand = vscode.commands.registerCommand('vscodeext.openWebview', () => {
        const panel = vscode.window.createWebviewPanel(
            'exampleWebview', // Identificador interno
            'Example Webview', // Título del Webview
            vscode.ViewColumn.One, // Mostrar en la primera columna
            {
                enableScripts: true, // Permitir scripts en el Webview
            }
        );

        // Ruta al archivo HTML
        const htmlPath = path.join(context.extensionPath, 'media', 'webview.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Establecer el contenido HTML en el Webview
        panel.webview.html = htmlContent;

        // Escuchar mensajes desde el Webview
        panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'runZoweCommand') {
                const zoweCommand = message.zoweCommand;
                if (zoweCommand) {
                    // Ejecutar el comando de Zowe CLI en segundo plano
                    exec(zoweCommand, (error, stdout, stderr) => {
                        if (error) {
                            //vscode.window.showErrorMessage(`Error: ${error.message}`);
                            panel.webview.postMessage({ command: 'errorMessage', errorMessage: error.message });
                            return;
                        }
                        if (stderr) {
                            //vscode.window.showWarningMessage(`Stderr: ${stderr}`);
                            panel.webview.postMessage({ command: 'stderrOutput', stderr });
                            return;
                        }
                        //vscode.window.showInformationMessage(`Output: ${stdout}`);
                        panel.webview.postMessage({ command: 'stdoutOutput', stdout });
                    });
                }
            }
        });
    });




    context.subscriptions.push(openWebviewCommand);

    // Registrar un proveedor de vista para la Activity Bar
    const myViewProvider = new MyViewProvider(context.extensionUri);
    //context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscodeext-activitybar.vscodeext-view', myViewProvider);
    //);
    console.log('MyViewProvider registered');


    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeext.openDestaWebview', () => {
            const panel = vscode.window.createWebviewPanel(
                'destaWebview',
                'DESTA',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );

            //const htmlPath = path.join(__dirname, 'media', 'desta.html'); // Archivo HTML para DESTA
            const htmlPath = path.join(context.extensionPath, 'media', 'desta.html');
            panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
        })
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'myView',
            new MyViewProvider(context.extensionUri)
        )
    );
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
            if (message.command === 'openWebview') {
                vscode.commands.executeCommand('vscodeext.openWebview');
            }
            if (message.command === 'openDestaWebview') {
                vscode.commands.executeCommand('vscodeext.openDestaWebview');
            }
        });

        webviewView.webview.html = this.getHtmlForWebview();
    }

    private getHtmlForWebview(): string {
        const htmlPath = path.join(__dirname, '..', 'media', 'view.html'); // Ruta al archivo HTML
        return fs.readFileSync(htmlPath, 'utf8'); // Leer el contenido del archivo HTML
    }
}