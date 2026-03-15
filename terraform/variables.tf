variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "OCI API Key Fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key"
  type        = string
}

variable "region" {
  description = "OCI Region"
  type        = string
  default     = "ap-hyderabad-1"
}

variable "compartment_ocid" {
  description = "OCI Compartment OCID (use tenancy OCID for root)"
  type        = string
}

variable "availability_domain" {
  description = "Availability Domain"
  type        = string
  default     = "mIrk:AP-HYDERABAD-1-AD-1"
}

variable "cluster_name" {
  description = "OKE Cluster name"
  type        = string
  default     = "chatops-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "v1.32.1"
}

variable "node_shape" {
  description = "Compute shape for worker nodes (Always Free = VM.Standard.E2.1.Micro)"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "node_count" {
  description = "Number of worker nodes (Always Free allows 2)"
  type        = number
  default     = 2
}

variable "vcn_cidr" {
  description = "VCN CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "node_subnet_cidr" {
  description = "Worker node subnet CIDR"
  type        = string
  default     = "10.0.1.0/24"
}

variable "lb_subnet_cidr" {
  description = "Load balancer subnet CIDR"
  type        = string
  default     = "10.0.2.0/24"
}

variable "api_subnet_cidr" {
  description = "Kubernetes API endpoint subnet CIDR"
  type        = string
  default     = "10.0.3.0/24"
}
