# Production Deployment Guide

## Copyright (c) 2025 kk

This software is released under the MIT License.
https://opensource.org/licenses/MIT

## Overview

This guide explains how to deploy Video Manager in a production environment using Docker Compose.

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- At least 4GB of available RAM
- At least 10GB of available disk space
- A domain name (optional, for production use)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd video-manager
```

### 2. Configure Environment Variables

Copy the example environment file and update with your production values:

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and update the following critical values:

- `POSTGRES_PASSWORD`: Use a strong, unique password
- `JWT_SECRET`: Generate a strong random secret (e.g., `openssl rand -base64 32`)
- `ADMIN_PASSWORD`: Set a strong password for the admin account
- `SWAGGER_HOST`: Set to your domain if you want Swagger to use a specific host

### 3. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Verify Deployment

Check service status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

View logs:

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 5. Access the Application

- Frontend: http://localhost (or your configured port)
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost/swagger/index.html

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `videomanager` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `StrongPassword123!` |
| `POSTGRES_DB` | Database name | `videomanager` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `StrongPassword123!` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `API_PORT` | Backend API port | `8080` |
| `FRONTEND_PORT` | Frontend port | `80` |
| `GIN_MODE` | Gin mode (debug/release) | `release` |
| `LOG_LEVEL` | Log level (DEBUG/INFO/WARN/ERROR) | `INFO` |
| `LOG_FORMAT` | Log format (text/json) | `json` |
| `SWAGGER_HOST` | Swagger host (empty for auto-detect) | `` |

## Production Considerations

### Security

1. **Change Default Passwords**: Never use default passwords in production
2. **Use Strong Secrets**: Generate strong random secrets for `JWT_SECRET`
3. **Enable HTTPS**: Use a reverse proxy (nginx/traefik) with SSL certificates
4. **Firewall**: Only expose necessary ports (80, 443, 8080)
5. **Database Security**: Use strong database passwords and consider network isolation

### Performance

1. **Resource Limits**: Adjust CPU and memory limits in `docker-compose.prod.yml` based on your needs
2. **Database Optimization**: Configure PostgreSQL for your workload
3. **Caching**: Consider adding Redis for caching if needed
4. **CDN**: Use a CDN for static assets in high-traffic scenarios

### Monitoring

1. **Logs**: Configure log aggregation (ELK, Loki, etc.)
2. **Metrics**: Add Prometheus/Grafana for metrics collection
3. **Health Checks**: Use the built-in health check endpoints
4. **Backups**: Set up regular database backups

### Backup and Recovery

#### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U videomanager videomanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U videomanager videomanager < backup.sql
```

#### Automated Backups

Set up a cron job or scheduled task to run backups regularly:

```bash
# Example cron job (daily at 2 AM)
0 2 * * * cd /path/to/video-manager && docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U videomanager videomanager > /backups/videomanager_$(date +\%Y\%m\%d).sql
```

## Updating the Application

### Update Process

1. **Pull Latest Changes**:
   ```bash
   git pull
   ```

2. **Rebuild Images**:
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

3. **Stop Services**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

4. **Start Services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Verify**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Zero-Downtime Updates

For zero-downtime updates, consider:

1. Using a load balancer with multiple backend instances
2. Blue-green deployment strategy
3. Rolling updates with Docker Swarm or Kubernetes

## Troubleshooting

### Services Won't Start

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables: `docker-compose -f docker-compose.prod.yml config`
3. Check port conflicts: `netstat -tulpn | grep -E '80|8080|5432'`
4. Verify Docker resources: `docker system df`

### Database Connection Issues

1. Check PostgreSQL logs: `docker-compose -f docker-compose.prod.yml logs postgres`
2. Verify database credentials in `.env.prod`
3. Check network connectivity: `docker-compose -f docker-compose.prod.yml exec backend ping postgres`

### Frontend Not Loading

1. Check frontend logs: `docker-compose -f docker-compose.prod.yml logs frontend`
2. Verify nginx configuration
3. Check backend connectivity: `curl http://localhost:8080/api/health`

### Performance Issues

1. Check resource usage: `docker stats`
2. Review application logs for errors
3. Check database performance: `docker-compose -f docker-compose.prod.yml exec postgres psql -U videomanager -c "SELECT * FROM pg_stat_activity;"`

## Health Checks

All services include health checks:

- **Backend**: `http://localhost:8080/health` (if implemented)
- **Frontend**: `http://localhost/health`
- **PostgreSQL**: Internal health check via `pg_isready`

## Scaling

### Horizontal Scaling

To scale services:

```bash
# Scale backend (requires load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend (requires load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

Note: Horizontal scaling requires a load balancer (nginx, traefik, etc.) in front of the services.

## Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services

```bash
# Stop (keeps volumes)
docker-compose -f docker-compose.prod.yml stop

# Stop and remove containers (keeps volumes)
docker-compose -f docker-compose.prod.yml down

# Stop and remove everything including volumes (WARNING: deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

## Support

For issues and questions:
- Check the logs first
- Review this documentation
- Check GitHub issues
- Contact the development team

