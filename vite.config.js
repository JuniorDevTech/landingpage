import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function laravelApiPlugin() {
  return {
    name: 'laravel-api',
    configureServer() {
      const child = spawn(
        'php',
        ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'],
        {
          cwd: path.join(rootDir, 'backend'),
          stdio: 'inherit',
          shell: true,
          windowsHide: true,
        },
      )

      const stop = () => {
        if (!child.pid) {
          return
        }
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], {
            shell: true,
            windowsHide: true,
          })
          return
        }
        child.kill('SIGTERM')
      }

      process.once('exit', stop)
      process.once('SIGINT', stop)
      process.once('SIGTERM', stop)
    },
  }
}

export default defineConfig({
  plugins: [react(), laravelApiPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
