// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as child_process from "child_process";
import path = require("path");

function runCertgen(args: any, callback: (stdout: string) => void): void {
  // Parse the args
  let arglist = [];
  for (let key in args) {
    if (args.hasOwnProperty(key)) {
      arglist.push(`--${key}`);
      if (args[key] !== null) {
        arglist.push(`${args[key]}`);
      }
    }
  }

  console.log(arglist);

  // Get extension folder
  let folder = vscode.extensions.getExtension("mek.cert-gen")?.extensionPath || "";

  // Run the command
  let exec = child_process.execFile;
  let result = '';

  let execString = path.join(folder, 'src', process.platform === 'win32' ? 'certgen.exe' : 'certgen');
  let child = exec(execString, arglist);

  child.stdout?.on('data', function (data) {
    result += data;
  });

  child.on('close', function () {
    callback(result);
  });
}

function writeSignature(signature: string): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) { 
    editor.edit((editBuilder) => {
      const document = editor.document;

      const lastLine = document.lineAt(document.lineCount - 1);
      const text = [
        "*** Begin of digital signature ***",
        signature,
        "*** End of digital signature ***\n",
      ].join('\n');

      // Test if a signature already exists
      const pattern = /\*\*\* Begin of digital signature \*\*\*\s*[a-fA-f0-9]+\s+\*\*\* End of digital signature \*\*\*\s*$/;
      const match = pattern.exec(document.getText());
      
      // Signature exists in the document
      if (match) {
        let position = document.positionAt(match.index);
        let range = new vscode.Range(position, lastLine.range.end);
        editBuilder.replace(range, text);
      } else {
        // Insert at end of file
        editBuilder.insert(lastLine.range.end, "\n" + text);
      }
      
    });
  }
}

function readSignature(text: string): string | null {
  let match = text.match(/(?<=\*\*\* Begin of digital signature \*\*\*\s*)[a-fA-f0-9]+(?=\s+\*\*\* End of digital signature \*\*\*\s*$)/);
  return match ? match[0] : null;
}

function removeSignature(text: string): string {
  return text.replace(/\*\*\* Begin of digital signature \*\*\*\s*[a-fA-f0-9]+\s+\*\*\* End of digital signature \*\*\*\s*$/, "");
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "cert-gen" is now active!');

  context.subscriptions.push(vscode.commands.registerCommand("cert-gen.sign", sign));
  context.subscriptions.push(vscode.commands.registerCommand("cert-gen.validate", validate));
}

// this method is called when your extension is deactivated
export function deactivate() { }

function sign() {
  // Make sure a text editor is open
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // Get the text editor contents
    let document = editor.document;
    const docText = document.getText();

    // Get keys
    let config = vscode.workspace.getConfiguration("");
    let currVal = config.get("certgen.key", Object());

    // Fail if keys are missing
    if (Object.keys(currVal).length !== 3) {
      vscode.window.showInformationMessage("There are no keys saved, please generate keys first");
      return;
    }

    // Get text, removing the existing signature if necessary
    let text = removeSignature(docText).trim();

    // Generate & write signature
    runCertgen(
      { "sign": null, "private": `${currVal.n},${currVal.d}`, "message": text },
      (stdout) => {
        let signature = parseInt(stdout).toString(16).toUpperCase();
        
        vscode.window.showInformationMessage(`Signature: ${signature}`);

        writeSignature(signature);
      }
    );
  } else {
    vscode.window.showInformationMessage("No text editor active");
  }
}

function validate() {
  // Make sure a text editor is open
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // Get the text editor contents
    let document = editor.document;
    const docText = document.getText();

    // Get keys
    let config = vscode.workspace.getConfiguration("");
    let currVal = config.get("certgen.key", Object());

    // Fail if keys are missing
    if (Object.keys(currVal).length !== 3) {
      vscode.window.showInformationMessage("There are no keys saved, please generate keys first");
      return;
    }

    // Get signature
    let signString = readSignature(docText);

    // Fail if signature is missing
    if (!signString) {
      vscode.window.showInformationMessage("No signature is detected at the end of this file");
      return;
    }

    // Convert to decimal
    let signature = parseInt(signString, 16);

    // Get text
    let text = removeSignature(docText).trim();

    // Validate signature
    runCertgen(
      { "verify": null, "public": `${currVal.n},${currVal.e}`, "signature": signature, "message": text },
      (stdout) => {
        if (stdout.startsWith("true")) {
          vscode.window.showInformationMessage(`This document contains a VALID signature`);
        } else {
          vscode.window.showInformationMessage(`This document's signature is INVALID`);
        }
      }
    );
  } else {
    vscode.window.showInformationMessage("No text editor active");
  }
}
