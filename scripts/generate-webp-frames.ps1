param(
  [Parameter(Mandatory = $true)]
  [string]$Input,

  [string]$OutputDir = "public/frames",
  [int]$Width = 2560,
  [int]$Height = 1440,
  [int]$Fps = 24,
  [int]$Quality = 90,
  [int]$CompressionLevel = 6,
  [string]$Preset = "picture"
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Error "ffmpeg is not installed or not in PATH."
  exit 1
}

if (-not (Test-Path $Input)) {
  Write-Error "Input file not found: $Input"
  exit 1
}

if ($Quality -lt 0 -or $Quality -gt 100) {
  Write-Error "Quality must be between 0 and 100."
  exit 1
}

if ($CompressionLevel -lt 0 -or $CompressionLevel -gt 6) {
  Write-Error "CompressionLevel must be between 0 and 6."
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$resolvedInput = (Resolve-Path $Input).Path
$outputPattern = Join-Path $OutputDir "ezgif-frame-%03d.webp"
$vf = "fps=$Fps,scale=$Width`:$Height`:flags=lanczos"

Write-Host "Generating WebP frames..."
Write-Host "Input: $resolvedInput"
Write-Host "Output: $outputPattern"
Write-Host "Scale: ${Width}x${Height} @ ${Fps}fps"
Write-Host "Quality: $Quality, Compression: $CompressionLevel, Preset: $Preset"

ffmpeg -y -i $resolvedInput -vf $vf -start_number 1 -c:v libwebp -lossless 0 -quality $Quality -compression_level $CompressionLevel -preset $Preset $outputPattern

if ($LASTEXITCODE -ne 0) {
  Write-Error "ffmpeg failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "Done. WebP frames generated in $OutputDir"
