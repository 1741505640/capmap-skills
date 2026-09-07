# 一键发布 @chenjh12/dsh-capmap-viz 到 npm（public）
# 用法：
#   .\scripts\publish.ps1 -Token "npm_xxx"
#   $env:NPM_TOKEN = "npm_xxx"; .\scripts\publish.ps1
# 或双击同目录 publish.cmd（会提示输入 token）

param(
  [string]$Token = $env:NPM_TOKEN,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$pkgRoot = Split-Path -Parent $PSScriptRoot
Set-Location $pkgRoot

if (-not $Token) {
  $secure = Read-Host "npm token (npm_...)" -AsSecureString
  $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

if (-not $Token) {
  Write-Error "缺少 token。请传 -Token，或设置环境变量 NPM_TOKEN。"
}

Write-Host "==> 写入 registry auth token"
npm config set "//registry.npmjs.org/:_authToken=$Token"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipBuild) {
  Write-Host "==> npm run build"
  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "==> npm publish --access public"
npm publish --access public
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "发布完成。"
