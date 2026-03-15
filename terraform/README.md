# ChatOps — OCI OKE Terraform

Provisions a free OKE (Oracle Kubernetes Engine) cluster on OCI Always Free tier.

## What gets created

- VCN with 3 subnets (API endpoint, worker nodes, load balancer)
- Internet Gateway, NAT Gateway, Service Gateway
- Security lists for each subnet
- OKE Basic Cluster (free tier)
- Node pool with 2x VM.Standard.E2.1.Micro nodes (Always Free)

## Prerequisites

- OCI account with Always Free tier
- OCI CLI installed and configured
- Terraform >= 1.3.0

## Usage

```bash
# 1. Copy and fill in your values
cp terraform.tfvars.example terraform.tfvars

# 2. Initialize
terraform init

# 3. Preview
terraform plan

# 4. Apply
terraform apply

# 5. Generate kubeconfig (use the output command)
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-id> \
  --file $HOME/.kube/config \
  --region ap-hyderabad-1 \
  --token-version 2.0.0

# 6. Verify
kubectl get nodes
```

## After cluster is ready

Deploy ChatOps using the same ArgoCD + Helm approach:

```bash
# Install ArgoCD
./argocd/bootstrap.sh

# Create GHCR secret (if images are private)
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=sharanch \
  --docker-password=YOUR_PAT \
  -n chatops

# ArgoCD will auto-sync and deploy everything
```

## Destroy

```bash
terraform destroy
```
