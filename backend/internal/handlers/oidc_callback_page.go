// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package handlers

import (
	"bytes"
	"html/template"
	"net/http"

	"github.com/gin-gonic/gin"
)

var oidcCompleteFormTmpl = template.Must(template.New("oidc_complete").Parse(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>正在完成登录</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
    p { font-size: 1rem; }
  </style>
</head>
<body>
  <p>正在完成 SSO 登录，请稍候…</p>
  <form id="oidc-complete-form" method="post" action="/api/auth/oidc/complete">
    <input type="hidden" name="state" value="{{.State}}">
  </form>
  <script>document.getElementById('oidc-complete-form').submit();</script>
</body>
</html>`))

func renderOIDCCompleteForm(c *gin.Context, state string) {
	var buf bytes.Buffer
	if err := oidcCompleteFormTmpl.Execute(&buf, map[string]string{"State": state}); err != nil {
		c.String(http.StatusInternalServerError, "failed to render oidc complete page")
		return
	}
	c.Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}
