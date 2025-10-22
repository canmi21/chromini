/* src/vite-env.d.ts */

declare module '*.css'

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}
