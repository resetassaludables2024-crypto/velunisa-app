/**
 * Plugin: withExpoRouterCtx
 * Reemplaza process.env.EXPO_ROUTER_APP_ROOT con la cadena literal "./app"
 * en node_modules/expo-router/_ctx.android.js
 *
 * Razón: Metro bundler require expo-router/_ctx.android.js durante bundling.
 * El archivo original contiene process.env.EXPO_ROUTER_APP_ROOT que es dinámico,
 * pero require.context() necesita una cadena estática en tiempo de compilación.
 * Este plugin la reemplaza con el valor fijo "./app".
 */
const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

module.exports = function withExpoRouterCtx(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const ctxPath = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        'expo-router',
        '_ctx.android.js'
      )

      if (!fs.existsSync(ctxPath)) {
        console.warn('[withExpoRouterCtx] No se encontró:', ctxPath)
        return config
      }

      let content = fs.readFileSync(ctxPath, 'utf-8')

      // Reemplazar process.env.EXPO_ROUTER_APP_ROOT con la cadena literal "./app"
      content = content.replace(
        /process\.env\.EXPO_ROUTER_APP_ROOT/g,
        '"./app"'
      )

      fs.writeFileSync(ctxPath, content, 'utf-8')
      console.log('[withExpoRouterCtx] ✓ Reemplazado EXPO_ROUTER_APP_ROOT con "./app"')

      return config
    },
  ])
}
