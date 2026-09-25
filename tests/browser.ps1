param([switch]$Serve, [switch]$Live, [int]$Port = 8876, [string]$BrowserPath, [switch]$KeepOpen, [switch]$DiagnoseToggle, [ValidateSet('normal','spider','venom','espetacular','santos','flamengo','sao-paulo','bolsonaro')][string]$Skin = 'normal', [switch]$VisualThemes)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
if ($Serve) {
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Start()
    try {
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            try {
                $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
                if (-not $relative) { $relative = 'index.html' }
                if (-not $Live -and $relative -eq 'firebase.js') { $relative = 'tests/firebase.mock.js' }
                $file = [IO.Path]::GetFullPath((Join-Path $repoRoot $relative))
                if (-not $file.StartsWith($repoRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or $relative -match '(^|/)(\.git|\.project-memory)(/|$)' -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
                    $context.Response.StatusCode = 404
                } else {
                    $types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.png'='image/png'; '.svg'='image/svg+xml' }
                    $context.Response.ContentType = $types[[IO.Path]::GetExtension($file)]
                    $context.Response.Headers.Add('Cache-Control', 'no-store')
                    $bytes = [IO.File]::ReadAllBytes($file)
                    $context.Response.ContentLength64 = $bytes.Length
                    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } catch { $context.Response.StatusCode = 500 }
            finally { $context.Response.Close() }
        }
    } finally { $listener.Close() }
    exit
}
function Get-FreePort {
    $socket = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $socket.Start(); $freePort = $socket.LocalEndpoint.Port; $socket.Stop(); return $freePort
}
if (-not $BrowserPath) {
    $BrowserPath = @('C:\Program Files\Google\Chrome\Application\chrome.exe','C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe') | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $BrowserPath) { throw 'Instale Chrome ou Edge, ou informe -BrowserPath.' }
$Port = Get-FreePort
$debugPort = Get-FreePort
$artifactDir = Join-Path $PSScriptRoot '.artifacts'
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$profilePath = Join-Path ([IO.Path]::GetTempPath()) ('caderno-browser-' + [guid]::NewGuid().ToString('N'))
$serverArgs = '-NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -Serve -Port ' + $Port
if ($Live) { $serverArgs += ' -Live' }
$server = Start-Process powershell.exe -WindowStyle Hidden -ArgumentList $serverArgs -PassThru -RedirectStandardError (Join-Path $artifactDir 'server-error.log')
$browserArgs = @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',"--remote-debugging-port=$debugPort",'--remote-allow-origins=http://localhost', ('--user-data-dir="' + $profilePath + '"'), 'about:blank')
$browser = Start-Process -FilePath $BrowserPath -WindowStyle Hidden -ArgumentList $browserArgs -PassThru
$ws = [Net.WebSockets.ClientWebSocket]::new()
$script:messageId = 0
$script:events = [Collections.Generic.List[object]]::new()
function Invoke-CDP([string]$Method, [hashtable]$Params = @{}) {
    # Keep the last command when diagnosing a browser/CDP timeout.
    [IO.File]::WriteAllText((Join-Path $artifactDir 'last-cdp.txt'), ($Method + ' ' + ($Params | ConvertTo-Json -Depth 4 -Compress)))
    $script:messageId++
    $id = $script:messageId
    $payload = @{ id=$id; method=$Method; params=$Params } | ConvertTo-Json -Depth 60 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
    $segment = [ArraySegment[byte]]::new($bytes)
    $cancel = [Threading.CancellationTokenSource]::new(90000)
    try {
        $ws.SendAsync($segment, [Net.WebSockets.WebSocketMessageType]::Text, $true, $cancel.Token).GetAwaiter().GetResult() | Out-Null
        while ($true) {
            $stream = [IO.MemoryStream]::new()
            do {
                $buffer = [byte[]]::new(65536)
                $received = $ws.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cancel.Token).GetAwaiter().GetResult()
                $stream.Write($buffer, 0, $received.Count)
            } while (-not $received.EndOfMessage)
            $message = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
            $stream.Dispose()
            if ($message.id -eq $id) {
                if ($message.error) { throw ($message.error | ConvertTo-Json -Compress) }
                return $message.result
            }
            $script:events.Add($message)
            if ($message.method -eq 'Runtime.consoleAPICalled') { [IO.File]::WriteAllText((Join-Path $artifactDir 'browser-progress.json'), ($message.params | ConvertTo-Json -Depth 8 -Compress)) }
        }
    } finally { $cancel.Dispose() }
}
function Invoke-JS([string]$Expression) {
    $result = Invoke-CDP 'Runtime.evaluate' @{ expression=$Expression; awaitPromise=$true; returnByValue=$true; userGesture=$true }
    if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 8 -Compress) }
    return $result.result.value
}
try {
    $targets = $null
    for ($attempt=0; $attempt -lt 50; $attempt++) {
        try { $targets = Invoke-RestMethod "http://127.0.0.1:$debugPort/json/list"; if ($targets) { break } } catch {}
        Start-Sleep -Milliseconds 200
    }
    if (-not $targets) { throw 'Navegador nao disponibilizou CDP.' }
    $target = $targets | Where-Object type -eq 'page' | Select-Object -First 1
    $ws.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    Invoke-CDP 'Runtime.enable' | Out-Null
    Invoke-CDP 'Log.enable' | Out-Null
    Invoke-CDP 'Page.enable' | Out-Null
    Invoke-CDP 'Network.enable' | Out-Null
    Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=1440; height=1000; deviceScaleFactor=1; mobile=$false } | Out-Null
    Invoke-CDP 'Page.navigate' @{ url="http://127.0.0.1:$Port/" } | Out-Null
    Invoke-JS 'new Promise(resolve => { const check = () => document.readyState === "complete" ? resolve(true) : setTimeout(check, 50); check(); })' | Out-Null
    if ($VisualThemes) {
        . (Join-Path $PSScriptRoot 'visual-themes.ps1')
    } elseif ($Live) {
        Start-Sleep -Seconds 5
        $result = Invoke-JS '({title:document.title,login:!document.getElementById("telaLogin").hidden,picker:!!document.getElementById("campoCor"),initialized:!!document.getElementById("tituloData").textContent})'
        Write-Output ($result | ConvertTo-Json -Compress)
        if (-not $result.login -or -not $result.initialized -or -not $result.picker) { throw 'Inicializacao real incompleta.' }
    } else {
        Invoke-JS ('document.getElementById("visualTheme").value="' + $Skin + '";document.getElementById("visualTheme").dispatchEvent(new Event("change"))') | Out-Null
        $checks = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'browser-checks.js'))
        $result = Invoke-JS ('(' + $checks + ')()')
        $result | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $artifactDir 'functional.json') -Encoding UTF8
        Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
        if (-not $result.ok) { throw 'Os testes funcionais falharam.' }
        if ($DiagnoseToggle) {
            $diagnosis = Invoke-JS '(async()=>{const m=window.__mock,day=document.getElementById("dataSelecionada").value;for(const id of ["diag-mark","diag-toggle"])m.seed(id,{data:day,texto:"Diagnostico",concluido:false,grifos:[],versaoGrifos:2});document.getElementById("abrirPaleta").click();const hex=document.getElementById("hexCor");hex.value="#FF1493";hex.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("aplicarGrifo").click();const results=[];for(const action of ["mark","toggle"]){document.querySelector("[data-id=diag-"+action+"] [data-action="+action+"]").click();await new Promise(r=>setTimeout(r,100));results.push({action,global:localStorage.getItem("caderno-marker-color"),payload:m.writes.at(-1).value})}return results})()'
            Write-Output ($diagnosis | ConvertTo-Json -Depth 10 -Compress)
            return
        }
        Invoke-CDP 'Page.reload' | Out-Null
        Start-Sleep -Milliseconds 350
        $reloadChecks = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'reload-checks.js'))
        $reload = Invoke-JS ('(' + $reloadChecks + ')()')
        $reload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $artifactDir 'reload.json') -Encoding UTF8
        Write-Output ($reload | ConvertTo-Json -Depth 10 -Compress)
        Invoke-CDP 'Page.reload' | Out-Null
        Start-Sleep -Milliseconds 350
        $removedReload = Invoke-JS ('(' + $reloadChecks + ')(true)')
        $removedReload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $artifactDir 'removed-reload.json') -Encoding UTF8
        Write-Output ($removedReload | ConvertTo-Json -Depth 10 -Compress)
        $selectionAction = Invoke-JS '(()=>{const row=document.querySelector("[data-id=first]"),text=row.querySelector(".note-text").firstChild,range=document.createRange();range.setStart(text,0);range.setEnd(text,6);getSelection().removeAllRanges();getSelection().addRange(range);document.dispatchEvent(new Event("selectionchange"));const b=row.querySelector("[data-action=mark]").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()'
        Invoke-CDP 'Input.dispatchMouseEvent' @{type='mousePressed';x=$selectionAction.x;y=$selectionAction.y;button='left';clickCount=1} | Out-Null
        Invoke-CDP 'Input.dispatchMouseEvent' @{type='mouseReleased';x=$selectionAction.x;y=$selectionAction.y;button='left';clickCount=1} | Out-Null
        $wholeInk = Invoke-JS 'new Promise(resolve=>setTimeout(()=>{const row=document.querySelector("[data-id=first]");resolve(row.querySelector("mark")?.textContent===row.querySelector(".note-text").textContent)},100))'
        if (-not $wholeInk) { throw 'Grifar deve ignorar selecao parcial e cobrir a nota inteira.' }
        Write-Output 'WHOLE_NOTE_MOUSE=PASS (selecao parcial ignorada)'
        Invoke-CDP 'DOM.enable' | Out-Null
        Invoke-CDP 'CSS.enable' | Out-Null
        $dom = Invoke-CDP 'DOM.getDocument'
        $noteNode = Invoke-CDP 'DOM.querySelector' @{ nodeId=$dom.root.nodeId; selector='.note-text' }
        $fonts = Invoke-CDP 'CSS.getPlatformFontsForNode' @{ nodeId=$noteNode.nodeId }
        $fonts | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $artifactDir 'fonts.json') -Encoding UTF8
        Invoke-JS 'document.getElementById("abrirPaleta").click()' | Out-Null
        $field = Invoke-JS '(()=>{const r=document.getElementById("campoCor").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,before:document.getElementById("hexCor").value,writes:window.__mock.writes.length}})()'
        Invoke-CDP 'Input.dispatchMouseEvent' @{ type='mousePressed'; x=($field.x+$field.w*.2); y=($field.y+$field.h*.2); button='left'; clickCount=1 } | Out-Null
        Invoke-CDP 'Input.dispatchMouseEvent' @{ type='mouseMoved'; x=($field.x+$field.w*.8); y=($field.y+$field.h*.7); buttons=1 } | Out-Null
        Invoke-CDP 'Input.dispatchMouseEvent' @{ type='mouseReleased'; x=($field.x+$field.w*.8); y=($field.y+$field.h*.7); button='left'; clickCount=1 } | Out-Null
        $mouse = Invoke-JS '({color:document.getElementById("hexCor").value,writes:window.__mock.writes.length,preview:document.getElementById("previewGrifo").style.getPropertyValue("--highlight")})'
        if ($mouse.color -eq $field.before -or $mouse.color -ne $mouse.preview -or $mouse.writes -ne $field.writes) { throw 'Arraste de mouse/preview falhou.' }
        Invoke-JS 'document.getElementById("fecharPaleta").click()' | Out-Null
        Write-Output 'MOUSE_DRAG=PASS (preview sem escrita remota)'
        $viewports = @()
        foreach ($width in @(1920,1440,1280,1024,768,430,390,375,320)) {
            foreach ($theme in @('light','dark')) {
                Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=$width; height=1000; deviceScaleFactor=1; mobile=$false } | Out-Null
                Invoke-JS ('document.documentElement.dataset.theme="' + $theme + '"; new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))') | Out-Null
                $layout = Invoke-JS '(()=>{const w=document.getElementById("workspace"),p=document.getElementById("pagina");return {width:innerWidth,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,workspaceOverflow:w.scrollWidth>w.clientWidth,pageWidth:p.getBoundingClientRect().width,heading:document.getElementById("tituloData").getBoundingClientRect().width}})()'
                $viewports += $layout
                $shot = Invoke-CDP 'Page.captureScreenshot' @{ format='png'; captureBeyondViewport=$false }
                [IO.File]::WriteAllBytes((Join-Path $artifactDir "$width-$theme.png"), [Convert]::FromBase64String($shot.data))
                if ($layout.overflow -or $layout.workspaceOverflow) {
                    Write-Output ($layout | ConvertTo-Json -Compress)
                    Write-Output (Invoke-JS 'JSON.stringify({client:document.getElementById("workspace").clientWidth,scroll:document.getElementById("workspace").scrollWidth,items:[...document.querySelectorAll("#workspace *")].filter(e=>{const r=e.getBoundingClientRect();return r.width && (r.right>innerWidth+1 || r.left < -1)}).map(e=>({tag:e.tagName,id:e.id,cls:e.className,width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))})')
                    throw "Overflow em $width / $theme"
                }
            }
        }
        $viewports | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $artifactDir 'viewports.json') -Encoding UTF8
        $mobileChecks = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'responsive-checks.js'))
        $mobileResult = Invoke-JS ('(' + $mobileChecks + ')()')
        $mobileResult | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $artifactDir 'mobile.json') -Encoding UTF8
        Write-Output ($mobileResult | ConvertTo-Json -Depth 10 -Compress)
        Invoke-CDP 'Emulation.setTouchEmulationEnabled' @{ enabled=$true; maxTouchPoints=1 } | Out-Null
        Invoke-JS 'document.getElementById("abrirPaleta").click()' | Out-Null
        $field = Invoke-JS '(()=>{const r=document.getElementById("campoCor").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,before:document.getElementById("hexCor").value,writes:window.__mock.writes.length}})()'
        Invoke-CDP 'Input.dispatchTouchEvent' @{ type='touchStart'; touchPoints=@(@{x=($field.x+$field.w*.2);y=($field.y+$field.h*.3)}) } | Out-Null
        Invoke-CDP 'Input.dispatchTouchEvent' @{ type='touchMove'; touchPoints=@(@{x=($field.x+$field.w*.7);y=($field.y+$field.h*.8)}) } | Out-Null
        Invoke-CDP 'Input.dispatchTouchEvent' @{ type='touchEnd'; touchPoints=@() } | Out-Null
        $touch = Invoke-JS '({color:document.getElementById("hexCor").value,writes:window.__mock.writes.length,preview:document.getElementById("previewGrifo").style.getPropertyValue("--highlight")})'
        if ($touch.color -eq $field.before -or $touch.color -ne $touch.preview -or $touch.writes -ne $field.writes) { throw 'Arraste de toque/preview falhou.' }
        $shot = Invoke-CDP 'Page.captureScreenshot' @{ format='png'; captureBeyondViewport=$false }
        [IO.File]::WriteAllBytes((Join-Path $artifactDir 'picker-mobile.png'), [Convert]::FromBase64String($shot.data))
        Invoke-JS 'document.getElementById("fecharPaleta").click()' | Out-Null
        Write-Output 'TOUCH_DRAG=PASS (preview sem escrita remota)'
        Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=390; height=800; deviceScaleFactor=1; mobile=$true } | Out-Null
        Invoke-JS 'document.getElementById("novoItem").focus()' | Out-Null
        Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=390; height=360; deviceScaleFactor=1; mobile=$true } | Out-Null
        $shortViewport = Invoke-JS 'new Promise(resolve=>setTimeout(()=>{const b=document.getElementById("btnAdicionar").getBoundingClientRect();const v=visualViewport;resolve({top:b.top,bottom:b.bottom,height:v.height,offset:v.offsetTop,overflow:document.documentElement.scrollWidth>innerWidth});},150))'
        if ($shortViewport.overflow -or $shortViewport.bottom -gt ($shortViewport.height+$shortViewport.offset) -or $shortViewport.top -lt $shortViewport.offset) { throw 'Adicionar oculto no viewport reduzido.' }
        Invoke-JS 'document.getElementById("abrirPaleta").click()' | Out-Null
        $shortPicker = Invoke-JS '(()=>{const r=document.getElementById("paleta").getBoundingClientRect();return r.top>=visualViewport.offsetTop && r.bottom<=visualViewport.offsetTop+visualViewport.height})()'
        if (-not $shortPicker) { throw 'Paleta saiu do viewport reduzido.' }
        Invoke-JS 'document.getElementById("fecharPaleta").click()' | Out-Null
        Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=390; height=1000; deviceScaleFactor=1; mobile=$false } | Out-Null
        Write-Output 'SHORT_VIEWPORT=PASS (Adicionar e seletor em 390x360; teclado fisico requer teste manual)'
        Invoke-CDP 'Emulation.setEmulatedMedia' @{ features=@(@{name='prefers-reduced-motion';value='reduce'}) } | Out-Null
        $reduced = Invoke-JS '(async()=>{const before=document.getElementById("dataSelecionada").value;document.getElementById("proximoDia").click();await new Promise(r=>setTimeout(r,200));return {changed:document.getElementById("dataSelecionada").value!==before,animations:document.getElementById("pagina").getAnimations().length}})()'
        if (-not $reduced.changed -or $reduced.animations -ne 0) { throw 'Falha em reduced-motion.' }
        Write-Output 'RESPONSIVE=PASS (9 widths x 2 themes); REDUCED_MOTION=PASS'
    }
    $errors = @($script:events | Where-Object { $_.method -eq 'Runtime.exceptionThrown' -or ($_.method -eq 'Log.entryAdded' -and $_.params.entry.level -eq 'error') })
    $errors | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath (Join-Path $artifactDir 'console-errors.json') -Encoding UTF8
    if ($errors.Count) { Write-Output ($errors | ConvertTo-Json -Depth 10 -Compress); throw 'Erros no console do navegador.' }
    Write-Output 'CONSOLE=PASS (zero errors)'
} finally {
    $ws.Dispose()
    if (-not $KeepOpen) {
        if ($browser -and -not $browser.HasExited) { Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue }
        if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
    }
}
