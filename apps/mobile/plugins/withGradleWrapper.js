/**
 * Plugin: withGradleWrapper
 * Fija la versión de Gradle a 8.6 para compatibilidad con React Native 0.74.x
 * (Gradle 8.8+ removió serviceOf de org.gradle.configurationcache.extensions)
 */
const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const GRADLE_VERSION = '8.6'
const GRADLE_URL = `https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip`

module.exports = function withGradleWrapper(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const wrapperPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      )

      if (!fs.existsSync(wrapperPath)) {
        console.warn('[withGradleWrapper] No se encontró gradle-wrapper.properties')
        return config
      }

      let content = fs.readFileSync(wrapperPath, 'utf-8')

      // Reemplaza cualquier versión de Gradle por 8.6
      content = content.replace(
        /distributionUrl=.*gradle-.*\.zip/,
        `distributionUrl=${GRADLE_URL}`
      )

      fs.writeFileSync(wrapperPath, content)

      // Gradle 8.6 tiene un bug en expo-modules-autolinking: desactivar configuration cache
      const graPropsPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle.properties'
      )
      if (fs.existsSync(graPropsPath)) {
        let props = fs.readFileSync(graPropsPath, 'utf-8')
        if (!props.includes('org.gradle.configuration-cache=false')) {
          props += '\norg.gradle.configuration-cache=false\n'
          fs.writeFileSync(graPropsPath, props, 'utf-8')
        }
      }

      console.log(`[withGradleWrapper] ✓ Gradle ${GRADLE_VERSION} + configuration-cache disabled`)

      return config
    },
  ])
}
