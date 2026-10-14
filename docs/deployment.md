# Production AWS Cloud Deployment Architecture

This document outlines the production architecture for hosting the Jajal Medical Case Management web application on **Amazon Web Services (AWS)** adhering to healthcare security standards, HIPAA readiness, and high availability.

---

## 1. Network Topology (Amazon VPC)
- **Virtual Private Cloud (VPC):** Multi-AZ deployment across two Availability Zones (`us-east-1a`, `us-east-1b`) with isolated Public, Private Application, and Private Database subnets.
- **Internet Gateway (IGW) & NAT Gateways:** Public subnets route outbound traffic via IGW; private application subnets reach external APIs (e.g. Nager.Date holiday API) through high-availability NAT Gateways.

---

## 2. Infrastructure Components

### A. Compute: AWS EC2 / ECS Fargate
- **Application Servers:** EC2 instances (e.g., `t4g.medium` running Amazon Linux 2023 or containerized ECS Fargate tasks) placed strictly within **Private Application Subnets**.
- **Process Manager & Reverse Proxy:** Nginx configured as a reverse proxy forwarding requests to the Node/PHP application server managed by systemd or PM2.
- **Auto Scaling:** An Auto Scaling Group (ASG) scales compute capacity dynamically based on CPU utilization and target request latency.

### B. Database: AWS RDS for MySQL (Multi-AZ)
- **Managed MySQL 8.0:** Deployed in **Private Database Subnets** with Multi-AZ synchronous replication for automatic failover.
- **Security & Durability:** Automated daily snapshots retained for 30 days, encrypted at rest using AWS Key Management Service (`AWS KMS`), with automatic storage autoscaling.

### C. File Storage: Amazon S3
- **Implant Attachments & CAD Models:** Dedicated S3 bucket for patient-matched 3D STL implant models, CT DICOM scans, and surgical guides.
- **Encryption & Permissions:** Bucket configured with `Block Public Access`, default server-side encryption (`SSE-KMS`), and pre-signed temporary URLs (15-minute expiration) for authorized downloads.

---

## 3. Security Groups (Least Privilege Firewall Rules)
- **`sg-alb` (Application Load Balancer):**
  - Inbound: Ports `80` (HTTP redirect to HTTPS) and `443` (HTTPS) from `0.0.0.0/0`.
  - Outbound: Port `3000` to `sg-app`.
- **`sg-app` (EC2 / ECS Application instances):**
  - Inbound: Port `3000` strictly from `sg-alb` (no direct public internet ingress).
  - Outbound: Port `3306` to `sg-db`, Port `443` outbound to NAT Gateway.
- **`sg-db` (RDS MySQL Database):**
  - Inbound: Port `3306` strictly from `sg-app`.
  - Outbound: Deny all.

---

## 4. Secrets Management & HTTPS Enforcement
- **AWS Secrets Manager / Systems Manager Parameter Store:** Database connection credentials, JWT/Sanctum signing secrets, and third-party API keys are stored in encrypted parameter store secrets and injected into the container environment at boot time—never committed to source repositories.
- **HTTPS & TLS 1.3:** Managed Application Load Balancer terminates SSL with certificates issued and auto-renewed by **AWS Certificate Manager (ACM)**. Strict HTTP-to-HTTPS redirects and HTTP Strict Transport Security (`HSTS`) headers prevent downgrade attacks.
