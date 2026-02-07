# Session 4: System Information & Processes

## What You'll Learn
Understand how to check system resources, monitor running processes, and get system information - essential for troubleshooting performance issues and understanding server environments.

## Who Am I? System Identity

### `whoami` - Current User
Shows your username.
```bash
whoami
# Output: user
```

**When to use**: Verify which user account you're using, check permissions context.

---

### `uname` - System Information
Display system and kernel information.
```bash
uname                   # System name (Linux, Darwin for Mac)
uname -a                # All information
uname -r                # Kernel version
uname -m                # Machine hardware (x86_64, arm64)
```

**When to use**: Check OS version, verify system architecture, troubleshoot compatibility.

---

### `date` - Current Date and Time
Display or set system date and time.
```bash
date                              # Current date and time
date +%Y-%m-%d                    # Format: 2024-02-07
date +%H:%M:%S                    # Format: 14:30:45
date +%s                          # Unix timestamp
```

**When to use**: Timestamp logs, schedule tasks, check server time.

---

### `uptime` - System Uptime
Shows how long the system has been running.
```bash
uptime
# Output: 14:30:45 up 10 days, 5:23, 3 users, load average: 0.52, 0.58, 0.59
```

**Key information**:
- Current time
- How long system has been running
- Number of logged-in users
- Load average (system load over 1, 5, 15 minutes)

**When to use**: Check if server recently restarted, monitor system stability.

---

## Managing Processes

### `ps` - Process Status
List running processes.
```bash
ps                      # Your processes in current terminal
ps aux                  # All processes, detailed view
ps aux | grep node      # Find specific process (e.g., Node.js)
ps -ef                  # Alternative detailed format
```

**Key columns in `ps aux`**:
- **USER**: Who owns the process
- **PID**: Process ID (unique identifier)
- **%CPU**: CPU usage
- **%MEM**: Memory usage
- **COMMAND**: The command that started the process

**When to use**: Find process IDs, check resource usage, identify running applications.

---

### `ps` Real-World Examples
```bash
# Find all Node.js processes
ps aux | grep node

# Find processes using high CPU
ps aux | sort -k3 -nr | head -10

# Find processes by specific user
ps aux | grep username

# Check if a specific app is running
ps aux | grep "nginx"
```

---

### `kill` - Terminate Processes
Stop running processes by PID.
```bash
kill 1234                   # Graceful shutdown (SIGTERM)
kill -9 1234                # Force kill (SIGKILL)
kill -15 1234               # Explicit SIGTERM
```

**Common signals**:
- **SIGTERM (15)**: Graceful shutdown (default) - allows cleanup
- **SIGKILL (9)**: Immediate termination - no cleanup
- **SIGHUP (1)**: Reload configuration

**When to use**: Stop frozen applications, restart services, free up resources.

**Workflow**: First try `kill PID`, if that doesn't work use `kill -9 PID`.

---

### Process Management Examples
```bash
# Find and kill a process
ps aux | grep "node app.js"    # Get the PID
kill 5678                      # Kill by PID

# Kill all processes by name
pkill node                     # Kill all node processes

# Find process by port
lsof -i :3000                  # Find what's using port 3000
kill $(lsof -t -i :3000)       # Kill process on port 3000
```

---

## Disk and Resource Monitoring

### `df` - Disk Free Space
Show available disk space.
```bash
df                      # Basic output
df -h                   # Human-readable (GB, MB)
df -h /                 # Check root partition only
```

**Key columns**:
- **Filesystem**: Device name
- **Size**: Total size
- **Used**: Space used
- **Avail**: Space available
- **Use%**: Percentage used

**When to use**: Check if disk is full, monitor storage capacity, prevent out-of-space errors.

---

### `du` - Disk Usage
Show disk usage of files and directories.
```bash
du                          # Current directory usage
du -h                       # Human-readable sizes
du -sh *                    # Summary of each item
du -sh /var/logs            # Size of specific directory
du -h | sort -hr | head -10 # Top 10 largest items
```

**When to use**: Find what's using disk space, identify large files/directories, clean up storage.

---

## Practice Exercises

Try these in the terminal:

1. **Check identity**: Run `whoami` and `uname -a`
2. **System uptime**: Run `uptime` to see how long the system has been running
3. **Current time**: Run `date +%Y-%m-%d` to see today's date
4. **View processes**: Run `ps aux | head -20` to see top processes
5. **Disk space**: Run `df -h` to check available storage
6. **Directory size**: Run `du -sh *` to see what's using space

---

## Real-World Scenarios

**Scenario 1**: Application is frozen, need to restart it
```bash
ps aux | grep "myapp"           # Find the PID (e.g., 5678)
kill 5678                       # Try graceful shutdown
# Wait 10 seconds
ps aux | grep "myapp"           # Check if still running
kill -9 5678                    # Force kill if necessary
```

**Scenario 2**: Server running out of disk space
```bash
df -h                           # Check overall disk usage
df -h /var                      # Check specific partition
du -sh /var/logs/*              # Find which logs are large
du -sh /var/logs/* | sort -hr   # Sort by size
```

**Scenario 3**: Need to know server's OS version for compatibility
```bash
uname -a                        # Full system info
cat /etc/os-release             # Detailed OS information
```

**Scenario 4**: Check if server was recently restarted
```bash
uptime                          # See uptime duration
last reboot                     # Show reboot history
```

**Scenario 5**: Find what's using high CPU
```bash
ps aux | sort -k3 -nr | head -10    # Top 10 CPU users
top                                  # Live monitoring (press q to quit)
```

---

## Key Takeaways
- Use `ps aux | grep <name>` to find processes
- Always try `kill PID` before `kill -9 PID`
- Check disk space with `df -h` before deployments
- Use `du -sh` to find what's consuming disk space
- `uptime` shows system stability and recent restarts
- Process IDs (PIDs) are unique identifiers for running programs

---

**Ready for Session 5? Complete these exercises first.**