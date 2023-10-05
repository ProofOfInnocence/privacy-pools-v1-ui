export const copyToClipboard = (value: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let textArea: any, oldContentEditable: any, oldReadOnly: any

  function isOS() {
    return navigator.userAgent.match(/ipad|iphone/i)
  }

  function createTextArea(text: string) {
    textArea = document.createElement('textArea')
    oldContentEditable = textArea.contentEditable
    oldReadOnly = textArea.readOnly
    textArea.contentEditable = true
    textArea.readOnly = false
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
  }

  function selectText() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let range: any, selection: any

    if (isOS() != null) {
      range = document.createRange()
      range.selectNodeContents(textArea)
      selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      textArea.setSelectionRange(0, 999999)
      textArea.contentEditable = oldContentEditable
      textArea.readOnly = oldReadOnly
    } else {
      textArea.select()
    }
  }

  function copyClipboard() {
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  createTextArea(value)
  selectText()
  copyClipboard()
}
