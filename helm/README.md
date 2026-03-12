# ChatOps — Helm Chart

Packages the entire ChatOps 3-tier app for Kubernetes deployment.

## Prerequisites

- Minikube running with ingress addon enabled
- Helm 3.x installed
- Docker images built into Minikube's registry

## Quick Start (Minikube)

```bash
# 1. Start Minikube with ingress
minikube start
minikube addons enable ingress

# 2. Point Docker to Minikube's registry
eval $(minikube docker-env)

# 3. Build images inside Minikube
docker build -t chatops-frontend:latest ./frontend
docker build -t chatops-backend:latest ./backend

# 4. Install the chart
helm install chatops ./helm/chatops -f helm/values-dev.yaml -n chatops --create-namespace

# 5. Add host entry
echo "$(minikube ip) chatops.local" | sudo tee -a /etc/hosts

# 6. Open in browser
open http://chatops.local
```

## Useful Commands

```bash
# Check status
helm status chatops -n chatops
kubectl get all -n chatops

# Upgrade after changes
helm upgrade chatops ./helm/chatops -f helm/values-dev.yaml -n chatops

# Uninstall (keeps PVC and Secret due to resource-policy: keep)
helm uninstall chatops -n chatops

# Lint the chart
helm lint ./helm/chatops

# Dry run (see what would be deployed)
helm install chatops ./helm/chatops -f helm/values-dev.yaml --dry-run --debug
```

## Chart Structure

```
helm/
├── chatops/
│   ├── Chart.yaml
│   ├── values.yaml              # Default values
│   ├── templates/
│   │   ├── _helpers.tpl         # Reusable label helpers
│   │   ├── namespace.yaml
│   │   ├── secrets.yaml
│   │   ├── ingress.yaml
│   │   ├── frontend/            # Deployment + Service
│   │   ├── backend/             # Deployment + Service
│   │   ├── postgres/            # Deployment + Service + PVC
│   │   └── redis/               # Deployment + Service
└── values-dev.yaml              # Minikube overrides
```
