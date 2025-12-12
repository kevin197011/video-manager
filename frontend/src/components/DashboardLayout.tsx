// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Space, Typography, Tag, Dropdown, Button, Modal, Form, Input, message } from 'antd';
import { DashboardOutlined, CloudServerOutlined, LinkOutlined, GlobalOutlined, PlayCircleOutlined, FileTextOutlined, ApiOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, LogoutOutlined, LockOutlined, KeyOutlined, BookOutlined } from '@ant-design/icons';
import Logo from './Logo';
import { auth } from '../lib/auth';
import { authAPI } from '../lib/api';

const { Sider, Content, Footer } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');
  const [uptime, setUptime] = useState(0);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const user = auth.getUser();

  useEffect(() => {
    // 计算运行时间
    const startTime = Date.now();
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // 检查系统状态（可以扩展为检查后端连接）
    const checkSystemStatus = async () => {
      try {
        // 这里可以添加实际的后端健康检查
        setSystemStatus('online');
      } catch {
        setSystemStatus('offline');
      }
    };

    checkSystemStatus();
    const statusInterval = setInterval(checkSystemStatus, 30000); // 每30秒检查一次

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟 ${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/providers',
      icon: <CloudServerOutlined />,
      label: 'CDN 厂商',
    },
    {
      key: '/lines',
      icon: <LinkOutlined />,
      label: 'CDN 线路',
    },
    {
      key: '/domains',
      icon: <GlobalOutlined />,
      label: '域名',
    },
    {
      key: '/stream-regions',
      icon: <PlayCircleOutlined />,
      label: '视频流区域',
    },
    {
      key: '/stream-paths',
      icon: <FileTextOutlined />,
      label: '流路径',
    },
    {
      key: '/endpoints',
      icon: <ApiOutlined />,
      label: '视频流端点',
    },
    {
      key: '/token-management',
      icon: <KeyOutlined />,
      label: 'Token 管理',
    },
    {
      key: '/swagger',
      icon: <BookOutlined />,
      label: 'API 文档',
    },
  ];

  const selectedKey = menuItems.find(
    (item) => location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || '/dashboard';

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const handleChangePassword = async (values: { old_password: string; new_password: string }) => {
    setChangePasswordLoading(true);
    try {
      await authAPI.changePassword(values.old_password, values.new_password);
      message.success('密码修改成功');
      setChangePasswordVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || '密码修改失败');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => setChangePasswordVisible(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider
        theme="dark"
        width={256}
        style={{
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          <Logo size={36} />
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            视频管理系统
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey === '/swagger' ? '' : selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === '/swagger') {
              // 在新标签页中打开 Swagger
              window.open('/swagger/index.html', '_blank');
            } else {
              navigate(key);
            }
          }}
          style={{
            borderRight: 0,
            height: 'calc(100vh - 64px)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.85)',
          }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 256,
            right: 0,
            height: 64,
            background: '#fff',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {user?.username || '用户'}
            </Button>
          </Dropdown>
        </div>
        <Content
          style={{
            margin: '24px',
            marginTop: '88px', // 为顶部栏留出空间
            padding: '24px',
            background: '#f0f2f5',
            minHeight: 280,
            borderRadius: '8px',
            marginBottom: '60px', // 为底部栏留出空间
          }}
        >
          {children}
        </Content>
        <Footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 256,
            right: 0,
            height: 50,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 100,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Space size="large">
            <Space>
              <CheckCircleOutlined style={{ color: systemStatus === 'online' ? '#52c41a' : '#ff4d4f' }} />
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                系统状态: <Tag color={systemStatus === 'online' ? 'success' : 'error'} style={{ marginLeft: 4 }}>
                  {systemStatus === 'online' ? '运行中' : '离线'}
                </Tag>
              </Text>
            </Space>
            <Space>
              <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.9)' }} />
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                运行时间: {formatUptime(uptime)}
              </Text>
            </Space>
          </Space>
          <Space>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              © 2025 视频管理系统 v1.0.0
            </Text>
          </Space>
        </Footer>
      </Layout>

      <Modal
        title="修改密码"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位）" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setChangePasswordVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={changePasswordLoading}>
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
