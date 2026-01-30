#!/bin/bash

# Append bashrc extras if not already present
grep -q "devstation" /home/coder/.bashrc 2>/dev/null || cat /tmp/bashrc-extra >> /home/coder/.bashrc

# Fix SSH permissions
if [ -d /home/coder/.ssh ]; then
    chmod 700 /home/coder/.ssh
    chmod 600 /home/coder/.ssh/* 2>/dev/null
    chown -R abc:abc /home/coder/.ssh 2>/dev/null
fi

# Clean up old artifacts
rm -f /home/coder/projects/.projects.json 2>/dev/null

# Start ttyd in background
ttyd -W -p 7681 bash &

# Start file server for mobile editor
node /opt/file-server.js &

# Start code-server
exec /init
