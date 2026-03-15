# ── Get latest Oracle Linux 8 ARM image ──────────────
data "oci_core_images" "oracle_linux_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Oracle Linux"
  operating_system_version = "8"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# ── k3s Server (control plane) ────────────────────────
resource "oci_core_instance" "k3s_server" {
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  display_name        = "chatops-k3s-server"
  shape               = var.instance_shape

  dynamic "shape_config" {
    for_each = var.instance_shape == "VM.Standard.A1.Flex" ? [1] : []
    content {
      ocpus         = var.instance_ocpus
      memory_in_gbs = var.instance_memory_gbs
    }
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.oracle_linux_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    display_name     = "chatops-k3s-server-vnic"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data           = base64encode(local.k3s_server_userdata)
  }
}

# ── k3s Agent (worker node) ───────────────────────────
resource "oci_core_instance" "k3s_agent" {
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  display_name        = "chatops-k3s-agent"
  shape               = var.instance_shape

  dynamic "shape_config" {
    for_each = var.instance_shape == "VM.Standard.A1.Flex" ? [1] : []
    content {
      ocpus         = var.instance_ocpus
      memory_in_gbs = var.instance_memory_gbs
    }
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.oracle_linux_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    display_name     = "chatops-k3s-agent-vnic"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data           = base64encode(local.k3s_agent_userdata)
  }

  # Wait for server to be ready first
  depends_on = [oci_core_instance.k3s_server]
}

# ── Cloud-init scripts ────────────────────────────────
locals {
  k3s_server_userdata = <<-EOT
    #!/bin/bash
    # Disable firewall (security list handles it)
    systemctl stop firewalld
    systemctl disable firewalld

    # Install k3s server
    curl -sfL https://get.k3s.io | sh -s - server \
      --disable traefik \
      --write-kubeconfig-mode 644

    # Wait for k3s to start
    sleep 30

    # Save token for agent
    cat /var/lib/rancher/k3s/server/node-token > /tmp/k3s-token
  EOT

  k3s_agent_userdata = <<-EOT
    #!/bin/bash
    # Disable firewall
    systemctl stop firewalld
    systemctl disable firewalld

    # Wait for server to be ready
    sleep 60

    # Install k3s agent
    curl -sfL https://get.k3s.io | K3S_URL=https://${oci_core_instance.k3s_server.private_ip}:6443 \
      K3S_TOKEN=$(ssh -o StrictHostKeyChecking=no opc@${oci_core_instance.k3s_server.private_ip} cat /var/lib/rancher/k3s/server/node-token) \
      sh -
  EOT
}
