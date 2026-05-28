import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Switch, Typography, message } from 'antd';
import { auth } from '../lib/auth';
import { systemSettingsAPI, type OIDCSettings, type UpdateOIDCSettingsRequest } from '../lib/api';

const { Text } = Typography;

export default function SystemSettingsPage() {
  const user = auth.getUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasClientSecret, setHasClientSecret] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data: OIDCSettings = await systemSettingsAPI.getOIDCSettings();
      form.setFieldsValue({
        enabled: data.enabled,
        issuer_url: data.issuer_url,
        client_id: data.client_id,
        redirect_url: data.redirect_url,
        scopes: data.scopes,
        frontend_success_url: data.frontend_success_url,
      });
      setHasClientSecret(data.has_client_secret);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '加载系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSubmit = async (values: UpdateOIDCSettingsRequest) => {
    setSaving(true);
    try {
      await systemSettingsAPI.updateOIDCSettings(values);
      message.success('系统设置已保存');
      await loadSettings();
      form.setFieldValue('client_secret', '');
      form.setFieldValue('clear_client_secret', false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || '保存系统设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.is_admin) {
    return <Alert type="warning" message="仅管理员可访问系统设置页面" showIcon />;
  }

  return (
    <Card title="系统设置">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="OIDC SSO 配置"
          description="保存后立即生效。SSO 登录用户会自动创建为普通用户（非管理员）。"
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            enabled: false,
            scopes: 'openid profile email',
            clear_client_secret: false,
          }}
        >
          <Form.Item name="enabled" label="启用 OIDC SSO" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            name="issuer_url"
            label="Issuer URL"
            rules={[{ required: true, message: '请输入 Issuer URL' }, { type: 'url', message: '请输入合法 URL' }]}
          >
            <Input placeholder="https://idp.example.com/realms/myrealm" />
          </Form.Item>

          <Form.Item name="client_id" label="Client ID" rules={[{ required: true, message: '请输入 Client ID' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="client_secret" label="Client Secret（留空表示不修改）">
            <Input.Password placeholder={hasClientSecret ? '当前已配置，留空则保持不变' : '请输入 Client Secret'} />
          </Form.Item>

          <Form.Item name="clear_client_secret" valuePropName="checked">
            <Switch checkedChildren="清除 Secret" unCheckedChildren="保留 Secret" />
          </Form.Item>

          <Form.Item
            name="redirect_url"
            label="Redirect URL"
            rules={[{ required: true, message: '请输入 Redirect URL' }, { type: 'url', message: '请输入合法 URL' }]}
          >
            <Input placeholder="http://localhost:8080/api/auth/oidc/callback" />
          </Form.Item>

          <Form.Item name="scopes" label="Scopes">
            <Input placeholder="openid profile email" />
          </Form.Item>

          <Form.Item
            name="frontend_success_url"
            label="Frontend Success URL"
            rules={[{ required: true, message: '请输入前端成功跳转 URL' }, { type: 'url', message: '请输入合法 URL' }]}
          >
            <Input placeholder="http://localhost:3000/login" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving || loading}>
              保存设置
            </Button>
            <Button onClick={() => void loadSettings()} loading={loading}>
              刷新
            </Button>
          </Space>
        </Form>

        <Text type="secondary">提示：OIDC 登录入口为 `/api/auth/oidc/login`。</Text>
      </Space>
    </Card>
  );
}
