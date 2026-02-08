// Centralized localStorage persistence for the Unix terminal app
// All storage keys are namespaced to avoid collisions

const PREFIX = 'unix-terminal:'

const KEYS = {
  FILE_SYSTEM: PREFIX + 'fileSystem',
  CURRENT_PATH: PREFIX + 'currentPath',
  CURRENT_SESSION: PREFIX + 'currentSession',
  THEME: PREFIX + 'theme',
  COMMAND_HISTORY: PREFIX + 'commandHistory',
}

// Check if localStorage is available (handles private browsing, disabled storage)
function storageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

const canUseStorage = storageAvailable()

function getItem(key) {
  if (!canUseStorage) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setItem(key, value) {
  if (!canUseStorage) return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage full — silently fail
  }
}

function removeAllKeys() {
  if (!canUseStorage) return
  Object.values(KEYS).forEach(key => {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  })
}

// ============== File System ==============

export function loadFileSystem() {
  const raw = getItem(KEYS.FILE_SYSTEM)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveFileSystem(fsObject) {
  setItem(KEYS.FILE_SYSTEM, JSON.stringify(fsObject))
}

// ============== Current Path ==============

export function loadCurrentPath() {
  return getItem(KEYS.CURRENT_PATH) || null
}

export function saveCurrentPath(path) {
  setItem(KEYS.CURRENT_PATH, path)
}

// ============== Current Session ==============

export function loadCurrentSession() {
  const raw = getItem(KEYS.CURRENT_SESSION)
  if (raw === null) return null
  const num = parseInt(raw, 10)
  return (num >= 0 && num <= 5) ? num : null
}

export function saveCurrentSession(session) {
  setItem(KEYS.CURRENT_SESSION, String(session))
}

// ============== Theme ==============

export function loadTheme() {
  const raw = getItem(KEYS.THEME)
  return (raw === 'dark' || raw === 'light') ? raw : null
}

export function saveTheme(theme) {
  setItem(KEYS.THEME, theme)
}

// ============== Command History ==============

export function loadCommandHistory() {
  const raw = getItem(KEYS.COMMAND_HISTORY)
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : null
  } catch {
    return null
  }
}

export function saveCommandHistory(history) {
  // Cap at 500 entries to prevent localStorage bloat
  const trimmed = history.slice(-500)
  setItem(KEYS.COMMAND_HISTORY, JSON.stringify(trimmed))
}

// ============== Reset ==============

export function resetAll() {
  removeAllKeys()
}
