# Local .vsix packer (zip) when @vscode/vsce is unavailable.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root 'package.json'))) {
  throw "package.json not found above scripts/"
}
Set-Location $root
Write-Host "pack root=$root"

npm run compile | Out-Host

$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$name = [string]$pkg.name
$ver = [string]$pkg.version
$publisher = [string]$pkg.publisher
$outName = "$publisher.$name-$ver.vsix"

$stage = Join-Path $env:TEMP ("capmap-vsix-" + [guid]::NewGuid().ToString())
$ext = Join-Path $stage 'extension'
New-Item -ItemType Directory -Force -Path $ext | Out-Null

Copy-Item (Join-Path $root 'package.json') $ext
Copy-Item -Recurse (Join-Path $root 'out') (Join-Path $ext 'out')
Copy-Item -Recurse (Join-Path $root 'media') (Join-Path $ext 'media')

$yamlSrc = Join-Path $root 'node_modules\js-yaml'
if (-not (Test-Path $yamlSrc)) { throw "missing $yamlSrc" }
$nm = Join-Path $ext 'node_modules'
New-Item -ItemType Directory -Force -Path $nm | Out-Null
Copy-Item -Recurse $yamlSrc (Join-Path $nm 'js-yaml')
Write-Host "bundled js-yaml"

if (Test-Path (Join-Path $root 'README.md')) {
  Copy-Item (Join-Path $root 'README.md') $ext
}
$lic = Join-Path $root 'LICENSE'
$licParent = Join-Path (Split-Path $root -Parent) 'LICENSE'
if (Test-Path $lic) { Copy-Item $lic $ext }
elseif (Test-Path $licParent) { Copy-Item $licParent $ext }

$engine = [string]$pkg.engines.vscode
$display = [string]$pkg.displayName
$desc = [string]$pkg.description
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="$name" Version="$ver" Publisher="$publisher" />
    <DisplayName>$display</DisplayName>
    <Description xml:space="preserve">$desc</Description>
    <Tags></Tags>
    <Categories>Visualization,Other</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="$engine" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
    </Properties>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
  </Assets>
</PackageManifest>
"@
$contentTypes = @"
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".css" ContentType="text/css"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
</Types>
"@
[System.IO.File]::WriteAllText((Join-Path $stage 'extension.vsixmanifest'), $manifest)
[System.IO.File]::WriteAllText((Join-Path $stage '[Content_Types].xml'), $contentTypes)

$dest = Join-Path $root $outName
if (Test-Path $dest) { Remove-Item $dest -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $dest)
Remove-Item -Recurse -Force $stage
Write-Host "Wrote $dest ($((Get-Item $dest).Length) bytes)"
