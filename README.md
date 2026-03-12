# ChatOps

A production-grade real-time chat application built to showcase end-to-end DevOps practices. From source code to a running Kubernetes deployment — fully automated.

The built images are public, to easily test locally. This is a simple one click demo application that is built from groundup, to use github actions, argocd

![CI — Frontend](https://github.com/sharanch/chatops/actions/workflows/ci-frontend.yml/badge.svg)
![CI — Backend](https://github.com/sharanch/chatops/actions/workflows/ci-backend.yml/badge.svg)

---

## What is this?

ChatOps is a 3-tier real-time chat app deployed on Minikube using industry-standard DevOps tooling. The goal is to demonstrate a complete GitOps workflow — push code, CI builds and tests it, CD updates the Helm chart, ArgoCD syncs it to Kubernetes. Zero manual steps after the initial setup.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Minikube                         │
│                                                         │
│   ┌─────────────┐    ┌─────────────┐                   │
│   │   Frontend  │    │   Backend   │                   │
│   │  React+Nginx│───▶│  Node.js +  │                   │
│   │   Port 80   │    │  Socket.io  │                   │
│   └─────────────┘    └──────┬──────┘                   │
│                             │                           │
│                    ┌────────┴────────┐                  │
│                    │                 │                  │
│             ┌──────▼─────┐   ┌──────▼─────┐           │
│             │ PostgreSQL  │   │   Redis     │           │
│             │  Messages   │   │  Pub/Sub    │           │
│             └────────────┘   └────────────┘           │
└─────────────────────────────────────────────────────────┘
         ▲
         │ ArgoCD syncs
         │
    helm/values.yaml  ◄── GitHub Actions CD updates image tags
         ▲
         │
    Docker image ◄── GitHub Actions CI builds + pushes to GHCR
         ▲
         │
    git push  ◄── Developer
```

---

## Tech Stack

### Application
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Socket.io-client | Real-time chat UI |
| Backend | Node.js + Express + Socket.io | WebSocket API + REST |
| Database | PostgreSQL 16 | Persistent message storage |
| Cache | Redis 7 | Socket.io pub/sub for pod scaling |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Multi-stage image builds |
| Minikube | Local Kubernetes cluster |
| Helm | Kubernetes manifest templating |
| GitHub Actions | CI/CD pipelines |
| ArgoCD | GitOps continuous delivery |
| GHCR | Container image registry |

---

## Project Structure

```
chatops/
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/       # Login, Sidebar, MessageList, MessageInput
│   │   ├── context/          # SocketContext, ChatContext
│   │   ├── hooks/            # useTyping, useLocalStorage
│   │   └── utils/            # helpers
│   ├── Dockerfile            # Multi-stage: node builder → nginx
│   └── nginx.conf            # SPA routing + security headers
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── config/           # db.js, redis.js, socket.js
│   │   ├── controllers/      # messageController.js
│   │   ├── middleware/       # errorHandler, requestLogger
│   │   ├── routes/           # api.js
│   │   └── utils/            # logger.js (Winston → JSON for Loki)
│   ├── Dockerfile            # Multi-stage: deps → production
│   └── docker-compose.dev.yml # Local Postgres + Redis
│
├── helm/
│   ├── chatops/              # Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml       # Default values
│   │   └── templates/        # K8s manifests (frontend, backend, postgres, redis, ingress)
│   └── values-dev.yaml       # Minikube overrides
│
├── argocd/
│   ├── application.yaml      # ArgoCD Application CR
│   ├── project.yaml          # ArgoCD AppProject (RBAC)
│   └── bootstrap.sh          # One-shot ArgoCD install script
│
└── .github/
    └── workflows/
        ├── ci-frontend.yml   # lint → test → build → push image
        ├── ci-backend.yml    # lint → test → build → push image
        └── cd-deploy.yml     # update helm values → triggers ArgoCD
```

---

## GitOps Flow

```
1. Developer pushes code to main
        ↓
2. GitHub Actions CI triggers (path-filtered per service)
   lint → test → docker build → push to GHCR
        ↓
3. GitHub Actions CD triggers on CI success
   updates image tag in helm/values.yaml
   commits back to main with [skip ci]
        ↓
4. ArgoCD detects the values.yaml change (polls every 3 min)
   runs helm template → applies diff to Minikube
        ↓
5. New pods roll out with zero downtime ✅
```

---

## Local Development

### Prerequisites
- Docker
- Node.js 20+
- Minikube
- Helm 3
- kubectl

### Run the app locally (no Kubernetes)

```bash
# Start Postgres + Redis
cd backend
docker compose -f docker-compose.dev.yml up -d

# Start backend
npm install && npm run dev

# Start frontend (new terminal)
cd frontend
npm install && npm start
```

App runs at **http://localhost:3000**

### Deploy to Minikube

```bash
# 1. Start Minikube
minikube start
minikube addons enable ingress

# 2. Build images into Minikube's Docker
eval $(minikube docker-env)
docker build -t chatops-frontend:latest ./frontend
docker build -t chatops-backend:latest ./backend

# 3. Install ArgoCD
chmod +x argocd/bootstrap.sh
./argocd/bootstrap.sh

# 4. Add host entry
echo "$(minikube ip) chatops.local" | sudo tee -a /etc/hosts

# 5. Open in browser
open http://chatops.local
```

---

## CI/CD Pipelines

### CI — Frontend & Backend
Triggered on push to `main` or `develop` when files in the respective service folder change.

```
lint → test → docker build (multi-stage) → push to GHCR
```

Images are tagged with:
- `sha-<short-git-sha>` — immutable, traceable
- `main` — latest on main branch  
- `latest` — always points to newest main build

### CD — Deploy
Triggered automatically when CI succeeds. Updates `helm/values.yaml` with the new image tag and pushes back to git. ArgoCD picks up the change and deploys.

---

## Key DevOps Concepts Demonstrated

**GitOps** — Git is the single source of truth for cluster state. No `kubectl apply` in CI. ArgoCD reconciles the cluster to match git.

**Path-filtered CI** — Frontend CI only runs when `frontend/**` changes. Backend CI only runs when `backend/**` changes. Saves CI minutes, keeps pipelines fast.

**Multi-stage Docker builds** — Node.js is used only at build time. The final image is pure Nginx Alpine (~25MB) for frontend, and Node Alpine for backend. No dev dependencies in production.

**Non-root containers** — All pods run as non-root users. Combined with `readOnlyRootFilesystem` and dropped Linux capabilities for minimal attack surface.

**Redis pub/sub adapter** — Socket.io uses Redis as a message bus between pods. Scale the backend to 3 replicas and messages still reach every connected user.

**Graceful shutdown** — Backend handles `SIGTERM` (sent by Kubernetes before pod termination) to finish in-flight requests and close DB connections cleanly.

**Separate liveness vs readiness probes** — Liveness (`/api/health`) checks if the process is alive. Readiness (`/api/ready`) checks if it can serve traffic (DB connected). Kubernetes uses both independently.

---

## Author

Built by [@sharanch](https://github.com/sharanch) as a DevOps portfolio project.