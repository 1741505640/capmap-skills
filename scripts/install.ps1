# Copy capmap-skills into a host git repo (.agents/skills + optional extras).
param(
  [Parameter(Mandatory = $true)]
  [string]$TargetRepo,
  [switch]$WithExtras,
  [switch]$WithExampleConfig
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $here "..")
$target = Resolve-Path $TargetRepo

$skillsSrc = Join-Path $root "skills"
$skillsDst = Join-Path $target ".agents\skills"
New-Item -ItemType Directory -Force -Path $skillsDst | Out-Null

Get-ChildItem $skillsSrc -Directory -Filter "capmap-*" | ForEach-Object {
  $dst = Join-Path $skillsDst $_.Name
  if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
  Copy-Item $_.FullName $dst -Recurse
  Write-Host "installed $($_.Name)"
}

if ($WithExtras) {
  $wfSrc = Join-Path $root "install\github-workflows\capmap-lint.yml"
  $wfDstDir = Join-Path $target ".github\workflows"
  New-Item -ItemType Directory -Force -Path $wfDstDir | Out-Null
  Copy-Item $wfSrc (Join-Path $wfDstDir "capmap-lint.yml") -Force
  Write-Host "installed .github/workflows/capmap-lint.yml"

  $ruleSrc = Join-Path $root "install\cursor-rules\capmap-status-no-skip.mdc"
  $ruleDstDir = Join-Path $target ".cursor\rules"
  New-Item -ItemType Directory -Force -Path $ruleDstDir | Out-Null
  Copy-Item $ruleSrc (Join-Path $ruleDstDir "capmap-status-no-skip.mdc") -Force
  Write-Host "installed .cursor/rules/capmap-status-no-skip.mdc"
}

if ($WithExampleConfig) {
  $cfgDst = Join-Path $skillsDst "capmap-system\capmap.yaml"
  if (-not (Test-Path $cfgDst)) {
    Copy-Item (Join-Path $root "examples\capmap.yaml") $cfgDst
    Write-Host "wrote example capmap.yaml (edit docs_root)"
  } else {
    Write-Host "skip capmap.yaml (already exists)"
  }
}

Write-Host "done. Next: run capmap-init in the target repo (or edit capmap.yaml)."
