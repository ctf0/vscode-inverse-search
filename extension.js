const vscode = require('vscode')
const escapeStringRegexp = require('escape-string-regexp')
const PACKAGE_NAME = 'inverseSearch'

let config = {}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    await readConfig()

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(PACKAGE_NAME)) {
            await readConfig()
        }
    })

    context.subscriptions.push(vscode.commands.registerCommand('inverse.search', doStuff))
}

async function doStuff(e) {
    let searchFor = await vscode.window.showInputBox({
        placeHolder : 'ignore...',
        value       : await vscode.env.clipboard.readText() || '',
        validateInput(v) {
            if (!v) {
                return 'you have to add something'
            } else {
                return ''
            }
        }
    })

    let editor = vscode.window.activeTextEditor

    if (searchFor && editor) {
        let {document} = editor
        let text = document.getText()
        let arr = []
        let prev = new vscode.Position(0, 0)
        let regex = new RegExp(escapeStringRegexp(searchFor), 'gm')

        text.replace(regex, (match, offset) => {
            arr.push(
                new vscode.Selection(
                    prev,
                    document.positionAt(offset)
                )
            )

            prev = document.positionAt(offset + match.length)
        })

        // end of document
        arr.push(
            new vscode.Selection(
                prev,
                new vscode.Position(document.lineCount, text.length)
            )
        )

        if (!config.includeStart) {
            arr.shift()
        }

        if (!config.includeEnd) {
            arr.pop()
        }

        if (arr.length) {
            return editor.selections = arr
        } else {
            vscode.window.showInformationMessage('Inverse Search: Nothing Found !')
        }
    }
}

async function readConfig() {
    return config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
