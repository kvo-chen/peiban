# AI陪伴机器人平台系统维护手册

## 1. 系统架构说明

### 1.1 整体架构

AI陪伴机器人平台采用前后端分离架构，主要包括以下组件：

- **前端**：基于React + TypeScript + Vite构建的单页应用
- **后端**：基于Express + TypeScript的RESTful API服务
- **数据库**：SQLite（开发环境）/ MySQL（生产环境）
- **缓存**：Redis
- **认证**：JWT + MFA
- **文档**：Swagger
- **负载均衡**：Nginx

### 1.2 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.x |
| 前端语言 | TypeScript | 5.x |
| 前端构建工具 | Vite | 5.x |
| UI组件库 | Ant Design | 5.x |
| 后端框架 | Express | 4.x |
| 后端语言 | TypeScript | 5.x |
| ORM | Sequelize | 6.x |
| 数据库 | SQLite/MySQL | 3.x/8.x |
| 缓存 | Redis | 7.x |
| 认证 | JWT + Speakeasy | 8.x |
| API文档 | Swagger | 5.x |
| 负载均衡 | Nginx | 1.24.x |

## 2. 部署文档

### 2.1 开发环境部署

#### 2.1.1 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Redis >= 7.x

#### 2.1.2 部署步骤

1. **克隆代码库**
   ```bash
   git clone <repository-url>
   cd ai-robot-platform
   ```

2. **安装后端依赖**
   ```bash
   cd ai-robot-backend
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑.env文件，配置数据库连接和其他参数
   ```

4. **启动后端服务**
   ```bash
   npm run dev
   ```

5. **安装前端依赖**
   ```bash
   cd ../ai-robot-frontend
   npm install
   ```

6. **启动前端服务**
   ```bash
   npm run dev
   ```

7. **访问应用**
   - 前端：http://localhost:5173
   - 后端API：http://localhost:3000/api
   - Swagger文档：http://localhost:3000/api-docs

### 2.2 生产环境部署

#### 2.2.1 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Redis >= 7.x
- MySQL >= 8.x
- Nginx >= 1.24.x

#### 2.2.2 部署步骤

1. **克隆代码库**
   ```bash
   git clone <repository-url>
   cd ai-robot-platform
   ```

2. **构建后端**
   ```bash
   cd ai-robot-backend
   npm install
   npm run build
   ```

3. **构建前端**
   ```bash
   cd ../ai-robot-frontend
   npm install
   npm run build
   ```

4. **配置Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 前端静态资源
       location / {
           root /path/to/ai-robot-frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # 后端API代理
       location /api {
           proxy_pass http://localhost:3000/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Swagger文档
       location /api-docs {
           proxy_pass http://localhost:3000/api-docs;
       }
   }
   ```

5. **启动Redis**
   ```bash
   redis-server
   ```

6. **启动后端服务**
   ```bash
   cd ai-robot-backend
   npm run start
   ```

## 3. 日常维护操作

### 3.1 数据库维护

#### 3.1.1 备份数据库

**SQLite**
```bash
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite
```

**MySQL**
```bash
mysqldump -u root -p robot_platform > robot_platform_backup_$(date +%Y%m%d).sql
```

#### 3.1.2 恢复数据库

**SQLite**
```bash
cp database_backup_$(date +%Y%m%d).sqlite database.sqlite
```

**MySQL**
```bash
mysql -u root -p robot_platform < robot_platform_backup_$(date +%Y%m%d).sql
```

### 3.2 日志管理

#### 3.2.1 查看后端日志

```bash
cd ai-robot-backend
npm run logs
```

#### 3.2.2 查看Nginx日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 3.3 服务管理

#### 3.3.1 重启后端服务

```bash
cd ai-robot-backend
npm run restart
```

#### 3.3.2 重启前端服务

```bash
cd ai-robot-frontend
npm run restart
```

#### 3.3.3 重启Redis

```bash
sudo systemctl restart redis-server
```

#### 3.3.4 重启Nginx

```bash
sudo systemctl restart nginx
```

## 4. 常见故障排查流程

### 4.1 系统无法访问

#### 4.1.1 检查步骤

1. **检查前端服务状态**
   ```bash
   cd ai-robot-frontend
   npm run status
   ```

2. **检查后端服务状态**
   ```bash
   cd ai-robot-backend
   npm run status
   ```

3. **检查Nginx服务状态**
   ```bash
sudo systemctl status nginx
```

4. **检查Redis服务状态**
   ```bash
sudo systemctl status redis-server
```

5. **检查数据库连接**
   ```bash
   # SQLite
   sqlite3 database.sqlite .tables
   
   # MySQL
   mysql -u root -p -e "SHOW DATABASES;"
   ```

#### 4.1.2 解决方案

- **前端服务异常**：重新启动前端服务
- **后端服务异常**：查看后端日志，定位错误原因
- **Nginx服务异常**：查看Nginx错误日志，修复配置问题
- **Redis服务异常**：重新启动Redis服务
- **数据库连接异常**：检查数据库配置和服务状态

### 4.2 API响应缓慢

#### 4.2.1 检查步骤

1. **检查数据库查询性能**
   ```bash
   # MySQL
   mysql -u root -p -e "SHOW PROCESSLIST;"
   ```

2. **检查Redis缓存状态**
   ```bash
   redis-cli ping
   redis-cli info stats
   ```

3. **检查系统资源使用情况**
   ```bash
   top
   ```

#### 4.2.2 解决方案

- **数据库查询慢**：优化SQL查询，添加适当索引
- **Redis缓存问题**：检查缓存命中率，调整缓存策略
- **系统资源不足**：增加服务器资源，或优化代码性能

### 4.3 认证失败

#### 4.3.1 检查步骤

1. **检查JWT配置**
   ```bash
   cat ai-robot-backend/.env | grep JWT
   ```

2. **检查MFA配置**
   ```bash
   cat ai-robot-backend/.env | grep MFA
   ```

3. **检查用户状态**
   ```bash
   # MySQL
   mysql -u root -p -e "SELECT * FROM users WHERE id = <user-id>;"
   ```

#### 4.3.2 解决方案

- **JWT配置问题**：检查JWT密钥和过期时间配置
- **MFA配置问题**：检查MFA密钥配置
- **用户状态异常**：检查用户是否被禁用

### 4.4 设备连接异常

#### 4.4.1 检查步骤

1. **检查设备状态**
   ```bash
   # MySQL
   mysql -u root -p -e "SELECT * FROM devices WHERE id = <device-id>;"
   ```

2. **检查设备动作绑定**
   ```bash
   # MySQL
   mysql -u root -p -e "SELECT * FROM device_actions WHERE device_id = <device-id>;"
   ```

3. **检查AI对话服务**
   ```bash
   curl http://localhost:3000/api/health
   ```

#### 4.4.2 解决方案

- **设备状态异常**：检查设备连接配置
- **设备动作绑定问题**：重新绑定设备动作
- **AI对话服务异常**：检查AI服务配置和状态

## 5. 监控与告警

### 5.1 系统监控

#### 5.1.1 监控指标

- **CPU使用率**
- **内存使用率**
- **磁盘空间**
- **网络流量**
- **API响应时间**
- **数据库查询时间**
- **Redis缓存命中率**
- **系统错误率**

#### 5.1.2 监控工具

建议使用以下监控工具：
- **Prometheus** + **Grafana**：系统指标监控
- **ELK Stack**：日志管理和分析
- **New Relic**：应用性能监控

### 5.2 告警机制

#### 5.2.1 告警类型

- **系统资源告警**：CPU、内存、磁盘空间超过阈值
- **服务可用性告警**：服务停止或响应超时
- **数据库异常告警**：数据库连接失败、查询缓慢
- **API异常告警**：API响应时间超过阈值、错误率增加
- **安全告警**：异常登录、异常操作

#### 5.2.2 告警方式

- **邮件告警**
- **短信告警**
- **Slack/Teams告警**
- **电话告警**

## 6. 安全维护

### 6.1 定期安全检查

1. **系统漏洞扫描**
   - 使用Nessus或OpenVAS进行系统漏洞扫描
   - 定期更新系统和软件补丁

2. **代码安全审计**
   - 使用SonarQube或Snyk进行代码安全审计
   - 定期检查依赖包的安全漏洞

3. **日志审计**
   - 定期检查系统日志和操作日志
   - 关注异常登录和异常操作

### 6.2 数据安全

1. **数据备份策略**
   - 定期备份数据库（建议每天备份）
   - 备份数据存储在安全位置
   - 定期测试数据恢复流程

2. **数据加密**
   - 传输数据采用HTTPS加密
   - 敏感数据存储采用AES-256加密
   - 定期更换加密密钥

## 7. 版本更新与回滚

### 7.1 版本更新流程

1. **测试环境验证**
   - 在测试环境部署新版本
   - 执行回归测试和功能测试

2. **灰度发布**
   - 将新版本部署到部分生产服务器
   - 监控系统运行状态
   - 逐步扩大部署范围

3. **全量发布**
   - 将新版本部署到所有生产服务器
   - 监控系统运行状态

### 7.2 回滚方案

#### 7.2.1 触发条件

- 系统出现严重故障
- 核心功能不可用
- 错误率超过阈值（如5%）
- 用户投诉急剧增加

#### 7.2.2 回滚步骤

1. **停止新版本服务**
   ```bash
   cd ai-robot-backend
   npm run stop
   ```

2. **恢复旧版本代码**
   ```bash
   git checkout <old-version-tag>
   ```

3. **恢复旧版本数据库**
   ```bash
   # MySQL
   mysql -u root -p robot_platform < robot_platform_backup_<old-date>.sql
   ```

4. **重启服务**
   ```bash
   cd ai-robot-backend
   npm run start
   ```

5. **验证系统状态**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 8. 联系方式

### 8.1 技术支持

- **邮箱**：support@ai-robot-platform.com
- **电话**：+86-123-4567-8910
- **工单系统**：https://support.ai-robot-platform.com

### 8.2 紧急联系人

| 姓名 | 职位 | 联系方式 |
|------|------|----------|
| 张三 | 系统架构师 | 138-0000-0001 |
| 李四 | 后端开发工程师 | 138-0000-0002 |
| 王五 | 前端开发工程师 | 138-0000-0003 |

---

**版本**：1.0.0
**生效日期**：2025-12-25
**更新记录**：
- 2025-12-25：初始版本
