// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as child_process from "child_process";
import * as utils from "./utils";

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

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.commands.registerCommand("cert-gen.sign", () => sign(context)));
  context.subscriptions.push(vscode.commands.registerCommand("cert-gen.validate", () => validate(context)));
  context.subscriptions.push(vscode.commands.registerCommand("cert-gen.keygen", () => keygen(context)));
}

export function deactivate() { }

function sign(context: vscode.ExtensionContext) {
  // Make sure a text editor is open
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // Get the text editor contents
    let document = editor.document;
    const docText = document.getText();

    // Get keys
    var store = context.globalState;
    let n = store.get("certgen.key.n", null);
    let d = store.get("certgen.key.d", null);

    // Fail if keys are missing
    if (!n || !d) {
      vscode.window.showInformationMessage("There are no keys saved, please generate keys first");
      return;
    }

    // Get text, removing the existing signature if necessary
    let text = removeSignature(docText).trim();

    // Generate & write signature
    runCertgen(
      { "sign": null, "private": `${n},${d}`, "message": text },
      (stdout) => {
        let signature = BigInt(stdout).toString(16).toUpperCase();
        
        vscode.window.showInformationMessage(`Signature: ${signature}`);

        writeSignature(signature);
      }
    );
  } else {
    vscode.window.showInformationMessage("No text editor active");
  }
}

function validate(context: vscode.ExtensionContext) {
  // Make sure a text editor is open
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // Get the text editor contents
    let document = editor.document;
    const docText = document.getText();

    // Get keys
    var store = context.globalState;
    let n = store.get("certgen.key.n", null);
    let e = store.get("certgen.key.e", null);

    // Fail if keys are missing
    if (!n || !e) {
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
    let signature = BigInt('0x' + signString);

    // Get text
    let text = removeSignature(docText).trim();

    // Validate signature
    runCertgen(
      { "verify": null, "public": `${n},${e}`, "signature": signature, "message": text },
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

function keygen(context: vscode.ExtensionContext) {
  // Change this for different defaults
  // Typical e values: 3, 5, 17, 257, 65537
  // Typical k values: 1024, 2048, 3072, 4096, ...
  const k = 1024, e = 65537n;

  do {
    var p = utils.genPrime(k >> 5); // div 8 (bytes) div 2
  } while (p % e === 1n);
  
  do {
      var q = utils.genPrime(k >> 5); // div 8 (bytes) div 2
  } while (q % e === 1n && p !== q);
  
  let n = p * q;
  let totient = (p - 1n) * (q - 1n);
  let d = utils.modInv(e, totient);

  vscode.window.showInformationMessage(`Certificate keys updated!\nn: ${n.toString(10)}\ne: ${e.toString(16)}\nd: ${d.toString(10)}`);
  
  var store = context.globalState;
  store.update("certgen.key.n", n.toString());
  store.update("certgen.key.e", e.toString());
  store.update("certgen.key.d", d.toString());
  store.setKeysForSync(["certgen.key.n", "certgen.key.e", "certgen.key.d"]);
}
