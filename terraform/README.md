# ChatOps — OCI Free Tier k3s Cluster

Provisions 2 Always Free VMs on OCI and installs k3s (lightweight Kubernetes).

## Architecture
```
OCI Always Free (2x VM.Standard.A1.Flex ARM)
├── chatops-k3s-server  (2 OCPU, 12GB) — control plane + workloads
└── chatops-k3s-agent   (2 OCPU, 12GB) — worker node
```

## Always Free limits used
- 4 ARM OCPUs total (2 per VM) ✅
- 24GB RAM total (12GB per VM) ✅
- No load balancer needed (Cloudflare Tunnel) ✅

## Prerequisites
- OCI account
- SSH key pair (`~/.ssh/id_rsa` + `~/.ssh/id_rsa.pub`)
- Terraform >= 1.3.0
- OCI CLI configured

## Usage

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096

# Copy and fill in your values
cp terraform.tfvars.example terraform.tfvars

# Deploy
terraform init
terraform apply   # ~3 minutes

# Get kubeconfig (from outputs)
scp opc@<server-ip>:/etc/rancher/k3s/k3s.yaml ~/.kube/k3s-config
sed -i 's/127.0.0.1/<server-ip>/g' ~/.kube/k3s-config
export KUBECONFIG=~/.kube/k3s-config

# Verify nodes
kubectl get nodes

# Install ArgoCD + deploy ChatOps
./argocd/bootstrap.sh
```

## After deployment

SSH into server and run Cloudflare tunnel:
```bash
ssh opc@<server-ip>
cloudflared tunnel run chatops
```

App available at: https://chatops.sharanch.dev
