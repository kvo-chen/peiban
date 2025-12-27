import swaggerJSDoc from 'swagger-jsdoc';

// Swagger配置选项
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI陪伴机器人API文档',
      version: '1.0.0',
      description: 'AI陪伴机器人平台的RESTful API文档，基于OpenAPI 3.0规范。提供设备管理、动作控制、AI对话、数据分析等功能。',
      contact: {
        name: '开发团队',
        email: 'contact@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: '开发环境'
      },
      {
        url: 'http://localhost:3000/api',
        description: '测试环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: '用户ID'
            },
            username: {
              type: 'string',
              description: '用户名'
            },
            email: {
              type: 'string',
              description: '邮箱'
            },
            phone: {
              type: 'string',
              description: '手机号'
            },
            role_id: {
              type: 'integer',
              description: '角色ID'
            },
            status: {
              type: 'string',
              enum: ['active', 'disabled'],
              description: '用户状态'
            }
          }
        },
        Device: {
          type: 'object',
          required: ['device_name', 'device_type'],
          properties: {
            id: {
              type: 'integer',
              description: '设备ID'
            },
            device_name: {
              type: 'string',
              description: '设备名称'
            },
            device_type: {
              type: 'string',
              description: '设备类型'
            },
            status: {
              type: 'string',
              enum: ['online', 'offline'],
              description: '设备状态'
            }
          }
        },
        Action: {
          type: 'object',
          required: ['name', 'type', 'description', 'duration', 'steps'],
          properties: {
            id: {
              type: 'integer',
              description: '动作ID'
            },
            name: {
              type: 'string',
              description: '动作名称'
            },
            type: {
              type: 'string',
              enum: ['basic', 'custom', 'combination'],
              description: '动作类型'
            },
            description: {
              type: 'string',
              description: '动作描述'
            },
            duration: {
              type: 'number',
              description: '动作持续时间（秒）'
            },
            steps: {
              oneOf: [
                {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: '动作步骤（基本动作）'
                },
                {
                  type: 'array',
                  items: {
                    type: 'integer'
                  },
                  description: '动作步骤（动作组合）'
                }
              ]
            }
          }
        },
        DeviceAction: {
          type: 'object',
          required: ['device_id', 'action_id', 'prompt'],
          properties: {
            id: {
              type: 'integer',
              description: '设备动作映射ID'
            },
            device_id: {
              type: 'integer',
              description: '设备ID'
            },
            action_id: {
              type: 'integer',
              description: '动作ID'
            },
            prompt: {
              type: 'string',
              description: '触发动作的自然语言提示'
            }
          }
        },
        Conversation: {
          type: 'object',
          required: ['user_id', 'device_id', 'message'],
          properties: {
            id: {
              type: 'integer',
              description: '对话ID'
            },
            user_id: {
              type: 'integer',
              description: '用户ID'
            },
            device_id: {
              type: 'integer',
              description: '设备ID'
            },
            message: {
              type: 'string',
              description: '用户消息'
            },
            response: {
              type: 'string',
              description: 'AI响应'
            },
            action_triggered: {
              type: 'integer',
              description: '触发的动作ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            }
          }
        },
        DeviceGroup: {
          type: 'object',
          required: ['name', 'user_id'],
          properties: {
            id: {
              type: 'integer',
              description: '设备分组ID'
            },
            name: {
              type: 'string',
              description: '分组名称'
            },
            user_id: {
              type: 'integer',
              description: '用户ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            }
          }
        }
      }
    }
  },
  apis: ['src/routes/*.ts'] // 指定API路由文件位置
};

// 生成Swagger文档
const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;