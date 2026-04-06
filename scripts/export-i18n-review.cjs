#!/usr/bin/env node
// export-i18n-review.cjs
// Generates a 4-column CSV for Google Sheet reviewer workflow.
// Usage: node scripts/export-i18n-review.cjs > review.csv

'use strict'

const path = require('path')
const vi = require(path.join(__dirname, '../src/locales/vi.json'))
const en = require(path.join(__dirname, '../src/locales/en.json'))

// Flatten a nested JSON object into dot-notation key → value map
function flattenObject(obj, prefix) {
  prefix = prefix || ''
  return Object.keys(obj).reduce(function (acc, k) {
    const fullKey = prefix ? prefix + '.' + k : k
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], fullKey))
    } else {
      acc[fullKey] = obj[k]
    }
    return acc
  }, {})
}

// Escape a single CSV field value
function csvField(value) {
  if (value === undefined || value === null) return ''
  const s = String(value)
  // Wrap in double quotes if value contains comma, double quote, or newline
  if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

// Build a CSV row from an array of field values
function csvRow(fields) {
  return fields.map(csvField).join(',')
}

const viFlat = flattenObject(vi)
const enFlat = flattenObject(en)

// Namespace order as defined in the plan
const NAMESPACE_ORDER = [
  'common', 'auth', 'onboarding', 'recipes', 'units',
  'suppliers', 'ingredients', 'errors', 'invoices', 'landing',
  'revenue', 'nav', 'dashboard', 'vat'
]

const VAT_ACCOUNTING_NOTE = 'Vui lòng xác nhận đây là thuật ngữ kế toán đúng theo quy định Việt Nam'

const lines = []

// Header row
lines.push(csvRow(['Key', 'English', 'Current Vietnamese', 'Suggested correction']))

// Group keys by top-level namespace
function getNamespace(key) {
  return key.split('.')[0]
}

// Collect all keys, organised by namespace
const keysByNamespace = {}
NAMESPACE_ORDER.forEach(function (ns) {
  keysByNamespace[ns] = []
})

// Add keys from both locales, union
const allKeys = new Set(Object.keys(enFlat).concat(Object.keys(viFlat)))
allKeys.forEach(function (key) {
  const ns = getNamespace(key)
  if (!keysByNamespace[ns]) {
    keysByNamespace[ns] = []
  }
  if (keysByNamespace[ns].indexOf(key) === -1) {
    keysByNamespace[ns].push(key)
  }
})

// Determine output namespace order: NAMESPACE_ORDER first, then any extra namespaces
const extraNamespaces = Object.keys(keysByNamespace).filter(function (ns) {
  return NAMESPACE_ORDER.indexOf(ns) === -1 && keysByNamespace[ns].length > 0
})
const outputOrder = NAMESPACE_ORDER.concat(extraNamespaces)

outputOrder.forEach(function (ns) {
  const keys = keysByNamespace[ns]
  if (!keys || keys.length === 0) return

  // Blank separator row then namespace header row
  lines.push('')
  lines.push(csvRow(['=== ' + ns + ' ===', '', '', '']))

  keys.sort()
  keys.forEach(function (key) {
    const enVal = enFlat[key] !== undefined ? enFlat[key] : ''
    const viVal = viFlat[key] !== undefined ? viFlat[key] : ''

    const isVatKey = getNamespace(key) === 'vat'
    if (isVatKey) {
      // 5-column row for VAT keys: add accounting note in 5th column
      lines.push(csvRow([key, enVal, viVal, '', VAT_ACCOUNTING_NOTE]))
    } else {
      lines.push(csvRow([key, enVal, viVal, '']))
    }
  })
})

console.log(lines.join('\n'))
