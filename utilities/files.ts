import FileSaver from 'file-saver'

export function saveAsFile(text: string, name = '') {
  try {
    const data = new Blob([text], { type: 'text/plain;charset=utf-8' })

    FileSaver.saveAs(data, `${name}.txt`)
  } catch (err) {
    console.error('saveAsFile has error:', err.message)
  }
}
