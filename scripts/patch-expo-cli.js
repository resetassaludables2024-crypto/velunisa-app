#!/usr/bin/env node
/**
 * patch-expo-cli.js
 *
 * Fix: TypeError: Body is unusable: Body has already been read
 * Causa: @expo/cli wrapFetchWithCache llama response.body.tee() que consume el
 *        stream undici antes de que response.json() lo lea (incompatibilidad Node.js 24).
 * Solución: skipCache: true en getNativeModuleVersionsAsync + try-catch de seguridad.
 */

const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/@expo/cli/build/src/api/getNativeModuleVersions.js'
);

if (!fs.existsSync(target)) {
  console.log('[patch-expo-cli] Archivo no encontrado, omitiendo:', target);
  process.exit(0);
}

const original = fs.readFileSync(target, 'utf8');

// Si ya está parcheado, no hacer nada
if (original.includes('skipCache: true')) {
  console.log('[patch-expo-cli] Ya está parcheado ✓');
  process.exit(0);
}

const patched = original.replace(
  `async function getNativeModuleVersionsAsync(sdkVersion) {
    const fetchAsync = (0, _client.createCachedFetch)({
        cacheDirectory: 'native-modules-cache',
        // 1 minute cache
        ttl: 1000 * 60
    });
    const response = await fetchAsync(\`sdks/\${sdkVersion}/native-modules\`);
    if (!response.ok) {
        throw new _errors.CommandError('API', \`Unexpected response when fetching version info from Expo servers: \${response.statusText}.\`);
    }
    const json = await response.json();
    const data = (0, _client.getResponseDataOrThrow)(json);
    if (!data.length) {
        throw new _errors.CommandError('VERSIONS', 'The bundled native module list from the Expo API is empty');
    }
    return fromBundledNativeModuleList(data);
}`,
  `async function getNativeModuleVersionsAsync(sdkVersion) {
    // skipCache: true — evita wrapFetchWithCache que llama response.body.tee()
    // consumiendo el stream undici antes de que response.json() pueda leerlo (Node.js 24).
    const fetchAsync = (0, _client.createCachedFetch)({
        cacheDirectory: 'native-modules-cache',
        ttl: 1000 * 60,
        skipCache: true
    });
    try {
        const response = await fetchAsync(\`sdks/\${sdkVersion}/native-modules\`);
        if (!response.ok) {
            throw new _errors.CommandError('API', \`Unexpected response when fetching version info from Expo servers: \${response.statusText}.\`);
        }
        const json = await response.json();
        const data = (0, _client.getResponseDataOrThrow)(json);
        if (!data.length) {
            throw new _errors.CommandError('VERSIONS', 'The bundled native module list from the Expo API is empty');
        }
        return fromBundledNativeModuleList(data);
    } catch (error) {
        if (error && error.message && (error.message.includes('Body has already been read') || error.message.includes('Body is unusable'))) {
            return {};
        }
        throw error;
    }
}`
);

if (patched === original) {
  console.log('[patch-expo-cli] ADVERTENCIA: No se encontró el patrón a reemplazar. La versión de @expo/cli puede haber cambiado.');
  process.exit(0);
}

fs.writeFileSync(target, patched, 'utf8');
console.log('[patch-expo-cli] Parcheado exitosamente ✓');
