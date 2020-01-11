const vscode = require('vscode')
const escapeStringRegexp = require('escape-string-regexp')

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('inverse.search', async () => {
            let searchFor = await vscode.window.showInputBox({
                placeHolder: 'ignore...',
                value: await vscode.env.clipboard.readText() || '',
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
                let { document } = editor
                let text = document.getText()
                let arr = []
                let prev = new vscode.Position(0, 0)

                text.replace(new RegExp(escapeStringRegexp(searchFor), 'gm'), (match, offset) => {
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

                if (arr.length) {
                    return editor.selections = arr
                } else {
                    vscode.window.showInformationMessage('Inverse Search: Nothing Found !')
                }
            }
        })
    )
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}