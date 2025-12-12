// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { lineAPI } from '../lib/api';
import type { CDNLine, CDNProvider } from '../lib/api';

interface LineFormProps {
  line: CDNLine | null;
  providers: CDNProvider[];
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function LineForm({ line, providers, open, onClose, onSubmit }: LineFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (line) {
        form.setFieldsValue({
          provider_id: line.provider_id,
          name: line.name,
          display_name: line.display_name,
        });
      } else {
        form.resetFields();
        if (providers.length > 0) {
          form.setFieldsValue({ provider_id: providers[0].id });
        }
      }
    }
  }, [open, line, providers, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (line) {
        await lineAPI.update(line.id, {
          provider_id: values.provider_id,
          name: values.name,
          display_name: values.display_name,
        });
        message.success('Line 更新成功');
      } else {
        await lineAPI.create({
          provider_id: values.provider_id,
          name: values.name,
          display_name: values.display_name,
        });
        message.success('Line 创建成功');
      }

      onSubmit();
      onClose();
    } catch (err: any) {
      if (err.errorFields) {
        // Form validation errors
        return;
      }
      message.error(err.response?.data?.message || '保存失败 line');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={line ? '编辑 Line' : '创建 Line'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="provider_id"
          label="厂商"
          rules={[{ required: true, message: '请选择厂商' }]}
        >
          <Select placeholder="选择 a provider">
            {providers.map((provider) => (
              <Select.Option key={provider.id} value={provider.id}>
                {provider.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="名称"
          rules={[
            { required: true, message: '请输入线路名称' },
            { min: 1, message: '名称不能为空' },
            { max: 255, message: '名称不能超过255个字符' },
            { whitespace: true, message: '名称不能仅为空白字符' },
          ]}
        >
          <Input placeholder="输入 line name" showCount maxLength={255} />
        </Form.Item>

        <Form.Item
          name="display_name"
          label="显示名称"
          rules={[
            { required: true, message: '请输入显示名称' },
            { min: 1, message: '显示名称不能为空' },
            { max: 255, message: '显示名称不能超过255个字符' },
            { whitespace: true, message: '显示名称不能仅为空白字符' },
          ]}
        >
          <Input placeholder="输入 display name" showCount maxLength={255} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
