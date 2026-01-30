This architecture effectively creates your own private "SaaS" that runs on your LAN.

Since you are running **Talos Linux** (which is Kubernetes-native and doesn't run `docker-compose` natively), I have provided a standard **Docker Compose** file below. You can run this on any standard Linux VM/node in your lab, **OR** use a tool like `kompose` to convert this instantly into Kubernetes manifests for your Talos cluster.

### 1. The Directory Structure

Create a folder on your server (e.g., `~/ios-station`) and set it up like this:

```text
ios-station/
├── docker-compose.yml
├── html/
│   └── index.html
└── config/
    └── (This will auto-populate with app data)

```

### 2. The `docker-compose.yml`

This defines your 3 backend services and the frontend wrapper.

```yaml
version: "3.8"
services:
  # Tab 1: Code Editor
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: ios-code
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Kolkata
      - PASSWORD=password # Change this!
      - SUDO_PASSWORD=password
    volumes:
      - ./config/code-server:/config
      - ./workspace:/home/coder/project # Your code lives here
    ports:
      - 8080:8443
    restart: unless-stopped

  # Tab 2: The Intelligence (Claude/Ollama UI)
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: ios-ai
    volumes:
      - ./config/open-webui:/app/backend/data
    ports:
      - 3000:8080
    extra_hosts:
      - "host.docker.internal:host-gateway" 
    restart: unless-stopped

  # Tab 3: Terminal
  ttyd:
    image: tsl0922/ttyd
    container_name: ios-term
    # Runs bash in the /workspace directory so it sees the same files as VS Code
    command: ttyd -W -p 7681 bash
    working_dir: /workspace
    volumes:
      - ./workspace:/workspace
    ports:
      - 7681:7681
    restart: unless-stopped

  # The "Glue" Frontend
  dashboard:
    image: nginx:alpine
    container_name: ios-dashboard
    volumes:
      - ./html:/usr/share/nginx/html
    ports:
      - 80:80
    restart: unless-stopped

```

### 3. The "Glue" (`html/index.html`)

Save this into the `html` folder. This is the magic that makes it feel like an iOS app.

**Key Feature:** I wrote a small JavaScript snippet at the bottom. It automatically detects your server's LAN IP. So if you visit `http://192.168.1.50`, it knows to look for the other services on `192.168.1.50:8080`, etc.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>DevStation</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            background: #1e1e1e; 
            overflow: hidden; /* Prevent scrolling the whole page */
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* The Viewport Area */
        #viewport {
            flex: 1;
            position: relative;
            width: 100%;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
            position: absolute;
            top: 0;
            left: 0;
            background: #1e1e1e;
        }

        /* Utility to hide/show tabs */
        .hidden { visibility: hidden; z-index: 0; }
        .active { visibility: visible; z-index: 10; }

        /* The Bottom Navigation Bar */
        #nav {
            height: 60px; /* Nice touch target size */
            background: #252526;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #333;
            padding-bottom: env(safe-area-inset-bottom); /* iPhone Home Bar Support */
        }

        .nav-btn {
            color: #888;
            background: none;
            border: none;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            width: 100%;
            height: 100%;
            justify-content: center;
        }

        .nav-btn.selected { color: #007aff; }
        
        /* Icons (Simple SVG placeholders) */
        .icon { width: 20px; height: 20px; fill: currentColor; }
    </style>
</head>
<body>

    <div id="viewport">
        <iframe id="frame-code" class="active"></iframe>
        <iframe id="frame-ai" class="hidden"></iframe>
        <iframe id="frame-term" class="hidden"></iframe>
    </div>

    <div id="nav">
        <button class="nav-btn selected" onclick="switchTab('code', this)">
            <span>&lt;/&gt;</span>
            Code
        </button>
        <button class="nav-btn" onclick="switchTab('ai', this)">
            <span>✦</span>
            AI
        </button>
        <button class="nav-btn" onclick="switchTab('term', this)">
            <span>$_</span>
            Term
        </button>
    </div>

    <script>
        // 1. Dynamic IP Detection
        // This grabs the IP you typed in the browser (e.g., 192.168.1.X)
        const host = window.location.hostname;

        // 2. Load the specific ports for your services
        // Ensure these match the ports in your docker-compose.yml
        document.getElementById('frame-code').src = `http://${host}:8080`;
        document.getElementById('frame-ai').src = `http://${host}:3000`;
        document.getElementById('frame-term').src = `http://${host}:7681`;

        // 3. Tab Switching Logic
        function switchTab(tabName, btn) {
            // Hide all frames
            document.getElementById('frame-code').className = 'hidden';
            document.getElementById('frame-ai').className = 'hidden';
            document.getElementById('frame-term').className = 'hidden';

            // Show selected frame
            document.getElementById(`frame-${tabName}`).className = 'active';

            // Update button styles
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        }
    </script>
</body>
</html>

```

### 4. How to Install on iOS

1. Run `docker-compose up -d`.
2. Open Safari on your iPad/iPhone.
3. Navigate to `http://YOUR-SERVER-IP`.
4. **Important:** Tap the "Share" icon (square with arrow) -> **"Add to Home Screen"**.
5. Launch it from the home screen. It will open full screen without the Safari URL bar.

### A Note for your Talos Setup

Since you have **Talos**, you likely want to run this properly in K8s eventually.

* **Storage:** The `docker-compose` uses local bind mounts (`./workspace`). In Talos, you will need to create a `PersistentVolumeClaim` (PVC) so your code files persist if the pod restarts.
* **Networking:** If you deploy this to K8s, you would typically use an Ingress (like Traefik) to map `code.yourdomain.local`, `ai.yourdomain.local`, etc. You would just update the `index.html` JavaScript to point to those subdomains instead of ports.

Would you like me to create the **Kubernetes Manifests (YAML)** for this instead, or is the Docker Compose sufficient for your "Proof of Concept" phase?