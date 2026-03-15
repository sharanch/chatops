output "k3s_server_public_ip" {
  description = "k3s server public IP — SSH and kubectl endpoint"
  value       = oci_core_instance.k3s_server.public_ip
}

output "k3s_agent_public_ip" {
  description = "k3s agent public IP"
  value       = oci_core_instance.k3s_agent.public_ip
}

output "ssh_server_command" {
  description = "SSH into k3s server"
  value       = "ssh opc@${oci_core_instance.k3s_server.public_ip}"
}

output "kubeconfig_command" {
  description = "Copy kubeconfig from server to local machine"
  value       = "scp opc@${oci_core_instance.k3s_server.public_ip}:/etc/rancher/k3s/k3s.yaml ~/.kube/k3s-config && sed -i 's/127.0.0.1/${oci_core_instance.k3s_server.public_ip}/g' ~/.kube/k3s-config"
}

output "cloudflared_command" {
  description = "Run Cloudflare tunnel on the server"
  value       = "ssh opc@${oci_core_instance.k3s_server.public_ip} 'nohup cloudflared tunnel run chatops > /tmp/cloudflared.log 2>&1 &'"
}
