export default async function loadAs(funcName, accept, multiple) {
  if (!['ArrayBuffer', 'BinaryString', 'DataURL', 'Text'].includes(funcName)) {
    throw Error('funcName should be one of the ArrayBuffer, BinaryString, DataURL, or Text')
  }

  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = accept
    fileInput.multiple = multiple
    fileInput.click()
    fileInput.addEventListener('change', e => {
      resolve(
        Promise.all([...e.target.files].map(file => {
          return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.addEventListener('load', e => {
              resolve(e.target.result)
            })
            fileReader['readAs'+funcName](file)
          })
        }))
        .then(result => {
          if (multiple) return result
          else return result[0]
        })
      )
    })
  })
}

export async function loadAsArrayBuffer(accept, multiple) {
  return loadAs('ArrayBuffer', accept, multiple)
}

export async function loadAsBinaryString(accept, multiple) {
  return loadAs('BinaryString', accept, multiple)
}

export async function loadAsDataURL(accept, multiple) {
  return loadAs('DataURL', accept, multiple)
}

export async function loadAsText(accept, multiple) {
  return loadAs('Text', accept, multiple)
}

loadAs.ArrayBuffer = loadAsArrayBuffer
loadAs.BinaryString = loadAsBinaryString
loadAs.DataURL = loadAsDataURL
loadAs.Text = loadAsText