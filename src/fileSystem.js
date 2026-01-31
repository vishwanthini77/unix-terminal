// Simulated Unix file system
export const fileSystem = {
  '/': {
    type: 'directory',
    children: {
      'home': {
        type: 'directory',
        children: {
          'user': {
            type: 'directory',
            children: {
              'documents': {
                type: 'directory',
                children: {
                  'notes.txt': {
                    type: 'file',
                    content: 'Welcome to Unix for the Rest of Us!\nThis is a sample text file.'
                  },
                  'project-plan.txt': {
                    type: 'file',
                    content: 'Project: Learn Unix\nStatus: In Progress\nDeadline: This week!'
                  }
                }
              },
              'downloads': {
                type: 'directory',
                children: {
                  'report.pdf': {
                    type: 'file',
                    content: '[PDF content - binary file]'
                  }
                }
              },
              'scripts': {
                type: 'directory',
                children: {
                  'backup.sh': {
                    type: 'file',
                    content: '#!/bin/bash\necho "Running backup..."\ncp -r ~/documents ~/backup'
                  },
                  'hello.sh': {
                    type: 'file',
                    content: '#!/bin/bash\necho "Hello, World!"'
                  }
                }
              },
              '.bashrc': {
                type: 'file',
                content: '# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"'
              },
              '.profile': {
                type: 'file',
                content: '# ~/.profile\n# User specific environment'
              }
            }
          }
        }
      },
      'etc': {
        type: 'directory',
        children: {
          'hosts': {
            type: 'file',
            content: '127.0.0.1   localhost\n::1         localhost'
          },
          'passwd': {
            type: 'file',
            content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash'
          }
        }
      },
      'var': {
        type: 'directory',
        children: {
          'log': {
            type: 'directory',
            children: {
              'syslog': {
                type: 'file',
                content: 'Jan 29 10:00:01 server systemd[1]: Started Unix Course.\nJan 29 10:00:02 server nginx[1234]: Server started on port 80'
              },
              'auth.log': {
                type: 'file',
                content: 'Jan 29 09:55:00 server sshd[5678]: Accepted password for user\nJan 29 09:55:01 server sshd[5678]: pam_unix(sshd:session): session opened'
              }
            }
          }
        }
      },
      'tmp': {
        type: 'directory',
        children: {}
      }
    }
  }
}

// Helper function to resolve a path (handles . and ..)
export function resolvePath(currentPath, targetPath) {
  // Handle absolute paths
  if (targetPath.startsWith('/')) {
    return normalizePath(targetPath)
  }
  
  // Handle home directory shortcut
  if (targetPath === '~' || targetPath.startsWith('~/')) {
    const homePath = '/home/user'
    if (targetPath === '~') {
      return homePath
    }
    return normalizePath(homePath + targetPath.slice(1))
  }
  
  // Handle relative paths
  const combined = currentPath + '/' + targetPath
  return normalizePath(combined)
}

// Normalize path (resolve . and ..)
function normalizePath(path) {
  const parts = path.split('/').filter(p => p !== '' && p !== '.')
  const result = []
  
  for (const part of parts) {
    if (part === '..') {
      result.pop()
    } else {
      result.push(part)
    }
  }
  
  return '/' + result.join('/')
}

// Get a directory or file from the file system
export function getNode(path) {
  if (path === '/') {
    return fileSystem['/']
  }
  
  const parts = path.split('/').filter(p => p !== '')
  let current = fileSystem['/']
  
  for (const part of parts) {
    if (!current || current.type !== 'directory' || !current.children[part]) {
      return null
    }
    current = current.children[part]
  }
  
  return current
}

// Get directory contents (for ls command)
export function getDirectory(path) {
  const node = getNode(path)
  if (!node || node.type !== 'directory') {
    return null
  }
  return node.children
}

// Check if a path exists
export function pathExists(path) {
  return getNode(path) !== null
}

// Check if path is a directory
export function isDirectory(path) {
  const node = getNode(path)
  return node && node.type === 'directory'
}
// Get parent path
export function getParentPath(path) {
  const parts = path.split('/').filter(p => p !== '')
  parts.pop()
  return '/' + parts.join('/')
}

// Add a new node (file or directory)
export function addNode(path, node) {
  const parentPath = getParentPath(path)
  const parent = getNode(parentPath)
  
  if (!parent || parent.type !== 'directory') {
    return false
  }
  
  const name = path.split('/').filter(p => p !== '').pop()
  parent.children[name] = node
  return true
}

// Remove a node
export function removeNode(path) {
  const parentPath = getParentPath(path)
  const parent = getNode(parentPath)
  
  if (!parent || parent.type !== 'directory') {
    return false
  }
  
  const name = path.split('/').filter(p => p !== '').pop()
  if (parent.children[name]) {
    delete parent.children[name]
    return true
  }
  return false
}