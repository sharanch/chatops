# ── Node Pool ─────────────────────────────────────────

# Get latest OKE-compatible Oracle Linux image
data "oci_containerengine_node_pool_option" "node_pool_options" {
  node_pool_option_id = oci_containerengine_cluster.chatops_cluster.id
}

resource "oci_containerengine_node_pool" "chatops_node_pool" {
  cluster_id         = oci_containerengine_cluster.chatops_cluster.id
  compartment_id     = var.compartment_ocid
  kubernetes_version = var.kubernetes_version
  name               = "${var.cluster_name}-nodepool"

  # Always Free shape — VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
  node_shape = var.node_shape

  node_shape_config {
    memory_in_gbs = 6
    ocpus         = 1
  }

  node_source_details {
    image_id    = data.oci_containerengine_node_pool_option.node_pool_options.sources[0].image_id
    source_type = "IMAGE"
  }

  node_config_details {
    size = var.node_count

    placement_configs {
      availability_domain = var.availability_domain
      subnet_id           = oci_core_subnet.node_subnet.id
    }
  }

  initial_node_labels {
    key   = "app"
    value = "chatops"
  }
}
