FROM lscr.io/linuxserver/code-server:latest

# DevOps tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget jq vim nano htop tree \
    ca-certificates gnupg lsb-release \
    python3 python3-pip python3-venv \
    bash-completion openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# kubectl
RUN curl -fsSL https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/$(dpkg --print-architecture)/kubectl -o /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kubectl

# Helm
RUN curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# k3d
RUN curl -fsSL https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# kind
RUN ARCH=$(dpkg --print-architecture) \
    && curl -fsSL -o /usr/local/bin/kind "https://kind.sigs.k8s.io/dl/v0.24.0/kind-linux-${ARCH}" \
    && chmod +x /usr/local/bin/kind

# Docker CLI
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Claude Code CLI + Express for file server
RUN npm install -g @anthropic-ai/claude-code express

# ttyd for the external terminal tab
RUN ARCH=$(uname -m) \
    && curl -fsSL -o /usr/local/bin/ttyd "https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.${ARCH}" \
    && chmod +x /usr/local/bin/ttyd

# Project listing script (used by dashboard)
RUN echo '#!/bin/bash\nls -d /home/coder/projects/*/ 2>/dev/null | xargs -I{} basename {} | jq -R . | jq -s .' > /usr/local/bin/list-projects \
    && chmod +x /usr/local/bin/list-projects

# File server for mobile editor
COPY file-server.js /opt/file-server.js
RUN cd /opt && npm init -y && npm install express

# Bash config
COPY bashrc-extra /tmp/bashrc-extra
COPY entrypoint-custom.sh /custom-entrypoint.sh
RUN chmod +x /custom-entrypoint.sh
