import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const vi = JSON.parse(readFileSync(join(__dirname, '../src/locales/vi.json'), 'utf8'))
const en = JSON.parse(readFileSync(join(__dirname, '../src/locales/en.json'), 'utf8'))

const getKeys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? getKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )

const viKeys = new Set(getKeys(vi))
const enKeys = new Set(getKeys(en))

const missingInEn = [...viKeys].filter(k => !enKeys.has(k))
const missingInVi = [...enKeys].filter(k => !viKeys.has(k))

if (missingInEn.length) console.log('Missing in en.json:', missingInEn)
if (missingInVi.length) console.log('Missing in vi.json:', missingInVi)
if (!missingInEn.length && !missingInVi.length) console.log('Key parity confirmed')

process.exit(missingInEn.length || missingInVi.length ? 1 : 0)
