let cbId = 0
const cbMap = new Map()

let onmessageLoaded = false
const setupOnmessage = () => {
  if (onmessageLoaded) return

  document.addEventListener('message', (e) => {
    const data = (e as MessageEvent).data
    if (typeof data === 'string') {
      try {
        const dataObj = JSON.parse(data)
        const type = dataObj.type
        if (type !== 'react-native-webview') return

        const cbId = dataObj.cbId
        const result = dataObj.data
        const cb = cbMap.get(cbId)
        cbMap.delete(cbId)
        if (dataObj.resultType === 'resolve') {
          cb.resolve(result)
        } else {
          try {
            if (result) {
              cb.reject(result)
            } else {
              cb.reject({})
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            cb.reject(result)
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }
  })

  onmessageLoaded = true
}

const registerCallback = <T>(resolve: (value: T) => void, reject: (reason?: any) => void) => {
  const id = `jsCallBack${cbId++}`
  cbMap.set(id, { resolve, reject })
  return id
}

function invoke(method: string, params?: any) {
  // @ts-ignore
  window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }))
}

function invokeWithResult<T>(method: string, params?: any) {
  setupOnmessage()
  return new Promise<T>((resolve, reject) => {
    // if (isReady()) {
    const cbId = registerCallback(resolve, reject)
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify({ method, params, cbId }))
    // } else {
    // reject('jsBridge is not ready')
    // }
  })
}

export const reactNativeBridge = {
  test: () => invoke('test', '鸽鸽'),
  testResult: () => invokeWithResult('test', '鸽鸽'),
}
