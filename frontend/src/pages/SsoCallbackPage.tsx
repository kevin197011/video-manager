// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Result, Spin } from 'antd';
import { authAPI } from '../lib/api';
import { auth } from '../lib/auth';

export default function SsoCallbackPage() {
  const { message } = App.useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const err = params.get('error');
    if (err) {
      setErrorMsg(err);
      return;
    }

    const token = params.get('token');
    if (!token) {
      setErrorMsg('SSO 回调缺少 token');
      return;
    }

    const complete = async () => {
      try {
        auth.setToken(token);
        const me = await authAPI.getCurrentUser();
        auth.setUser(me);
        message.success('SSO 登录成功');
        navigate('/dashboard', { replace: true });
      } catch (error: unknown) {
        auth.logout();
        const apiErr = error as { response?: { data?: { message?: string } } };
        setErrorMsg(apiErr.response?.data?.message || 'SSO 登录失败');
      }
    };

    void complete();
  }, [params, navigate, message]);

  if (errorMsg) {
    return (
      <Result
        status="error"
        title="SSO 登录失败"
        subTitle={errorMsg}
        extra={
          <Button type="primary" onClick={() => navigate('/login', { replace: true })}>
            返回登录页
          </Button>
        }
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}
    >
      <Spin size="large" tip="SSO 登录处理中…" />
    </div>
  );
}
