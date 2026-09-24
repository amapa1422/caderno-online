# Invoked in browser.ps1's CDP session, with the same isolated Firebase mock.
$checks = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'visual-theme-checks.js'))
$result = Invoke-JS ('(' + $checks + ')()')
$result | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $artifactDir 'skins-functional.json') -Encoding UTF8
Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
$layouts = @()
foreach ($size in @(@(1920,1080),@(1440,900),@(1280,720),@(390,844),@(430,932))) {
    Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=$size[0]; height=$size[1]; deviceScaleFactor=1; mobile=($size[0] -lt 500) } | Out-Null
    foreach ($mode in @('light','dark')) {
        foreach ($skin in @('normal','spider','venom')) {
            $layouts += Invoke-JS ('window.__skinLayoutCheck("' + $skin + '","' + $mode + '")')
            $shot = Invoke-CDP 'Page.captureScreenshot' @{ format='png'; captureBeyondViewport=$false }
            [IO.File]::WriteAllBytes((Join-Path $artifactDir "skin-$($size[0])-$mode-$skin.png"), [Convert]::FromBase64String($shot.data))
        }
    }
}
$layouts | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $artifactDir 'skins-layouts.json') -Encoding UTF8
Write-Output 'SKIN_LAYOUT=PASS (5 sizes x 2 base modes x 3 skins, contrast >= 4.5)'
# Actual keyboard selection inside the existing mobile drawer, with draft intact.
Invoke-JS 'document.getElementById("sidebarToggle").click();document.getElementById("visualTheme").focus()' | Out-Null
Invoke-CDP 'Input.dispatchKeyEvent' @{type='keyDown';key='Home';code='Home';windowsVirtualKeyCode=36} | Out-Null
Invoke-CDP 'Input.dispatchKeyEvent' @{type='keyUp';key='Home';code='Home';windowsVirtualKeyCode=36} | Out-Null
Invoke-CDP 'Input.dispatchKeyEvent' @{type='keyDown';key='ArrowDown';code='ArrowDown';windowsVirtualKeyCode=40} | Out-Null
Invoke-CDP 'Input.dispatchKeyEvent' @{type='keyUp';key='ArrowDown';code='ArrowDown';windowsVirtualKeyCode=40} | Out-Null
$keyboard = Invoke-JS 'document.documentElement.dataset.visualTheme==="spider" && document.getElementById("visualTheme").value==="spider"'
if (-not $keyboard) { throw 'Native appearance select failed keyboard interaction.' }
Invoke-JS 'document.getElementById("panelBackdrop").click()' | Out-Null
Write-Output 'SKIN_KEYBOARD=PASS'
# Reload must apply the saved skin by DOMContentLoaded, even before Firebase finishes.
$early = Invoke-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source='document.addEventListener("DOMContentLoaded",()=>{window.__earlySkin=document.documentElement.dataset.visualTheme;},{once:true});'}
foreach ($skin in @('spider','venom','normal')) {
    Invoke-JS ('document.getElementById("visualTheme").value="' + $skin + '";document.getElementById("visualTheme").dispatchEvent(new Event("change"))') | Out-Null
    Invoke-CDP 'Page.reload' | Out-Null
    Start-Sleep -Milliseconds 500
    $state = Invoke-JS '(async()=>{for(let i=0;i<200&&!document.querySelector("[data-id=skin-note] mark");i++)await new Promise(r=>setTimeout(r,25));return {skin:document.documentElement.dataset.visualTheme,early:window.__earlySkin,selected:document.getElementById("visualTheme").value,ink:document.querySelector("[data-id=skin-note] mark")?.style.getPropertyValue("--highlight")}})()'
    if ($state.skin -ne $skin -or $state.early -ne $skin -or $state.selected -ne $skin -or $state.ink -ne '#22AACC') { throw 'Skin/ink reload failed.' }
}
Invoke-JS 'localStorage.setItem("caderno-visual-theme","unknown")' | Out-Null
Invoke-CDP 'Page.reload' | Out-Null
Start-Sleep -Milliseconds 400
if ((Invoke-JS 'document.documentElement.dataset.visualTheme') -ne 'normal') { throw 'Invalid preference must fall back to Normal.' }
Write-Output 'SKIN_RELOAD=PASS (all skins, early application, preserved highlight, invalid preference)'
Invoke-CDP 'Emulation.setEmulatedMedia' @{ features=@(@{name='prefers-reduced-motion';value='reduce'}) } | Out-Null
Invoke-JS 'document.getElementById("visualTheme").value="venom";document.getElementById("visualTheme").dispatchEvent(new Event("change"))' | Out-Null
if (-not (Invoke-JS 'getComputedStyle(document.body,"::before").animationName==="none" && getComputedStyle(document.body,"::after").animationName==="none"')) { throw 'Decorative animation under reduced motion.' }
# Logout has no theme effects. Capture login and theme-specific picker/dialog/drawers.
foreach ($skin in @('spider','venom')) {
    Invoke-JS ('document.getElementById("visualTheme").value="' + $skin + '";document.getElementById("visualTheme").dispatchEvent(new Event("change"))') | Out-Null
    foreach ($panel in @('sidebar','agenda','picker','dialog')) {
        $open = @{sidebar='document.getElementById("sidebarToggle").click()';agenda='document.getElementById("agendaToggle").click()';picker='document.getElementById("abrirPaleta").click()';dialog='document.querySelector("[data-id=skin-note] [data-action=delete]").click()'}
        Invoke-JS $open[$panel] | Out-Null
        Start-Sleep -Milliseconds 300
        $shot = Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
        [IO.File]::WriteAllBytes((Join-Path $artifactDir "skin-$skin-$panel.png"), [Convert]::FromBase64String($shot.data))
        $close = @{sidebar='document.getElementById("panelBackdrop").click()';agenda='document.getElementById("panelBackdrop").click()';picker='document.getElementById("fecharPaleta").click()';dialog='document.getElementById("cancelarExclusao").click()'}
        Invoke-JS $close[$panel] | Out-Null
    }
}
Invoke-JS 'document.getElementById("btnSair").click();new Promise(r=>setTimeout(r,100))' | Out-Null
foreach ($skin in @('normal','spider','venom')) {
    Invoke-JS ('document.getElementById("visualTheme").value="' + $skin + '";document.getElementById("visualTheme").dispatchEvent(new Event("change"));new Promise(r=>setTimeout(r,350))') | Out-Null
    $shot = Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
    [IO.File]::WriteAllBytes((Join-Path $artifactDir "skin-$skin-login.png"), [Convert]::FromBase64String($shot.data))
}
# Only simulate blocked storage for this new key; unrelated preferences keep their semantics.
$blocked = Invoke-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source='for(const name of ["getItem","setItem"]){const original=Storage.prototype[name];Storage.prototype[name]=function(key,...args){if(key==="caderno-visual-theme")throw new DOMException("blocked","SecurityError");return original.call(this,key,...args)}}'}
Invoke-CDP 'Page.reload' | Out-Null
Start-Sleep -Milliseconds 400
if ((Invoke-JS 'document.documentElement.dataset.visualTheme') -ne 'normal') { throw 'Blocked storage fallback failed.' }
$blockedResult = Invoke-JS 'document.getElementById("visualTheme").value="spider";document.getElementById("visualTheme").dispatchEvent(new Event("change"));document.documentElement.dataset.visualTheme'
if ($blockedResult -ne 'spider') { throw 'Theme selection must work with unavailable storage.' }
Invoke-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$blocked.identifier} | Out-Null
Invoke-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$early.identifier} | Out-Null
Write-Output 'SKIN_STORAGE_FALLBACK=PASS; REDUCED_MOTION=PASS'
$badAssets = @($script:events | Where-Object { $_.method -eq 'Network.responseReceived' -and $_.params.response.url -match '(visual-themes|assets/themes)' -and $_.params.response.status -ge 400 })
if ($badAssets.Count) { throw ($badAssets | ConvertTo-Json -Depth 6 -Compress) }
Write-Output 'SKIN_NETWORK=PASS (no failed new assets)'
Invoke-CDP 'Page.reload' | Out-Null
Start-Sleep -Milliseconds 400
. (Join-Path $PSScriptRoot 'normal-comparison.ps1')
