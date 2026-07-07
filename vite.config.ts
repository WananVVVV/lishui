import { resolve } from 'node:path'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  const tagMatcherProxyPrefix =
    env.VITE_TAG_MATCHER_PROXY_PREFIX || '/tagmatcher-api'
  const tagMatcherProxyTarget =
    env.VITE_TAG_MATCHER_PROXY_TARGET || 'http://192.168.2.138:8001'

  return {
    base: env.VITE_APP_CONTEXT_PATH,
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: './src/auto-import.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: './src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      open: false,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://empower-dev.tech.skytech.io/se/yyg-aqjc-api',
          // target: 'http://192.168.2.182:10020/se/yyg-aqjc-api',
          changeOrigin: true,
          ws: true,
          rewrite: (path) =>
            path.replace(new RegExp('^' + env.VITE_APP_BASE_API), ''),
        },
        '/agent': {
          target: 'http://empower-dev.tech.skytech.io',
          changeOrigin: true,
          ws: true,
        },
        [tagMatcherProxyPrefix]: {
          target: tagMatcherProxyTarget,
          changeOrigin: true,
          ws: true,
          rewrite: (path) =>
            path.replace(new RegExp('^' + tagMatcherProxyPrefix), ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'lib'
            }
          },
        },
      },
      terserOptions: {
        compress: {
          drop_debugger: true,
        },
      },
      outDir: 'dist/city-safety-admin-front',
      emptyOutDir: true,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000,
      target: 'es2022',
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`,
        },
      },
    },
  }
})
