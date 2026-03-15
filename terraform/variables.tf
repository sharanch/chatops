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
  default     = "ap-mumbai-1"
}

variable "compartment_ocid" {
  description = "OCI Compartment OCID"
  type        = string
}

variable "availability_domain" {
  description = "Availability Domain"
  type        = string
  default     = "tFOd:AP-MUMBAI-1-AD-1"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "instance_shape" {
  description = "Always Free shape. ARM: VM.Standard.A1.Flex | AMD: VM.Standard.E2.1.Micro"
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "instance_ocpus" {
  description = "OCPUs per instance (only for Flex shapes)"
  type        = number
  default     = 1
}

variable "instance_memory_gbs" {
  description = "Memory per instance in GB (only for Flex shapes)"
  type        = number
  default     = 1
}

variable "vcn_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}
