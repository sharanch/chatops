# ── VCN ──────────────────────────────────────────────
resource "oci_core_vcn" "chatops_vcn" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = [var.vcn_cidr]
  display_name   = "${var.cluster_name}-vcn"
  dns_label      = "chatops"
}

# ── Internet Gateway ──────────────────────────────────
resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-igw"
  enabled        = true
}

# ── NAT Gateway (for private node egress) ────────────
resource "oci_core_nat_gateway" "nat" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-nat"
}

# ── Service Gateway ───────────────────────────────────
data "oci_core_services" "all_services" {}

resource "oci_core_service_gateway" "sgw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-sgw"

  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
}

# ── Route Tables ──────────────────────────────────────

# Public route table (for LB and API endpoint subnets)
resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

# Private route table (for worker node subnet)
resource "oci_core_route_table" "private_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.nat.id
  }

  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.sgw.id
  }
}

# ── Security Lists ────────────────────────────────────

# API endpoint security list
resource "oci_core_security_list" "api_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-api-sl"

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = var.node_subnet_cidr
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# Worker node security list
resource "oci_core_security_list" "node_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-node-sl"

  # Allow all intra-node traffic
  ingress_security_rules {
    protocol = "all"
    source   = var.node_subnet_cidr
  }

  # Allow LB to reach nodes
  ingress_security_rules {
    protocol = "6"
    source   = var.lb_subnet_cidr
  }

  # Allow API endpoint to reach nodes
  ingress_security_rules {
    protocol = "6"
    source   = var.api_subnet_cidr
  }

  # Allow NodePort range
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 30000
      max = 32767
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# Load balancer security list
resource "oci_core_security_list" "lb_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.chatops_vcn.id
  display_name   = "${var.cluster_name}-lb-sl"

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

# ── Subnets ───────────────────────────────────────────

# API endpoint subnet (public)
resource "oci_core_subnet" "api_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.chatops_vcn.id
  cidr_block        = var.api_subnet_cidr
  display_name      = "${var.cluster_name}-api-subnet"
  dns_label         = "apisubnet"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.api_sl.id]
}

# Worker node subnet (private)
resource "oci_core_subnet" "node_subnet" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.chatops_vcn.id
  cidr_block                 = var.node_subnet_cidr
  display_name               = "${var.cluster_name}-node-subnet"
  dns_label                  = "nodesubnet"
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private_rt.id
  security_list_ids          = [oci_core_security_list.node_sl.id]
}

# Load balancer subnet (public)
resource "oci_core_subnet" "lb_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.chatops_vcn.id
  cidr_block        = var.lb_subnet_cidr
  display_name      = "${var.cluster_name}-lb-subnet"
  dns_label         = "lbsubnet"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.lb_sl.id]
}
