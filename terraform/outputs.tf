output "cluster_id" {
  description = "OKE Cluster OCID"
  value       = oci_containerengine_cluster.chatops_cluster.id
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint"
  value       = oci_containerengine_cluster.chatops_cluster.endpoints[0].public_endpoint
}

output "cluster_name" {
  description = "Cluster name"
  value       = oci_containerengine_cluster.chatops_cluster.name
}

output "kubeconfig_command" {
  description = "Command to generate kubeconfig"
  value       = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.chatops_cluster.id} --file $HOME/.kube/config --region ${var.region} --token-version 2.0.0"
}

output "node_pool_id" {
  description = "Node Pool OCID"
  value       = oci_containerengine_node_pool.chatops_node_pool.id
}
