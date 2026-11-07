import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

const cred = JSON.parse(readFileSync('credentials.json', 'utf8')).android.keystore
copyFileSync(cred.keystorePath, 'android/app/upload.jks')

const gp = readFileSync('android/gradle.properties', 'utf8')
if (!gp.includes('MYAPP_UPLOAD_STORE_FILE')) {
  writeFileSync(
    'android/gradle.properties',
    `${gp.trimEnd()}
MYAPP_UPLOAD_STORE_FILE=upload.jks
MYAPP_UPLOAD_KEY_ALIAS=${cred.keyAlias}
MYAPP_UPLOAD_STORE_PASSWORD=${cred.keystorePassword}
MYAPP_UPLOAD_KEY_PASSWORD=${cred.keyPassword}
`
  )
}

let gradle = readFileSync('android/app/build.gradle', 'utf8')
if (!gradle.includes('MYAPP_UPLOAD_STORE_FILE')) {
  gradle = gradle.replace(
    `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`,
    `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }`
  )
  gradle = gradle.replace(
    `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`,
    '            signingConfig signingConfigs.release'
  )
  writeFileSync('android/app/build.gradle', gradle)
}

const version = gradle.match(/versionCode \d+[\s\S]{0,80}versionName "[^"]+"/)
console.log(version ? version[0].replace(/\s+/g, ' ') : 'version not found')
console.log(gradle.includes('signingConfigs.release') ? 'release signingConfig set' : 'FAILED to set release signing')
