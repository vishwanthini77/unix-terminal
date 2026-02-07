import { getDirectory, getNode, resolvePath, isDirectory, pathExists, addNode, removeNode, getParentPath } from './fileSystem'

// Command registry
const commands = {
  // Navigation
  pwd: cmdPwd,
  ls: cmdLs,
  cd: cmdCd,
  // File Operations
  cat: cmdCat,
  head: cmdHead,
  tail: cmdTail,
  less: cmdLess,
  touch: cmdTouch,
  mkdir: cmdMkdir,
  rm: cmdRm,
  cp: cmdCp,
  mv: cmdMv,
  // Search & Text
  grep: cmdGrep,
  find: cmdFind,
  wc: cmdWc,
  echo: cmdEcho,
  // System Info
  whoami: cmdWhoami,
  ps: cmdPs,
  kill: cmdKill,
  df: cmdDf,
  du: cmdDu,
  uname: cmdUname,
  uptime: cmdUptime,
  // Permissions
  chmod: cmdChmod,
  chown: cmdChown,
  // Utilities
  date: cmdDate,
  history: cmdHistory,
  clear: cmdClear,
  help: cmdHelp,
  lesson: cmdLesson,
}

// Command history storage (shared with Terminal.jsx via export)
export const commandHistory = []

// Execute a command and return the result
export function executeCommand(input, currentPath, context = {}) {
  const parts = parseCommand(input.trim())
  const cmd = parts[0]?.toLowerCase()
  const args = parts.slice(1)

  if (!cmd) {
    return { output: '', newPath: null }
  }

  if (commands[cmd]) {
    return commands[cmd](args, currentPath, context)
  }

  return {
    output: `\x1b[31m${cmd}: command not found\x1b[0m\r\nType \x1b[32mhelp\x1b[0m to see available commands.`,
    newPath: null
  }
}

// Parse command handling quotes
function parseCommand(input) {
  const parts = []
  let current = ''
  let inQuote = false
  let quoteChar = ''
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    
    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true
      quoteChar = char
    } else if (char === quoteChar && inQuote) {
      inQuote = false
      quoteChar = ''
    } else if (char === ' ' && !inQuote) {
      if (current) {
        parts.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }
  
  if (current) {
    parts.push(current)
  }
  
  return parts
}

// ============== NAVIGATION ==============

// PWD - Print Working Directory
function cmdPwd(args, currentPath) {
  return { output: currentPath, newPath: null }
}

// LS - List directory contents
function cmdLs(args, currentPath) {
  let targetPath = currentPath
  let showHidden = false
  let showLong = false
  
  for (const arg of args) {
    if (arg === '-a' || arg === '-la' || arg === '-al') showHidden = true
    if (arg === '-l' || arg === '-la' || arg === '-al') showLong = true
    if (!arg.startsWith('-')) targetPath = resolvePath(currentPath, arg)
  }
  
  const contents = getDirectory(targetPath)
  
  if (contents === null) {
    const node = getNode(targetPath)
    if (node && node.type === 'file') {
      return { output: targetPath.split('/').pop(), newPath: null }
    }
    return {
      output: `\x1b[31mls: cannot access '${args[0] || targetPath}': No such file or directory\x1b[0m`,
      newPath: null
    }
  }
  
  let entries = Object.keys(contents)
  if (!showHidden) entries = entries.filter(name => !name.startsWith('.'))
  if (entries.length === 0) return { output: '', newPath: null }
  
  entries.sort((a, b) => {
    const aIsDir = contents[a].type === 'directory'
    const bIsDir = contents[b].type === 'directory'
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    return a.localeCompare(b)
  })
  
  if (showLong) {
    const lines = entries.map(name => {
      const node = contents[name]
      const isDir = node.type === 'directory'
      const perms = node.permissions || (isDir ? 'drwxr-xr-x' : '-rw-r--r--')
      const owner = node.owner || 'user'
      const group = node.group || 'user'
      const size = isDir ? '4096' : (node.content?.length || 0).toString().padStart(5)
      const date = 'Jan 31 10:00'
      const coloredName = isDir ? `\x1b[34m${name}\x1b[0m` : name
      return `${perms}  1 ${owner} ${group} ${size} ${date} ${coloredName}`
    })
    return { output: lines.join('\r\n'), newPath: null }
  } else {
    const coloredEntries = entries.map(name => {
      const isDir = contents[name].type === 'directory'
      return isDir ? `\x1b[34m${name}\x1b[0m` : name
    })
    return { output: coloredEntries.join('  '), newPath: null }
  }
}

// CD - Change Directory
function cmdCd(args, currentPath) {
  if (args.length === 0 || args[0] === '~') {
    return { output: '', newPath: '/home/user' }
  }
  
  const targetPath = resolvePath(currentPath, args[0])
  
  if (!pathExists(targetPath)) {
    return { output: `\x1b[31mcd: ${args[0]}: No such file or directory\x1b[0m`, newPath: null }
  }
  
  if (!isDirectory(targetPath)) {
    return { output: `\x1b[31mcd: ${args[0]}: Not a directory\x1b[0m`, newPath: null }
  }
  
  return { output: '', newPath: targetPath }
}

// ============== FILE OPERATIONS ==============

// CAT - Display file contents
function cmdCat(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mcat: missing file operand\x1b[0m', newPath: null }
  }
  
  const results = []
  for (const arg of args) {
    if (arg.startsWith('-')) continue
    const targetPath = resolvePath(currentPath, arg)
    const node = getNode(targetPath)
    
    if (!node) {
      results.push(`\x1b[31mcat: ${arg}: No such file or directory\x1b[0m`)
      continue
    }
    if (node.type === 'directory') {
      results.push(`\x1b[31mcat: ${arg}: Is a directory\x1b[0m`)
      continue
    }
    results.push((node.content || '').replace(/\n/g, '\r\n'))
  }
  return { output: results.join('\r\n'), newPath: null }
}

// HEAD - Show first lines
function cmdHead(args, currentPath) {
  let lines = 10
  let targetFile = null
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) {
      lines = parseInt(args[i + 1]) || 10
      i++
    } else if (!args[i].startsWith('-')) {
      targetFile = args[i]
    }
  }
  
  if (!targetFile) {
    return { output: '\x1b[31mhead: missing file operand\x1b[0m', newPath: null }
  }
  
  const targetPath = resolvePath(currentPath, targetFile)
  const node = getNode(targetPath)
  
  if (!node) return { output: `\x1b[31mhead: ${targetFile}: No such file or directory\x1b[0m`, newPath: null }
  if (node.type === 'directory') return { output: `\x1b[31mhead: ${targetFile}: Is a directory\x1b[0m`, newPath: null }
  
  const allLines = (node.content || '').split('\n')
  return { output: allLines.slice(0, lines).join('\r\n'), newPath: null }
}

// TAIL - Show last lines
function cmdTail(args, currentPath) {
  let lines = 10
  let targetFile = null
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && args[i + 1]) {
      lines = parseInt(args[i + 1]) || 10
      i++
    } else if (!args[i].startsWith('-')) {
      targetFile = args[i]
    }
  }
  
  if (!targetFile) {
    return { output: '\x1b[31mtail: missing file operand\x1b[0m', newPath: null }
  }
  
  const targetPath = resolvePath(currentPath, targetFile)
  const node = getNode(targetPath)
  
  if (!node) return { output: `\x1b[31mtail: ${targetFile}: No such file or directory\x1b[0m`, newPath: null }
  if (node.type === 'directory') return { output: `\x1b[31mtail: ${targetFile}: Is a directory\x1b[0m`, newPath: null }
  
  const allLines = (node.content || '').split('\n')
  return { output: allLines.slice(-lines).join('\r\n'), newPath: null }
}

// LESS - View file (simplified)
function cmdLess(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mless: missing file operand\x1b[0m', newPath: null }
  }
  
  const targetPath = resolvePath(currentPath, args[0])
  const node = getNode(targetPath)
  
  if (!node) return { output: `\x1b[31mless: ${args[0]}: No such file or directory\x1b[0m`, newPath: null }
  if (node.type === 'directory') return { output: `\x1b[31mless: ${args[0]}: Is a directory\x1b[0m`, newPath: null }
  
  const content = (node.content || '').replace(/\n/g, '\r\n')
  return { output: content + '\r\n\x1b[7m(END)\x1b[0m', newPath: null }
}

// TOUCH - Create file
function cmdTouch(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mtouch: missing file operand\x1b[0m', newPath: null }
  }
  
  const results = []
  for (const arg of args) {
    if (arg.startsWith('-')) continue
    const targetPath = resolvePath(currentPath, arg)
    
    if (pathExists(targetPath)) continue
    
    const parentPath = getParentPath(targetPath)
    if (!pathExists(parentPath)) {
      results.push(`\x1b[31mtouch: cannot touch '${arg}': No such file or directory\x1b[0m`)
      continue
    }
    addNode(targetPath, { type: 'file', content: '' })
  }
  return { output: results.join('\r\n'), newPath: null }
}

// MKDIR - Create directory
function cmdMkdir(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mmkdir: missing operand\x1b[0m', newPath: null }
  }
  
  const results = []
  for (const arg of args) {
    if (arg.startsWith('-')) continue
    const targetPath = resolvePath(currentPath, arg)
    
    if (pathExists(targetPath)) {
      results.push(`\x1b[31mmkdir: cannot create directory '${arg}': File exists\x1b[0m`)
      continue
    }
    
    const parentPath = getParentPath(targetPath)
    if (!pathExists(parentPath)) {
      results.push(`\x1b[31mmkdir: cannot create directory '${arg}': No such file or directory\x1b[0m`)
      continue
    }
    addNode(targetPath, { type: 'directory', children: {} })
  }
  return { output: results.join('\r\n'), newPath: null }
}

// RM - Remove
function cmdRm(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mrm: missing operand\x1b[0m', newPath: null }
  }
  
  let recursive = false
  const targets = []
  
  for (const arg of args) {
    if (arg === '-r' || arg === '-rf' || arg === '-R') recursive = true
    else if (!arg.startsWith('-')) targets.push(arg)
  }
  
  if (targets.length === 0) {
    return { output: '\x1b[31mrm: missing operand\x1b[0m', newPath: null }
  }
  
  const results = []
  const protectedPaths = ['/home', '/home/user', '/', '/etc', '/var']
  
  for (const target of targets) {
    const targetPath = resolvePath(currentPath, target)
    
    if (!pathExists(targetPath)) {
      results.push(`\x1b[31mrm: cannot remove '${target}': No such file or directory\x1b[0m`)
      continue
    }
    if (isDirectory(targetPath) && !recursive) {
      results.push(`\x1b[31mrm: cannot remove '${target}': Is a directory\x1b[0m`)
      continue
    }
    if (protectedPaths.includes(targetPath)) {
      results.push(`\x1b[31mrm: cannot remove '${target}': Permission denied\x1b[0m`)
      continue
    }
    removeNode(targetPath)
  }
  return { output: results.join('\r\n'), newPath: null }
}

// CP - Copy
function cmdCp(args, currentPath) {
  if (args.length < 2) {
    return { output: '\x1b[31mcp: missing file operand\x1b[0m', newPath: null }
  }
  
  const source = args[0]
  const dest = args[1]
  const sourcePath = resolvePath(currentPath, source)
  const destPath = resolvePath(currentPath, dest)
  
  const node = getNode(sourcePath)
  if (!node) {
    return { output: `\x1b[31mcp: cannot stat '${source}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  if (node.type === 'directory') {
    return { output: `\x1b[31mcp: -r not specified; omitting directory '${source}'\x1b[0m`, newPath: null }
  }
  
  const destNode = getNode(destPath)
  let finalPath = destPath
  
  if (destNode && destNode.type === 'directory') {
    const filename = sourcePath.split('/').pop()
    finalPath = destPath + '/' + filename
  }
  
  const parentPath = getParentPath(finalPath)
  if (!pathExists(parentPath)) {
    return { output: `\x1b[31mcp: cannot create '${dest}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  addNode(finalPath, { type: 'file', content: node.content || '' })
  return { output: '', newPath: null }
}

// MV - Move
function cmdMv(args, currentPath) {
  if (args.length < 2) {
    return { output: '\x1b[31mmv: missing file operand\x1b[0m', newPath: null }
  }
  
  const source = args[0]
  const dest = args[1]
  const sourcePath = resolvePath(currentPath, source)
  const destPath = resolvePath(currentPath, dest)
  
  const node = getNode(sourcePath)
  if (!node) {
    return { output: `\x1b[31mmv: cannot stat '${source}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  const destNode = getNode(destPath)
  let finalPath = destPath
  
  if (destNode && destNode.type === 'directory') {
    const filename = sourcePath.split('/').pop()
    finalPath = destPath + '/' + filename
  }
  
  const parentPath = getParentPath(finalPath)
  if (!pathExists(parentPath)) {
    return { output: `\x1b[31mmv: cannot move '${source}' to '${dest}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  // Copy then remove
  if (node.type === 'directory') {
    addNode(finalPath, { type: 'directory', children: { ...node.children } })
  } else {
    addNode(finalPath, { type: 'file', content: node.content || '' })
  }
  removeNode(sourcePath)
  
  return { output: '', newPath: null }
}

// ============== SEARCH & TEXT ==============

// GREP - Search pattern
function cmdGrep(args, currentPath) {
  if (args.length < 2) {
    return { output: '\x1b[31mgrep: usage: grep <pattern> <file>\x1b[0m', newPath: null }
  }
  
  const pattern = args[0]
  const targetFile = args[1]
  const targetPath = resolvePath(currentPath, targetFile)
  const node = getNode(targetPath)
  
  if (!node) return { output: `\x1b[31mgrep: ${targetFile}: No such file or directory\x1b[0m`, newPath: null }
  if (node.type === 'directory') return { output: `\x1b[31mgrep: ${targetFile}: Is a directory\x1b[0m`, newPath: null }
  
  const lines = (node.content || '').split('\n')
  const matches = lines.filter(line => line.includes(pattern))
  
  if (matches.length === 0) return { output: '', newPath: null }
  
  const highlighted = matches.map(line => 
    line.replace(new RegExp(pattern, 'g'), `\x1b[31m${pattern}\x1b[0m`)
  )
  return { output: highlighted.join('\r\n'), newPath: null }
}

// FIND - Find files
function cmdFind(args, currentPath) {
  let searchPath = currentPath
  let namePattern = null
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-name' && args[i + 1]) {
      namePattern = args[i + 1].replace(/\*/g, '.*')
      i++
    } else if (!args[i].startsWith('-')) {
      searchPath = resolvePath(currentPath, args[i])
    }
  }
  
  const results = []
  
  function searchDir(path) {
    const contents = getDirectory(path)
    if (!contents) return
    
    for (const name of Object.keys(contents)) {
      const fullPath = path === '/' ? `/${name}` : `${path}/${name}`
      
      if (!namePattern || new RegExp(namePattern).test(name)) {
        results.push(fullPath)
      }
      
      if (contents[name].type === 'directory') {
        searchDir(fullPath)
      }
    }
  }
  
  searchDir(searchPath)
  return { output: results.join('\r\n'), newPath: null }
}

// WC - Word count
function cmdWc(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mwc: missing file operand\x1b[0m', newPath: null }
  }
  
  const results = []
  for (const arg of args) {
    if (arg.startsWith('-')) continue
    
    const targetPath = resolvePath(currentPath, arg)
    const node = getNode(targetPath)
    
    if (!node) {
      results.push(`\x1b[31mwc: ${arg}: No such file or directory\x1b[0m`)
      continue
    }
    if (node.type === 'directory') {
      results.push(`\x1b[31mwc: ${arg}: Is a directory\x1b[0m`)
      continue
    }
    
    const content = node.content || ''
    const lines = content.split('\n').length
    const words = content.split(/\s+/).filter(w => w.length > 0).length
    const chars = content.length
    
    results.push(`  ${lines}\t${words}\t${chars}\t${arg}`)
  }
  return { output: results.join('\r\n'), newPath: null }
}

// ECHO - Print text
function cmdEcho(args, currentPath) {
  return { output: args.join(' '), newPath: null }
}

// ============== SYSTEM INFO ==============

// WHOAMI - Current user
function cmdWhoami(args, currentPath) {
  return { output: 'user', newPath: null }
}

// PS - Process list
function cmdPs(args, currentPath) {
  const processes = [
    '  PID TTY          TIME CMD',
    '    1 ?        00:00:01 systemd',
    '  234 ?        00:00:00 sshd',
    '  456 ?        00:00:02 nginx',
    '  789 pts/0    00:00:00 bash',
    ' 1024 pts/0    00:00:00 ps',
  ]
  
  if (args.includes('aux') || args.includes('-aux')) {
    const auxProcesses = [
      'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
      'root         1  0.0  0.1 169836 13256 ?        Ss   09:00   0:01 /sbin/init',
      'root       234  0.0  0.0  15852  1024 ?        Ss   09:00   0:00 /usr/sbin/sshd',
      'www-data   456  0.1  0.2  55896  4532 ?        S    09:01   0:02 nginx: worker',
      'user       789  0.0  0.1  23456  2048 pts/0    Ss   09:05   0:00 -bash',
      'user      1024  0.0  0.0  12345   896 pts/0    R+   09:30   0:00 ps aux',
    ]
    return { output: auxProcesses.join('\r\n'), newPath: null }
  }
  
  return { output: processes.join('\r\n'), newPath: null }
}

// KILL - Kill process
function cmdKill(args, currentPath) {
  if (args.length === 0) {
    return { output: '\x1b[31mkill: usage: kill <pid>\x1b[0m', newPath: null }
  }
  
  const pid = args[args.length - 1]
  
  if (pid === '1') {
    return { output: '\x1b[31mkill: (1) - Operation not permitted\x1b[0m', newPath: null }
  }
  
  return { output: '', newPath: null }
}

// DF - Disk free
function cmdDf(args, currentPath) {
  const output = [
    'Filesystem     1K-blocks    Used Available Use% Mounted on',
    '/dev/sda1       51475068 8234512  40602504  17% /',
    'tmpfs            4086844       0   4086844   0% /dev/shm',
    '/dev/sda2      102948436 2458932  95237220   3% /home',
  ]
  
  if (args.includes('-h')) {
    const humanOutput = [
      'Filesystem      Size  Used Avail Use% Mounted on',
      '/dev/sda1        50G  7.9G   39G  17% /',
      'tmpfs           3.9G     0  3.9G   0% /dev/shm',
      '/dev/sda2        99G  2.4G   91G   3% /home',
    ]
    return { output: humanOutput.join('\r\n'), newPath: null }
  }
  
  return { output: output.join('\r\n'), newPath: null }
}

// DU - Disk usage
function cmdDu(args, currentPath) {
  let targetPath = currentPath
  let humanReadable = false
  
  for (const arg of args) {
    if (arg === '-h') humanReadable = true
    else if (!arg.startsWith('-')) targetPath = resolvePath(currentPath, arg)
  }
  
  const results = []
  
  function calcSize(path, depth = 0) {
    const node = getNode(path)
    if (!node) return 0
    
    if (node.type === 'file') {
      return node.content?.length || 0
    }
    
    let total = 4096 // Directory base size
    const contents = node.children || {}
    
    for (const name of Object.keys(contents)) {
      const childPath = path === '/' ? `/${name}` : `${path}/${name}`
      total += calcSize(childPath, depth + 1)
    }
    
    const displaySize = humanReadable 
      ? (total > 1024 ? `${Math.round(total/1024)}K` : `${total}`)
      : total.toString()
    
    results.push(`${displaySize}\t${path}`)
    return total
  }
  
  calcSize(targetPath)
  return { output: results.reverse().join('\r\n'), newPath: null }
}

// UNAME - System info
function cmdUname(args, currentPath) {
  if (args.includes('-a')) {
    return { output: 'Linux unix-course 5.15.0-generic #1 SMP x86_64 GNU/Linux', newPath: null }
  }
  return { output: 'Linux', newPath: null }
}

// UPTIME - System uptime
function cmdUptime(args, currentPath) {
  return { output: ' 10:30:00 up 1 day,  2:15,  1 user,  load average: 0.08, 0.12, 0.10', newPath: null }
}

// ============== PERMISSIONS ==============

// CHMOD - Change permissions
function cmdChmod(args, currentPath) {
  if (args.length < 2) {
    return { output: '\x1b[31mchmod: missing operand\x1b[0m', newPath: null }
  }
  
  const mode = args[0]
  const target = args[1]
  const targetPath = resolvePath(currentPath, target)
  const node = getNode(targetPath)
  
  if (!node) {
    return { output: `\x1b[31mchmod: cannot access '${target}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  // Convert numeric mode to permission string
  const modeMap = {
    '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--',
    '3': '-wx', '2': '-w-', '1': '--x', '0': '---'
  }
  
  if (/^[0-7]{3}$/.test(mode)) {
    const perms = (node.type === 'directory' ? 'd' : '-') +
      modeMap[mode[0]] + modeMap[mode[1]] + modeMap[mode[2]]
    node.permissions = perms
  }
  
  return { output: '', newPath: null }
}

// CHOWN - Change owner
function cmdChown(args, currentPath) {
  if (args.length < 2) {
    return { output: '\x1b[31mchown: missing operand\x1b[0m', newPath: null }
  }
  
  const owner = args[0]
  const target = args[1]
  const targetPath = resolvePath(currentPath, target)
  const node = getNode(targetPath)
  
  if (!node) {
    return { output: `\x1b[31mchown: cannot access '${target}': No such file or directory\x1b[0m`, newPath: null }
  }
  
  const parts = owner.split(':')
  node.owner = parts[0]
  if (parts[1]) node.group = parts[1]
  
  return { output: '', newPath: null }
}

// ============== UTILITIES ==============

// DATE - Show date
function cmdDate(args, currentPath) {
  const now = new Date()
  return { output: now.toString(), newPath: null }
}

// HISTORY - Show command history
function cmdHistory(args, currentPath) {
  if (commandHistory.length === 0) {
    return { output: '', newPath: null }
  }
  
  const lines = commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`)
  return { output: lines.join('\r\n'), newPath: null }
}

// CLEAR - Clear terminal
function cmdClear(args, currentPath) {
  return { output: '\x1b[2J\x1b[H', newPath: null }
}

// HELP - Show available commands
function cmdHelp(args, currentPath) {
  const lines = [
    '',
    '\x1b[1;33m══════════════════════════════════════════════════════════════════════════════\x1b[0m',
    '\x1b[1;33m                            UNIX COMMAND REFERENCE                            \x1b[0m',
    '\x1b[1;33m══════════════════════════════════════════════════════════════════════════════\x1b[0m',
    '',
    '\x1b[1;36m─── Navigation ───────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mpwd\x1b[0m              Print working directory         \x1b[90mpwd\x1b[0m',
    '  \x1b[32mls\x1b[0m               List directory contents          \x1b[90mls -la\x1b[0m',
    '  \x1b[32mcd <path>\x1b[0m        Change directory                 \x1b[90mcd documents\x1b[0m  \x1b[90mcd ..\x1b[0m  \x1b[90mcd ~\x1b[0m',
    '',
    '\x1b[1;36m─── File Operations ──────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mcat <file>\x1b[0m       Display file contents            \x1b[90mcat notes.txt\x1b[0m',
    '  \x1b[32mhead <file>\x1b[0m      Show first 10 lines              \x1b[90mhead -n 5 log.txt\x1b[0m',
    '  \x1b[32mtail <file>\x1b[0m      Show last 10 lines               \x1b[90mtail -n 20 log.txt\x1b[0m',
    '  \x1b[32mless <file>\x1b[0m      View file (paged)                \x1b[90mless /var/log/syslog\x1b[0m',
    '  \x1b[32mtouch <file>\x1b[0m     Create empty file                \x1b[90mtouch newfile.txt\x1b[0m',
    '  \x1b[32mmkdir <dir>\x1b[0m      Create directory                 \x1b[90mmkdir projects\x1b[0m',
    '  \x1b[32mcp <src> <dest>\x1b[0m  Copy file                        \x1b[90mcp file.txt backup.txt\x1b[0m',
    '  \x1b[32mmv <src> <dest>\x1b[0m  Move or rename file              \x1b[90mmv old.txt new.txt\x1b[0m',
    '  \x1b[32mrm <file>\x1b[0m        Remove file                      \x1b[90mrm unwanted.txt\x1b[0m',
    '  \x1b[32mrm -r <dir>\x1b[0m      Remove directory                 \x1b[90mrm -r old_folder\x1b[0m',
    '',
    '\x1b[1;36m─── Search & Text ────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mgrep <pat> <file>\x1b[0m  Search for pattern             \x1b[90mgrep error /var/log/syslog\x1b[0m',
    '  \x1b[32mfind <path> -name\x1b[0m  Find files by name             \x1b[90mfind . -name "*.txt"\x1b[0m',
    '  \x1b[32mwc <file>\x1b[0m        Count lines/words/chars          \x1b[90mwc notes.txt\x1b[0m',
    '  \x1b[32mecho <text>\x1b[0m      Print text                       \x1b[90mecho "Hello World"\x1b[0m',
    '',
    '\x1b[1;36m─── System Info ──────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mwhoami\x1b[0m           Print current user               \x1b[90mwhoami\x1b[0m',
    '  \x1b[32mps\x1b[0m               List processes                   \x1b[90mps aux\x1b[0m',
    '  \x1b[32mkill <pid>\x1b[0m       Terminate process                \x1b[90mkill 1234\x1b[0m',
    '  \x1b[32mdf\x1b[0m               Show disk space                  \x1b[90mdf -h\x1b[0m',
    '  \x1b[32mdu\x1b[0m               Show directory size              \x1b[90mdu -h documents\x1b[0m',
    '  \x1b[32muname\x1b[0m            System information               \x1b[90muname -a\x1b[0m',
    '  \x1b[32muptime\x1b[0m           System uptime                    \x1b[90muptime\x1b[0m',
    '  \x1b[32mdate\x1b[0m             Show current date                \x1b[90mdate\x1b[0m',
    '',
    '\x1b[1;36m─── Permissions ──────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mchmod <mode>\x1b[0m     Change permissions               \x1b[90mchmod 755 script.sh\x1b[0m',
    '  \x1b[32mchown <user>\x1b[0m     Change owner                     \x1b[90mchown user:group file.txt\x1b[0m',
    '',
    '\x1b[1;36m─── Utilities ────────────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mhistory\x1b[0m          Show command history             \x1b[90mhistory\x1b[0m',
    '  \x1b[32mclear\x1b[0m            Clear the screen                 \x1b[90mclear\x1b[0m',
    '  \x1b[32mhelp\x1b[0m             Show this message                \x1b[90mhelp\x1b[0m',
    '',
    '\x1b[1;36m─── Course Navigation ────────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[32mlesson <n>\x1b[0m       Go to session n                  \x1b[90mlesson 3\x1b[0m',
    '  \x1b[32mlesson next\x1b[0m      Go to next session               \x1b[90mlesson next\x1b[0m',
    '  \x1b[32mlesson prev\x1b[0m      Go to previous session           \x1b[90mlesson prev\x1b[0m',
    '  \x1b[32mlesson list\x1b[0m      List all sessions                \x1b[90mlesson list\x1b[0m',
    '',
    '\x1b[1;33m─── Keyboard Shortcuts ───────────────────────────────────────────────────────\x1b[0m',
    '  \x1b[36mTab\x1b[0m              Auto-complete commands & paths',
    '  \x1b[36m↑ / ↓\x1b[0m            Browse command history',
    '  \x1b[36mCtrl+C\x1b[0m           Cancel current input',
    '  \x1b[36mCtrl+L\x1b[0m           Clear screen',
    '  \x1b[36mCtrl+V\x1b[0m           Paste from clipboard',
    '',
  ]
  return { output: lines.join('\r\n'), newPath: null }
}

// ============== COURSE NAVIGATION ==============

// LESSON - Navigate between course sessions
function cmdLesson(args, currentPath, context) {
  const { onSessionChange, currentSession } = context

  if (args.length === 0) {
    return {
      output: 'Usage: lesson [1-5|next|prev|list]\r\nExamples:\r\n  lesson 1     - Go to Session 1\r\n  lesson next  - Go to next session\r\n  lesson list  - List all sessions',
      newPath: null
    }
  }

  const arg = args[0].toLowerCase()

  if (arg === 'list') {
    return 'Available Sessions:\n  0. Overview & Getting Started\n  1. Navigation & File System Basics\n  2. File Operations & Viewing Content\n  3. Text Processing & Searching\n  4. System Information & Processes\n  5. Permissions & Practical Workflows'
  }

  if (arg === 'next') {
    const next = Math.min(currentSession + 1, 5)
    if (onSessionChange) onSessionChange(next)
    return { output: `Moved to Session ${next}`, newPath: null }
  }

  if (arg === 'prev') {
    const prev = Math.max(currentSession - 1, 1)
    if (onSessionChange) onSessionChange(prev)
    return { output: `Moved to Session ${prev}`, newPath: null }
  }

  // Update the validation
  const sessionNum = parseInt(arg)
  if (sessionNum >= 0 && sessionNum <= 5) {
    onSessionChange(sessionNum)
    return `Moved to Session ${sessionNum}`
  }

  return { output: 'Invalid session. Use: lesson [1-5|next|prev|list]', newPath: null }
}
