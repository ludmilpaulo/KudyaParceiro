/**
 * Downloads the EAS-managed Android upload keystore for local Gradle signing.
 * Does not start an EAS cloud build (no quota). Writes gitignored files only.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const statePath = join(homedir(), '.expo', 'state.json')
const state = JSON.parse(readFileSync(statePath, 'utf8'))
const sessionSecret = state?.auth?.sessionSecret
if (!sessionSecret) {
  throw new Error('No Expo session in ~/.expo/state.json — run npx eas-cli whoami')
}

const fullName = process.argv[2] ?? '@ludmil/kudya-parceiro'

const query = `
query AndroidKeystore($fullName: String!) {
  app {
    byFullName(fullName: $fullName) {
      id
      name
      androidAppCredentials {
        id
        applicationIdentifier
        androidAppBuildCredentialsList {
          name
          isDefault
          androidKeystore {
            id
            keyAlias
            keystorePassword
            keyPassword
            keystore
            sha1CertificateFingerprint
          }
        }
      }
    }
  }
}`

const res = await fetch('https://api.expo.dev/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'expo-session': sessionSecret,
  },
  body: JSON.stringify({ query, variables: { fullName } }),
})

const json = await res.json()
if (json.errors) {
  console.error(JSON.stringify(json.errors, null, 2))
  process.exit(1)
}

const app = json.data?.app?.byFullName
const creds = app?.androidAppCredentials
const credList = Array.isArray(creds) ? creds : creds ? [creds] : []
const builds = credList.flatMap((c) => c?.androidAppBuildCredentialsList ?? [])
const chosen = builds.find((b) => b?.isDefault && b?.androidKeystore) ?? builds.find((b) => b?.androidKeystore)
const ks = chosen?.androidKeystore
if (!ks?.keystore) {
  console.error('No android keystore on EAS for', fullName)
  process.exit(1)
}

const keystoresDir = join(projectRoot, 'android', 'keystores')
mkdirSync(keystoresDir, { recursive: true })
const keystorePath = join(keystoresDir, 'upload.jks')
writeFileSync(keystorePath, Buffer.from(ks.keystore, 'base64'))

const credentials = {
  android: {
    keystore: {
      keystorePath: 'android/keystores/upload.jks',
      keystorePassword: ks.keystorePassword,
      keyAlias: ks.keyAlias,
      keyPassword: ks.keyPassword,
    },
  },
}
writeFileSync(join(projectRoot, 'credentials.json'), `${JSON.stringify(credentials, null, 2)}\n`)

console.log(`Wrote keystore for ${fullName} alias=${ks.keyAlias}`)
console.log(`Files: android/keystores/upload.jks , credentials.json`)
