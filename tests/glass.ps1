$checkSource = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'glass-checks.js'))
$result = Invoke-JS ('(' + $checkSource + ')()')
Write-Output ($result | ConvertTo-Json -Compress)
$records = @()
$skins = @('normal','spider','venom','espetacular','santos','flamengo','sao-paulo','bolsonaro')
foreach ($size in @(@(1920,1080),@(1366,768),@(768,1024),@(390,844),@(320,640))) {
    Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{width=$size[0];height=$size[1];deviceScaleFactor=1;mobile=($size[0] -lt 900)} | Out-Null
    foreach ($skin in $skins) {
        foreach ($intensity in @(0,60,100)) {
            $records += Invoke-JS ('window.__glassCheck("' + $skin + '",' + $intensity + ')')
        }
        if ($size[0] -in @(1366,390)) {
            Invoke-JS 'window.__glassChange("glassIntensity",60,"input")' | Out-Null
            $shot = Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
            [IO.File]::WriteAllBytes((Join-Path $artifactDir "glass-$($size[0])-$skin.png"),[Convert]::FromBase64String($shot.data))
        }
    }
}
$records | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $artifactDir 'glass-layouts.json') -Encoding UTF8
Write-Output 'GLASS_LAYOUT=PASS (120 cases: 5 sizes x 8 skins x 3 intensities; contrast >=4.5)'
# Real reloads for every wallpaper at intensity 72, with early head application.
$early = Invoke-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source='document.addEventListener("DOMContentLoaded",()=>{window.__glassEarly=[document.documentElement.dataset.appearance,document.documentElement.dataset.visualTheme,document.documentElement.style.getPropertyValue("--glass-level")];})'}
foreach ($skin in $skins) {
    Invoke-JS ('document.getElementById("appearanceMode").value="liquid-glass";document.getElementById("appearanceMode").dispatchEvent(new Event("change"));document.getElementById("visualTheme").value="' + $skin + '";document.getElementById("visualTheme").dispatchEvent(new Event("change"));document.getElementById("glassIntensity").value=72;document.getElementById("glassIntensity").dispatchEvent(new Event("input"))') | Out-Null
    Invoke-CDP 'Page.reload' | Out-Null
    Start-Sleep -Milliseconds 500
    $state = Invoke-JS '[document.documentElement.dataset.appearance,document.documentElement.dataset.visualTheme,document.getElementById("glassIntensity").value,window.__glassEarly]'
    if ($state[0] -ne 'liquid-glass' -or $state[1] -ne $skin -or $state[2] -ne '72' -or $state[3][0] -ne 'liquid-glass' -or $state[3][1] -ne $skin -or $state[3][2] -ne '0.72') { throw 'Glass reload failed' }
}
Write-Output 'GLASS_RELOAD=PASS (8 wallpapers, 72 intensity, early restore)'
# Clamp corrupted preferences and keep default for non-numeric/empty values.
foreach ($case in @(@('garbage','60'),@('','60'),@('-20','0'),@('200','100'))) {
    Invoke-JS ('localStorage.setItem("caderno-glass-intensity","' + $case[0] + '")') | Out-Null
    Invoke-CDP 'Page.reload' | Out-Null
    Start-Sleep -Milliseconds 350
    if ((Invoke-JS 'document.getElementById("glassIntensity").value') -ne $case[1]) { throw 'Intensity normalization failed' }
}
# No decorative motion when requested, including the pre-existing patriotic glow.
Invoke-CDP 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='reduce'})} | Out-Null
if (-not (Invoke-JS 'getComputedStyle(document.body,"::after").animationName==="none"')) { throw 'Reduced motion failed' }
# Storage disabled: initial fallback and live controls still work without exceptions.
$blocked = Invoke-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source='for(const name of ["getItem","setItem"]){const old=Storage.prototype[name];Storage.prototype[name]=function(key,...args){if(["caderno-theme","caderno-glass-intensity"].includes(key))throw new DOMException("blocked","SecurityError");return old.call(this,key,...args)}}'}
Invoke-CDP 'Page.reload' | Out-Null
Start-Sleep -Milliseconds 400
$blockedResult = Invoke-JS 'document.getElementById("appearanceMode").value="liquid-glass";document.getElementById("appearanceMode").dispatchEvent(new Event("change"));document.getElementById("glassIntensity").value=72;document.getElementById("glassIntensity").dispatchEvent(new Event("input"));[document.documentElement.dataset.appearance,document.documentElement.style.getPropertyValue("--glass-level")]'
if ($blockedResult[0] -ne 'liquid-glass' -or $blockedResult[1] -ne '0.72') { throw 'Blocked storage control failed' }
Invoke-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$blocked.identifier} | Out-Null
Invoke-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$early.identifier} | Out-Null
Write-Output 'GLASS_STORAGE=PASS; GLASS_REDUCED_MOTION=PASS'
