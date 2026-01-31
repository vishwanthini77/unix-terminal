import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { getDirectory, resolvePath } from '../fileSystem'
import { executeCommand, commandHistory } from '../commands'

function Terminal() {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const [currentPath, setCurrentPath] = useState('/home/user')
  
  // Store state in refs so callbacks can access current values
  const currentPathRef = useRef(currentPath)
  const commandHistoryRef = useRef([])
  const historyIndexRef = useRef(-1)
  
  useEffect(() => {
    currentPathRef.current = currentPath
  }, [currentPath])

  useEffect(() => {
    // Initialize terminal
    const xterm = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c586c0',
        cyan: '#4ec9b0',
        white: '#d4d4d4',
      },
      fontFamily: '"Fira Code", "Cascadia Code", Menlo, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    
    xterm.open(terminalRef.current)
    fitAddon.fit()
    
    xtermRef.current = xterm

    // Enable Ctrl+C for copy and Ctrl+V for paste
    xterm.attachCustomKeyEventHandler((event) => {
      // Allow Ctrl+C to copy when text is selected
      if (event.ctrlKey && event.key === 'c' && xterm.hasSelection()) {
        return false // Let browser handle copy
      }
      // Allow Ctrl+V for paste
      if (event.ctrlKey && event.key === 'v') {
        return false // Let browser handle paste
      }
      // Allow Ctrl+Shift+C and Ctrl+Shift+V (common terminal shortcuts)
      if (event.ctrlKey && event.shiftKey && (event.key === 'C' || event.key === 'V')) {
        return false
      }
      return true // Let xterm handle everything else
    })

    // Handle paste event
    terminalRef.current.addEventListener('paste', (event) => {
      const text = event.clipboardData.getData('text')
      xterm.write(text)
    })

    // Welcome message
    xterm.writeln('\x1b[36m╔════════════════════════════════════════════════════════╗\x1b[0m')
    xterm.writeln('\x1b[36m║\x1b[0m   \x1b[1;33mUnix for the Rest of Us\x1b[0m                              \x1b[36m║\x1b[0m')
    xterm.writeln('\x1b[36m║\x1b[0m   Learn Unix commands in your browser!                  \x1b[36m║\x1b[0m')
    xterm.writeln('\x1b[36m╚════════════════════════════════════════════════════════╝\x1b[0m')
    xterm.writeln('')
    xterm.writeln('Type \x1b[32mhelp\x1b[0m to see available commands.')
    xterm.writeln('')
    
    // Write initial prompt
    writePrompt(xterm, currentPathRef.current)

    // Handle input
    let buffer = ''
    let cursorPos = 0
    
    xterm.onData((data) => {
      const code = data.charCodeAt(0)
      
      // Enter key
      if (code === 13) {
        xterm.writeln('')
        if (buffer.trim()) {
          // Add to history
          commandHistoryRef.current.push(buffer)
          commandHistory.push(buffer)
          historyIndexRef.current = commandHistoryRef.current.length
          
          // Handle clear command specially
          if (buffer.trim().toLowerCase() === 'clear') {
            xterm.clear()
            buffer = ''
            cursorPos = 0
            writePrompt(xterm, currentPathRef.current)
            return
          }
          
          const result = executeCommand(buffer.trim(), currentPathRef.current)
          
          if (result.output) {
            xterm.writeln(result.output)
          }
          
          if (result.newPath) {
            setCurrentPath(result.newPath)
            currentPathRef.current = result.newPath
          }
        }
        buffer = ''
        cursorPos = 0
        writePrompt(xterm, currentPathRef.current)
      }
      // Backspace
      else if (code === 127) {
        if (cursorPos > 0) {
          buffer = buffer.slice(0, cursorPos - 1) + buffer.slice(cursorPos)
          cursorPos--
          // Rewrite line
          xterm.write('\x1b[2K\r')
          writePrompt(xterm, currentPathRef.current, false)
          xterm.write(buffer)
          // Move cursor to correct position
          if (cursorPos < buffer.length) {
            xterm.write(`\x1b[${buffer.length - cursorPos}D`)
          }
        }
      }
      // Tab - autocomplete
      else if (code === 9) {
        const completed = handleTabCompletion(buffer, currentPathRef.current, xterm)
        if (completed !== null) {
          buffer = completed
          cursorPos = buffer.length
          xterm.write('\x1b[2K\r')
          writePrompt(xterm, currentPathRef.current, false)
          xterm.write(buffer)
        }
      }
      // Arrow keys (escape sequences)
      else if (data === '\x1b[A') {
        // Up arrow - previous command
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--
          buffer = commandHistoryRef.current[historyIndexRef.current] || ''
          cursorPos = buffer.length
          xterm.write('\x1b[2K\r')
          writePrompt(xterm, currentPathRef.current, false)
          xterm.write(buffer)
        }
      }
      else if (data === '\x1b[B') {
        // Down arrow - next command
        if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
          historyIndexRef.current++
          buffer = commandHistoryRef.current[historyIndexRef.current] || ''
        } else {
          historyIndexRef.current = commandHistoryRef.current.length
          buffer = ''
        }
        cursorPos = buffer.length
        xterm.write('\x1b[2K\r')
        writePrompt(xterm, currentPathRef.current, false)
        xterm.write(buffer)
      }
      else if (data === '\x1b[C') {
        // Right arrow
        if (cursorPos < buffer.length) {
          cursorPos++
          xterm.write(data)
        }
      }
      else if (data === '\x1b[D') {
        // Left arrow
        if (cursorPos > 0) {
          cursorPos--
          xterm.write(data)
        }
      }
      // Ctrl+C
      else if (code === 3) {
        xterm.writeln('^C')
        buffer = ''
        cursorPos = 0
        writePrompt(xterm, currentPathRef.current)
      }
      // Ctrl+L (clear screen)
      else if (code === 12) {
        xterm.write('\x1b[2J\x1b[H')  // Clear screen and move cursor to top
        xterm.clear()                 // Clear scrollback buffer
        buffer = ''
        cursorPos = 0
        writePrompt(xterm, currentPathRef.current)
      }
      // Printable characters
      else if (code >= 32) {
        buffer = buffer.slice(0, cursorPos) + data + buffer.slice(cursorPos)
        cursorPos++
        // Rewrite from cursor position
        xterm.write('\x1b[2K\r')
        writePrompt(xterm, currentPathRef.current, false)
        xterm.write(buffer)
        if (cursorPos < buffer.length) {
          xterm.write(`\x1b[${buffer.length - cursorPos}D`)
        }
      }
    })

    // Handle resize
    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      xterm.dispose()
    }
  }, [])

  const writePrompt = (xterm, path, newline = true) => {
    const shortPath = path === '/home/user' ? '~' : path.replace('/home/user', '~')
    const prompt = `\x1b[32muser\x1b[0m@\x1b[36munix-course\x1b[0m:\x1b[33m${shortPath}\x1b[0m$ `
    xterm.write(prompt)
  }

  // Tab completion handler
  const handleTabCompletion = (buffer, currentPath, xterm) => {
    const parts = buffer.split(' ')
    const commands = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'rm', 'cat', 'head', 'tail', 'less',
                      'grep', 'find', 'wc', 'echo', 'cp', 'mv', 'chmod', 'chown', 'ps', 'kill',
                      'df', 'du', 'whoami', 'uname', 'uptime', 'date', 'history', 'clear', 'help']
    
    // If completing a command (first word)
    if (parts.length === 1) {
      const partial = parts[0].toLowerCase()
      const matches = commands.filter(cmd => cmd.startsWith(partial))
      
      if (matches.length === 1) {
        return matches[0] + ' '
      } else if (matches.length > 1) {
        // Show options
        xterm.writeln('')
        xterm.writeln(matches.join('  '))
        writePrompt(xterm, currentPath, false)
        xterm.write(buffer)
        return null
      }
      return null
    }
    
    // If completing a path (second word onwards)
    const pathPart = parts[parts.length - 1]
    let dirPath, prefix
    
    if (pathPart.includes('/')) {
      const lastSlash = pathPart.lastIndexOf('/')
      dirPath = resolvePath(currentPath, pathPart.slice(0, lastSlash) || '/')
      prefix = pathPart.slice(lastSlash + 1)
    } else {
      dirPath = currentPath
      prefix = pathPart
    }
    
    const contents = getDirectory(dirPath)
    if (!contents) return null
    
    const matches = Object.keys(contents).filter(name => 
      name.startsWith(prefix) && !name.startsWith('.')
    )
    
    if (matches.length === 1) {
      const match = matches[0]
      const isDir = contents[match].type === 'directory'
      
      // Build the completed path
      let completedPath
      if (pathPart.includes('/')) {
        const lastSlash = pathPart.lastIndexOf('/')
        completedPath = pathPart.slice(0, lastSlash + 1) + match
      } else {
        completedPath = match
      }
      
      // Add trailing slash for directories
      if (isDir) {
        completedPath += '/'
      }
      
      parts[parts.length - 1] = completedPath
      return parts.join(' ')
    } else if (matches.length > 1) {
      // Show options
      xterm.writeln('')
      const coloredMatches = matches.map(name => {
        const isDir = contents[name].type === 'directory'
        return isDir ? `\x1b[34m${name}\x1b[0m` : name
      })
      xterm.writeln(coloredMatches.join('  '))
      writePrompt(xterm, currentPath, false)
      xterm.write(buffer)
      
      // Find common prefix for partial completion
      const commonPrefix = findCommonPrefix(matches)
      if (commonPrefix.length > prefix.length) {
        if (pathPart.includes('/')) {
          const lastSlash = pathPart.lastIndexOf('/')
          parts[parts.length - 1] = pathPart.slice(0, lastSlash + 1) + commonPrefix
        } else {
          parts[parts.length - 1] = commonPrefix
        }
        return parts.join(' ')
      }
      return null
    }
    
    return null
  }

  return (
    <div 
      ref={terminalRef} 
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}
    />
  )
}

// Helper function to find common prefix
function findCommonPrefix(strings) {
  if (strings.length === 0) return ''
  if (strings.length === 1) return strings[0]
  
  let prefix = strings[0]
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (prefix === '') return ''
    }
  }
  return prefix
}

export default Terminal