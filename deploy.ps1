param(
  [string]$ProjectPath = '',
  [string]$Message = 'Update putsputs'
)
$ErrorActionPreference = 'Stop'
if (!$ProjectPath) {
  $ProjectPath = if (Test-Path (Join-Path $PSScriptRoot 'index.html')) { $PSScriptRoot } else { Join-Path $PSScriptRoot '../work/putsputs' }
}
$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
function Run-Git {
  & git -C $ProjectPath @args
  if ($LASTEXITCODE -ne 0) { throw "Git failed: $args" }
}
if (!(Test-Path (Join-Path $ProjectPath 'index.html'))) { throw 'Select the putsputs project folder with -ProjectPath.' }
$branch = & git -C $ProjectPath branch --show-current
if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Run deploy from the main branch.' }
if (Get-Command node -ErrorAction SilentlyContinue) {
  Push-Location $ProjectPath
  try {
    & node -e "const fs=require('fs'),vm=require('vm');for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.js')&&f!=='visual.js'))new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});for(const f of ['visual.js',...fs.readdirSync('presets').filter(f=>f.endsWith('.js')).map(f=>'presets/'+f)])new Function('p','a','s',fs.readFileSync(f,'utf8'));console.log('JavaScript OK');"
    if ($LASTEXITCODE -ne 0) { throw 'JavaScript validation failed. Nothing was published.' }
  } finally { Pop-Location }
} else { throw 'Install Node.js to validate JavaScript before deployment.' }
# Update cache keys so mobile browsers load the new scripts and styles.
foreach ($page in @('index.html','capture.html')) {
  $file = Join-Path $ProjectPath $page
  if (!(Test-Path $file)) { continue }
  $html = [IO.File]::ReadAllText($file)
  $html = [regex]::Replace($html, '((?:src|href)=")([^"?]+\.(?:js|css))(?:\?[^" ]*)?"', {
    param($match)
    if ($match.Groups[2].Value -match '^(https?:|//)') { return $match.Value }
    $asset = Join-Path $ProjectPath $match.Groups[2].Value
    if (!(Test-Path -LiteralPath $asset -PathType Leaf)) { return $match.Value }
    $hash = (Get-FileHash -LiteralPath $asset -Algorithm SHA256).Hash.Substring(0,12).ToLowerInvariant()
    return $match.Groups[1].Value + $match.Groups[2].Value + '?v=' + $hash + '"'
  })
  [IO.File]::WriteAllText($file, $html, [Text.UTF8Encoding]::new($false))
}
Run-Git add --all
& git -C $ProjectPath diff --cached --quiet
if ($LASTEXITCODE -eq 1) { Run-Git commit -m $Message }
elseif ($LASTEXITCODE -ne 0) { throw 'Could not inspect staged changes.' }
Run-Git push origin main
Write-Host 'Sent to GitHub. Pages publishes automatically:' -ForegroundColor Green
Write-Host 'https://putsputs.com/'
Write-Host 'Build status: https://github.com/gabrsar/putsputs/actions'
