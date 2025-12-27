import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Select, 
  Button, 
  Typography, 
  DatePicker, 
  Space,
  Spin
} from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DataAnalysis: React.FC = () => {
  // 图表引用
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  
  // 图表实例
  const [barChart, setBarChart] = useState<echarts.ECharts | null>(null);
  const [lineChart, setLineChart] = useState<echarts.ECharts | null>(null);
  const [pieChart, setPieChart] = useState<echarts.ECharts | null>(null);
  
  // 查询条件
  const [form] = Form.useForm();
  const [chartType, setChartType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  
  // 模拟数据
  const mockData = {
    deviceStats: [
      { name: '设备A', onlineHours: 120, totalActions: 500 },
      { name: '设备B', onlineHours: 90, totalActions: 350 },
      { name: '设备C', onlineHours: 150, totalActions: 600 },
      { name: '设备D', onlineHours: 80, totalActions: 280 },
      { name: '设备E', onlineHours: 110, totalActions: 420 }
    ],
    dailyStats: [
      { date: '2025-12-01', actions: 80 },
      { date: '2025-12-02', actions: 120 },
      { date: '2025-12-03', actions: 150 },
      { date: '2025-12-04', actions: 90 },
      { date: '2025-12-05', actions: 110 },
      { date: '2025-12-06', actions: 140 },
      { date: '2025-12-07', actions: 160 }
    ],
    actionTypeStats: [
      { name: '前进', value: 200 },
      { name: '后退', value: 150 },
      { name: '左转', value: 120 },
      { name: '右转', value: 100 },
      { name: '停止', value: 80 },
      { name: '其他', value: 50 }
    ]
  };
  
  // 初始化图表
  useEffect(() => {
    if (barChartRef.current) {
      const chart = echarts.init(barChartRef.current);
      setBarChart(chart);
    }
    
    if (lineChartRef.current) {
      const chart = echarts.init(lineChartRef.current);
      setLineChart(chart);
    }
    
    if (pieChartRef.current) {
      const chart = echarts.init(pieChartRef.current);
      setPieChart(chart);
    }
    
    // 监听窗口大小变化，调整图表大小
    const handleResize = () => {
      barChart?.resize();
      lineChart?.resize();
      pieChart?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      barChart?.dispose();
      lineChart?.dispose();
      pieChart?.dispose();
    };
  }, [barChart, lineChart, pieChart]);
  
  // 更新图表数据
  useEffect(() => {
    // 图表主题颜色
    const colors = [
      '#6366f1', // 主色
      '#10b981', // 成功色
      '#f59e0b', // 警告色
      '#ef4444', // 错误色
      '#3b82f6', // 信息色
      '#8b5cf6', // 紫色
      '#ec4899'  // 粉色
    ];
    
    // 柱状图配置
    const barOption = {
      title: {
        text: '设备在线时长与动作次数',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: 'var(--color-text-tertiary)'
          }
        },
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: 'var(--color-text-primary)'
        }
      },
      legend: {
        data: ['在线时长(小时)', '动作次数'],
        top: 30,
        textStyle: {
          color: 'var(--color-text-secondary)'
        },
        backgroundColor: 'var(--color-bg-light)',
        borderRadius: 8,
        padding: [8, 16]
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        backgroundColor: 'var(--color-bg)'
      },
      xAxis: [
        {
          type: 'category',
          data: mockData.deviceStats.map(item => item.name),
          axisPointer: {
            type: 'shadow'
          },
          axisLine: {
            lineStyle: {
              color: 'var(--color-border)'
            }
          },
          axisLabel: {
            color: 'var(--color-text-secondary)'
          },
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '在线时长(小时)',
          min: 0,
          max: 200,
          interval: 50,
          axisLine: {
            lineStyle: {
              color: 'var(--color-border)'
            }
          },
          axisLabel: {
            color: 'var(--color-text-secondary)'
          },
          splitLine: {
            lineStyle: {
              color: 'var(--color-border)',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: '动作次数',
          min: 0,
          max: 700,
          interval: 100,
          axisLine: {
            lineStyle: {
              color: 'var(--color-border)'
            }
          },
          axisLabel: {
            color: 'var(--color-text-secondary)'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '在线时长(小时)',
          type: 'bar',
          data: mockData.deviceStats.map(item => item.onlineHours),
          itemStyle: {
            color: colors[0],
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: colors[0] + 'CC',
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(99, 102, 241, 0.3)'
            }
          }
        },
        {
          name: '动作次数',
          type: 'bar',
          yAxisIndex: 1,
          data: mockData.deviceStats.map(item => item.totalActions),
          itemStyle: {
            color: colors[1],
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: colors[1] + 'CC',
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(16, 185, 129, 0.3)'
            }
          }
        }
      ]
    };
    
    // 折线图配置
    const lineOption = {
      title: {
        text: '每日动作执行次数',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: 'var(--color-text-primary)'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        backgroundColor: 'var(--color-bg)'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: mockData.dailyStats.map(item => item.date),
        axisLine: {
          lineStyle: {
            color: 'var(--color-border)'
          }
        },
        axisLabel: {
          color: 'var(--color-text-secondary)'
        },
        splitLine: {
          lineStyle: {
            color: 'var(--color-border)',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '动作次数',
        axisLine: {
          lineStyle: {
            color: 'var(--color-border)'
          }
        },
        axisLabel: {
          color: 'var(--color-text-secondary)'
        },
        splitLine: {
          lineStyle: {
            color: 'var(--color-border)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '动作次数',
          data: mockData.dailyStats.map(item => item.actions),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: colors[2],
            width: 3
          },
          itemStyle: {
            color: colors[2],
            borderColor: 'var(--color-bg)',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[2] + '88' },
              { offset: 1, color: colors[2] + '00' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: colors[2],
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(245, 158, 11, 0.5)'
            }
          }
        }
      ]
    };
    
    // 饼图配置
    const pieOption = {
      title: {
        text: '动作类型分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: 'var(--color-text-primary)'
        },
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: 'var(--color-text-secondary)'
        },
        backgroundColor: 'var(--color-bg-light)',
        borderRadius: 8,
        padding: [16, 16]
      },
      series: [
        {
          name: '动作类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'var(--color-bg)',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: '600',
              color: 'var(--color-text-primary)'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          labelLine: {
            show: false
          },
          data: mockData.actionTypeStats.map((item, index) => ({
            ...item,
            itemStyle: {
              color: colors[index % colors.length]
            }
          })),
        }
      ]
    };
    
    // 设置图表选项
    barChart?.setOption(barOption);
    lineChart?.setOption(lineOption);
    pieChart?.setOption(pieOption);
  }, [barChart, lineChart, pieChart]);
  
  // 处理查询
  const handleQuery = async () => {
    setLoading(true);
    
    try {
      // 这里可以添加实际的查询逻辑，调用API获取数据
      const values = form.getFieldsValue();
      console.log('查询条件:', { ...values, chartType });
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 目前使用模拟数据，后续可以替换为真实API调用
      console.log('查询成功，使用模拟数据');
    } catch (error) {
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 图表渲染条件
  const shouldRenderChart = (type: string) => {
    return chartType === 'all' || chartType === type;
  };
  
  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: '24px', color: 'var(--color-text-primary)' }}>
        数据分析
      </Title>
      
      {/* 查询条件 */}
      <Card 
        style={{ 
          marginBottom: '24px',
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            chartType: 'all'
          }}
        >
          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="dateRange" label="时间范围">
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="chartType" label="图表类型">
                <Select 
                  placeholder="请选择图表类型"
                  value={chartType}
                  onChange={setChartType}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部图表</Option>
                  <Option value="bar">
                    <Space>
                      <BarChartOutlined /> 柱状图
                    </Space>
                  </Option>
                  <Option value="line">
                    <Space>
                      <LineChartOutlined /> 折线图
                    </Space>
                  </Option>
                  <Option value="pie">
                    <Space>
                      <PieChartOutlined /> 饼图
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={24} md={8} lg={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleQuery}
                loading={loading}
                size="large"
                style={{ 
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                查询数据
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      
      {/* 图表区域 */}
      <Spin spinning={loading} tip="加载数据中...">
        <Row gutter={[24, 24]}>
          {/* 柱状图 */}
          {shouldRenderChart('bar') && (
            <Col xs={24} xl={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChartOutlined /> <Text strong>设备在线时长与动作次数</Text>
                  </div>
                }
                style={{ 
                  border: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div 
                  ref={barChartRef} 
                  style={{ 
                    width: '100%', 
                    height: '400px',
                    borderRadius: 'var(--radius-md)'
                  }}
                ></div>
              </Card>
            </Col>
          )}
          
          {/* 折线图 */}
          {shouldRenderChart('line') && (
            <Col xs={24} xl={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LineChartOutlined /> <Text strong>每日动作执行次数</Text>
                  </div>
                }
                style={{ 
                  border: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div 
                  ref={lineChartRef} 
                  style={{ 
                    width: '100%', 
                    height: '400px',
                    borderRadius: 'var(--radius-md)'
                  }}
                ></div>
              </Card>
            </Col>
          )}
          
          {/* 饼图 */}
          {shouldRenderChart('pie') && (
            <Col xs={24} xl={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PieChartOutlined /> <Text strong>动作类型分布</Text>
                  </div>
                }
                style={{ 
                  border: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div 
                  ref={pieChartRef} 
                  style={{ 
                    width: '100%', 
                    height: '400px',
                    borderRadius: 'var(--radius-md)'
                  }}
                ></div>
              </Card>
            </Col>
          )}
        </Row>
      </Spin>
    </div>
  );
};

export default DataAnalysis;