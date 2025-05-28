let cbId = 0
const cbMap = new Map()

const registerCallback = <T>(resolve: (value: T) => void, reject: (reason?: any) => void) => {
  const id = `jsCallBack${cbId++}`
  cbMap.set(id, { resolve, reject })

  const onmessage = (e: Event) => {
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
        document.removeEventListener('message', onmessage)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }
  }
  document.addEventListener('message', onmessage)

  return id
}

function invoke(method: string, params?: any) {
  // @ts-ignore
  window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }))
}

function invokeWithResult<T>(method: string, params?: any) {
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
