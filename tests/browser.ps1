param([switch]$Serve, [switch]$Live, [int]$Port = 8876, [string]$BrowserPath, [switch]$KeepOpen)
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
                    $types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.png'='image/png' }
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
$browserArgs = @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',"--remote-debugging-port=$debugPort",'--remote-allow-origins=http://localhost', ('--user-data-dir="' + $profilePath + '"'), 'about:blank')
$browser = Start-Process -FilePath $BrowserPath -WindowStyle Hidden -ArgumentList $browserArgs -PassThru
$ws = [Net.WebSockets.ClientWebSocket]::new()
$script:messageId = 0
$script:events = [Collections.Generic.List[object]]::new()
function Invoke-CDP([string]$Method, [hashtable]$Params = @{}) {
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
    Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=1440; height=1000; deviceScaleFactor=1; mobile=$false } | Out-Null
    Invoke-CDP 'Page.navigate' @{ url="http://127.0.0.1:$Port/" } | Out-Null
    Invoke-JS 'new Promise(resolve => { const check = () => document.readyState === "complete" ? resolve(true) : setTimeout(check, 50); check(); })' | Out-Null
    if ($Live) {
        Start-Sleep -Seconds 5
        $result = Invoke-JS '({title:document.title,login:!document.getElementById("telaLogin").hidden,colors:document.querySelectorAll(".marker-color").length})'
        Write-Output ($result | ConvertTo-Json -Compress)
    } else {
        $checks = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'browser-checks.js'))
        $result = Invoke-JS ('(' + $checks + ')()')
        $result | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $artifactDir 'functional.json') -Encoding UTF8
        Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
        if (-not $result.ok) { throw 'Os testes funcionais falharam.' }
        $viewports = @()
        foreach ($width in @(1920,1440,1280,1024,768,430,390,375)) {
            foreach ($theme in @('light','dark')) {
                Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{ width=$width; height=1000; deviceScaleFactor=1; mobile=$false } | Out-Null
                Invoke-JS ('document.documentElement.dataset.theme="' + $theme + '"; new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))') | Out-Null
                $layout = Invoke-JS '(()=>{const w=document.getElementById("workspace"),p=document.getElementById("pagina");return {width:innerWidth,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,workspaceOverflow:w.scrollWidth>w.clientWidth,pageWidth:p.getBoundingClientRect().width,heading:document.getElementById("tituloData").getBoundingClientRect().width}})()'
                $viewports += $layout
                if ($layout.overflow -or $layout.workspaceOverflow) { throw "Overflow em $width / $theme" }
                $shot = Invoke-CDP 'Page.captureScreenshot' @{ format='png'; captureBeyondViewport=$false }
                [IO.File]::WriteAllBytes((Join-Path $artifactDir "$width-$theme.png"), [Convert]::FromBase64String($shot.data))
            }
        }
        $viewports | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $artifactDir 'viewports.json') -Encoding UTF8
        Invoke-CDP 'Emulation.setEmulatedMedia' @{ features=@(@{name='prefers-reduced-motion';value='reduce'}) } | Out-Null
        $reduced = Invoke-JS '(async()=>{const before=document.getElementById("dataSelecionada").value;document.getElementById("proximoDia").click();await new Promise(r=>setTimeout(r,200));return {changed:document.getElementById("dataSelecionada").value!==before,animations:document.getElementById("pagina").getAnimations().length}})()'
        if (-not $reduced.changed -or $reduced.animations -ne 0) { throw 'Falha em reduced-motion.' }
        Write-Output 'RESPONSIVE=PASS (8 widths x 2 themes); REDUCED_MOTION=PASS'
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
