# ChatOps — ArgoCD GitOps Setup

ArgoCD watches the `helm/chatops` directory in git. Every time `values.yaml` changes (triggered by GitHub Actions CD), ArgoCD automatically syncs the new state to Minikube.

## The GitOps Flow

```
Developer pushes code
       │
       ▼
GitHub Actions CI
  lint → test → build → push image to GHCR
       │
       ▼
GitHub Actions CD
  updates image tag in helm/values.yaml
  commits + pushes back to main
       │
       ▼
ArgoCD detects git change (polls every 3 min)
       │
       ▼
ArgoCD syncs Helm chart to Minikube
       │
       ▼
New pods rolling out ✅
```

## Quick Start

```bash
# 1. Update your repo URL in both YAML files first, if you wish to fork the repo and make changes
sed -i 's/YOUR_GITHUB_USERNAME/youractualusername/g' argocd/application.yaml
sed -i 's/YOUR_GITHUB_USERNAME/youractualusername/g' argocd/project.yaml

# 2. Run the bootstrap script
chmod +x argocd/bootstrap.sh
./argocd/bootstrap.sh
```

## Manual Steps (if you prefer step by step)

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.10.0/manifests/install.yaml

# Wait for it
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=300s

# Apply our app config
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080
```

## Useful ArgoCD Commands

```bash
# Install ArgoCD CLI
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd && sudo mv argocd /usr/local/bin/

# Login via CLI
argocd login localhost:8080 --username admin --password <password> --insecure

# Check app status
argocd app get chatops

# Manual sync (force)
argocd app sync chatops

# View sync history
argocd app history chatops

# Rollback to previous version
argocd app rollback chatops

# Watch live sync
argocd app wait chatops --sync
```

## Key Concepts

**selfHeal: true** — if someone runs `kubectl edit deployment chatops-backend` manually, ArgoCD will revert it back to what's in git within minutes. Git is always the source of truth.

**prune: true** — if you remove a resource from the Helm chart, ArgoCD will delete it from the cluster. Without this, old resources accumulate.

**AppProject** — acts as a security boundary. The chatops project can ONLY deploy to the `chatops` namespace from the chatops repo. It can't accidentally touch other namespaces.

**revisionHistoryLimit: 5** — ArgoCD keeps the last 5 deployed versions, so you can one-click rollback to any of them from the UI.