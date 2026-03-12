# 1. Start Minikube
minikube start
minikube addons enable ingress

# 2. Bootstrap ArgoCD
./argocd/bootstrap.sh

# 3. Fix CoreDNS
kubectl edit configmap coredns -n kube-system
# forward . 8.8.8.8 8.8.4.4
kubectl rollout restart deployment/coredns -n kube-system

# 4. Start tunnel
nohup cloudflared tunnel run chatops > /tmp/cloudflared.log 2>&1 &