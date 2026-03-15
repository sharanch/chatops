#!/usr/bin/env bash
# ════════════════════════════════════════════════════════
# ArgoCD Bootstrap Script
# Installs ArgoCD on Minikube and sets up the ChatOps app
#
# Usage:
#   chmod +x argocd/bootstrap.sh
#   ./argocd/bootstrap.sh
# ════════════════════════════════════════════════════════
set -euo pipefail

ARGOCD_VERSION="v2.10.0"
ARGOCD_NAMESPACE="argocd"
APP_NAMESPACE="chatops"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   ChatOps — ArgoCD Bootstrap         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ────────────────────────────
echo "▶ Checking prerequisites..."
command -v kubectl &>/dev/null || { echo "❌ kubectl not found"; exit 1; }
command -v helm    &>/dev/null || { echo "❌ helm not found";    exit 1; }

# Check Minikube is running
kubectl cluster-info &>/dev/null || { echo "❌ No K8s cluster found — run: minikube start"; exit 1; }
echo "✅ Prerequisites OK"

# ── 2. Enable Minikube ingress addon ─────────────────
echo ""
echo "▶ Enabling Minikube ingress addon..."
minikube addons enable ingress
echo "✅ Ingress addon enabled"

# ── 3. Install ArgoCD ─────────────────────────────────
echo ""
echo "▶ Installing ArgoCD ${ARGOCD_VERSION}..."
kubectl create namespace ${ARGOCD_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n ${ARGOCD_NAMESPACE} \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml

# ── 4. Wait for ArgoCD to be ready ───────────────────
echo ""
echo "▶ Waiting for ArgoCD pods to be ready (this takes ~2 min)..."
kubectl wait --for=condition=available deployment/argocd-server \
  -n ${ARGOCD_NAMESPACE} \
  --timeout=300s
echo "✅ ArgoCD is ready"

# ── 5. Apply AppProject + Application ────────────────
echo ""
echo "▶ Applying ArgoCD AppProject and Application..."
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application.yaml
echo "✅ ArgoCD Application created"

# ── 6. Get initial admin password ────────────────────
echo ""
echo "▶ Fetching initial admin password..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ArgoCD Login Details                       ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   URL:      https://localhost:8080           ║"
echo "║   Username: admin                            ║"
echo "║   Password: ${ARGOCD_PASSWORD}              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 7. Port-forward ArgoCD UI ────────────────────────
echo "▶ Starting port-forward for ArgoCD UI..."
echo "   Press Ctrl+C to stop"
echo ""
echo "   Open: https://localhost:8080"
echo ""
kubectl port-forward svc/argocd-server -n ${ARGOCD_NAMESPACE} 8080:443