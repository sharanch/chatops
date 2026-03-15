# ── VCN ──────────────────────────────────────────────
resource "oci_core_vcn" "chatops_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "chatops-vcn"
  dns_label      = "chatops"
}

# ── Internet Gateway ──────────────────────────────────
resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "chatops-igw"
  enabled        = true
}

# ── Route Table ───────────────────────────────────────
resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "chatops-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

# ── Security List ─────────────────────────────────────
resource "oci_core_security_list" "chatops_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "chatops-sl"

  # SSH
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # k3s API server
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # NodePort range
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 30000
      max = 32767
    }
  }

  # All internal traffic between nodes
  ingress_security_rules {
    protocol = "all"
    source   = var.subnet_cidr
  }

  # Allow all egress
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# ── Public Subnet ─────────────────────────────────────
resource "oci_core_subnet" "public_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.chatops_vcn.id
  cidr_block        = var.subnet_cidr
  display_name      = "chatops-public-subnet"
  dns_label         = "chatops"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.chatops_sl.id]
}
