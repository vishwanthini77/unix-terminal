# Lesson 5: Permissions & Practical Workflows

## What You'll Learn
Understand Unix file permissions, learn to modify access rights, and tie everything together with real-world workflows you'll use when working with engineering teams.

## Understanding Permissions

Every file and directory in Unix has three types of permissions for three categories of users:

**Permission types**:
- **r** (read): View file contents or list directory contents
- **w** (write): Modify file or add/remove files in directory
- **x** (execute): Run file as program or access directory

**User categories**:
- **Owner**: The user who owns the file
- **Group**: Users in the file's group
- **Others**: Everyone else

**Reading permissions**:
```bash
ls -l file.txt
# Output: -rw-r--r-- 1 user group 1234 Feb 07 14:30 file.txt
#         ^^^^^^^^^ permissions
#         -: file type (- = file, d = directory)
#         rw-: owner can read and write
#         r--: group can only read
#         r--: others can only read
```

---

## Permission Examples
```bash
drwxr-xr-x    # Directory: owner full access, group/others read+execute
-rw-------    # File: only owner can read/write, others have no access
-rwxr-xr-x    # Executable: owner can modify, everyone can run
-rw-rw-r--    # File: owner and group can edit, others read-only
```

---

## Modifying Permissions

### `chmod` - Change File Mode
Modify file and directory permissions.

**Numeric method** (most common):
```bash
chmod 755 script.sh         # rwxr-xr-x (owner: full, others: read+execute)
chmod 644 file.txt          # rw-r--r-- (owner: read+write, others: read-only)
chmod 600 secret.key        # rw------- (owner only)
chmod 777 shared.txt        # rwxrwxrwx (everyone: full access - rarely recommended)
```

**How numeric permissions work**:
- **4** = read (r)
- **2** = write (w)  
- **1** = execute (x)
- Add them: **7** = 4+2+1 = rwx, **6** = 4+2 = rw-, **5** = 4+1 = r-x

**Symbolic method**:
```bash
chmod u+x script.sh         # Add execute for owner (user)
chmod g+w file.txt          # Add write for group
chmod o-r secret.txt        # Remove read for others
chmod a+r public.txt        # Add read for all (owner, group, others)
```

**When to use**: Make scripts executable, secure sensitive files, fix permission errors.

---

### `chown` - Change Ownership
Change file owner and group.
```bash
chown user file.txt                 # Change owner
chown user:group file.txt           # Change owner and group
chown -R user:group directory/      # Recursive (all files inside)
```

**When to use**: Transfer file ownership, fix permission issues, set up shared directories.

**Note**: Usually requires root/sudo privileges.

---

## Common Permission Patterns

### Scripts and Executables
```bash
chmod 755 deploy.sh             # Make script executable
./deploy.sh                     # Run it
```

### Configuration Files
```bash
chmod 644 config.json           # Readable by all, editable by owner
chmod 600 .env                  # Sensitive config - owner only
```

### Directories
```bash
chmod 755 project/              # Standard directory permissions
chmod 700 private/              # Private directory - owner only
```

### Log Files
```bash
chmod 644 app.log               # Readable by all, writable by owner
chmod 666 shared.log            # Everyone can write (rare, use carefully)
```

---

## Command History

### `history` - View Command History
See previously executed commands.
```bash
history                         # Show all history
history | tail -20              # Last 20 commands
history | grep "git"            # Find specific commands
!123                           # Re-run command #123
!!                             # Re-run last command
!$                             # Last argument of previous command
```

**When to use**: Recall complex commands, audit actions, learn from past work.

---

## Practical Workflows

### Workflow 1: Deploying Application Files
```bash
# 1. Navigate to project
cd /var/www/myapp

# 2. Check current state
pwd
ls -la

# 3. Backup existing files
cp -r . ../myapp-backup-$(date +%Y%m%d)

# 4. Update files (example: copy new version)
cp ~/downloads/new-app/* .

# 5. Set correct permissions
chmod 644 *.html *.css *.js
chmod 755 scripts/*.sh

# 6. Verify
ls -la
cat config.json

# 7. Check logs for issues
tail -f /var/logs/app.log
```

---

### Workflow 2: Investigating Production Issues
```bash
# 1. Check system health
uptime
df -h

# 2. Find problematic process
ps aux | grep myapp
ps aux | sort -k3 -nr | head -10     # High CPU processes

# 3. Check recent logs
cd /var/logs
tail -100 error.log
grep -i "error" error.log | tail -50

# 4. Search for specific issue
grep "database connection" app.log
grep "timeout" app.log | wc -l

# 5. Monitor live
tail -f app.log
```

---

### Workflow 3: Setting Up New Project Directory
```bash
# 1. Create structure
mkdir -p myproject/{src,tests,config,logs}

# 2. Verify structure
tree myproject

# 3. Navigate and create files
cd myproject/src
touch app.js index.js utils.js

# 4. Set permissions
chmod 755 ../
chmod 644 *.js

# 5. Create initial config
cd ../config
echo '{"env": "development"}' > config.json
cat config.json

# 6. Set up logs
chmod 755 ../logs
touch ../logs/app.log
```

---

### Workflow 4: Finding and Cleaning Up
```bash
# 1. Find what's using space
du -sh /* | sort -hr | head -10

# 2. Check specific directory
cd /var/logs
du -sh * | sort -hr

# 3. Find old files
find . -name "*.log" -mtime +30

# 4. Count and verify
find . -name "*.log" -mtime +30 | wc -l

# 5. Archive before cleanup
tar -czf old-logs-$(date +%Y%m%d).tar.gz *.log

# 6. Clean up (be careful!)
rm *.log
```

---

## Practice Exercises

Try these in the terminal:

1. **Check permissions**: Run `ls -la` and identify permission patterns
2. **Make executable**: Create `touch test.sh`, then `chmod +x test.sh`, verify with `ls -l`
3. **View history**: Run `history | tail -10` to see recent commands
4. **Secure file**: Run `touch secret.txt`, then `chmod 600 secret.txt`
5. **Practice workflow**: Create a project directory structure with proper permissions

---

## Real-World Scenarios

**Scenario 1**: Script won't run - "Permission denied"
```bash
ls -l deploy.sh                 # Check current permissions
# Output: -rw-r--r-- (no execute permission)
chmod +x deploy.sh              # Add execute permission
ls -l deploy.sh                 # Verify: -rwxr-xr-x
./deploy.sh                     # Now it runs
```

**Scenario 2**: Secure sensitive configuration
```bash
ls -l .env                      # Check permissions
# Output: -rw-r--r-- (readable by everyone - BAD!)
chmod 600 .env                  # Owner only
ls -l .env                      # Verify: -rw-------
```

**Scenario 3**: Remember complex command from yesterday
```bash
history | grep deploy           # Find deploy commands
!234                           # Re-run command #234
```

**Scenario 4**: Set up shared project directory
```bash
mkdir shared-project
chmod 755 shared-project        # Everyone can access
cd shared-project
touch README.md
chmod 644 README.md             # Everyone can read, owner can edit
```

---

## Key Takeaways
- **755** is standard for directories and executable files
- **644** is standard for regular files
- **600** is for sensitive files (owner only)
- Use `chmod +x` to make scripts executable
- Check permissions with `ls -l` before modifying
- Use `history` to recall complex commands
- Always backup before changing permissions
- Understanding permissions prevents "Permission denied" errors

---

## Congratulations! 🎉

You've completed all 5 Unix fundamentals lessons. You now know:
- ✅ How to navigate the file system
- ✅ How to manage files and view content
- ✅ How to search and process text
- ✅ How to monitor system resources and processes
- ✅ How to handle permissions and build workflows

**Next steps**: Practice these commands regularly, explore the `help` command in the terminal, and apply these skills when working with engineering teams.

**Keep the terminal open and experiment!**