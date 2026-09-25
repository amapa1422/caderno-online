# Same browser, fixtures, viewport and motion settings, before/after CP-0015.
# Baseline product files are read from Git into ignored test artifacts; no restore.
$baselineDir = Join-Path $artifactDir 'baseline'
New-Item -ItemType Directory -Force -Path $baselineDir | Out-Null
foreach ($name in @('index.html','style.css','app.js','color.js','accounts.js','visual-themes.js','visual-themes.css')) {
    $source = git -C $repoRoot show "CP-0015:$name"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read baseline $name" }
    [IO.File]::WriteAllText((Join-Path $baselineDir $name), ($source -join "`n"), [Text.UTF8Encoding]::new($false))
}
# Explicitly use test-only Firebase even for the copied baseline page.
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'firebase.mock.js') -Destination (Join-Path $baselineDir 'firebase.js')
Copy-Item -LiteralPath (Join-Path $repoRoot 'icone.png') -Destination $baselineDir
Copy-Item -LiteralPath (Join-Path $repoRoot 'assets') -Destination $baselineDir -Recurse -Force
Add-Type -AssemblyName System.Drawing
if (-not ('NormalPixelDiff' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing;
public class NormalPixelDiff {
 public static int[] Compare(string a, string b, int left, int top, int right, int bottom) {
  using(var x = new Bitmap(a)) using(var y = new Bitmap(b)) {
   int total=0, outside=0, minX=x.Width,minY=x.Height,maxX=0,maxY=0;
   for(int j=0;j<x.Height;j++) for(int i=0;i<x.Width;i++) if(x.GetPixel(i,j)!=y.GetPixel(i,j)) {
    total++;
    if(i<left || i>right || j<top || j>bottom) {outside++;minX=Math.Min(minX,i);minY=Math.Min(minY,j);maxX=Math.Max(maxX,i);maxY=Math.Max(maxY,j);}
   }
   return new int[]{total,outside,minX,minY,maxX,maxY};
  }
 }
}
'@
}
$comparisons = @()
foreach ($size in @(@(1440,900),@(390,844))) {
    Invoke-CDP 'Emulation.setDeviceMetricsOverride' @{width=$size[0];height=$size[1];deviceScaleFactor=1;mobile=($size[0] -lt 500)} | Out-Null
    foreach ($mode in @('light','dark')) {
        Invoke-JS ('localStorage.setItem("caderno-theme","' + $mode + '");localStorage.setItem("caderno-visual-theme","normal")') | Out-Null
        foreach ($version in @('before','after')) {
            $url = "http://127.0.0.1:$Port/"
            if ($version -eq 'before') { $url += 'tests/.artifacts/baseline/index.html' }
            Invoke-CDP 'Page.navigate' @{url=$url} | Out-Null
            Start-Sleep -Milliseconds 500
            Invoke-JS '(async()=>{for(let i=0;i<200&&(!window.__mock||!document.getElementById("tituloData")?.textContent);i++)await new Promise(r=>setTimeout(r,25));await window.__mock.changeUser({uid:"test-user",email:"teste@example.com"});await new Promise(requestAnimationFrame);await new Promise(r=>setTimeout(r,400));})()' | Out-Null
            $shot = Invoke-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
            [IO.File]::WriteAllBytes((Join-Path $artifactDir "normal-$version-$($size[0])-$mode.png"),[Convert]::FromBase64String($shot.data))
            if ($version -eq 'after') {
                $rect = Invoke-JS '(()=>{const r=document.querySelector(".appearance-picker").getBoundingClientRect();return {left:Math.floor(r.left)-1,top:Math.floor(r.top)-1,right:Math.ceil(r.right)+1,bottom:Math.ceil(r.bottom)+1}})()'
            }
        }
        $diff = [NormalPixelDiff]::Compare((Join-Path $artifactDir "normal-before-$($size[0])-$mode.png"),(Join-Path $artifactDir "normal-after-$($size[0])-$mode.png"),$rect.left,$rect.top,$rect.right,$rect.bottom)
        $record = @{width=$size[0];mode=$mode;changedPixels=$diff[0];outsideAppearancePicker=$diff[1];bounds=@($diff[2],$diff[3],$diff[4],$diff[5])}
        $comparisons += $record
        Write-Output ($record | ConvertTo-Json -Compress)
    }
}
$comparisons | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $artifactDir 'normal-comparison.json') -Encoding UTF8
if (@($comparisons | Where-Object outsideAppearancePicker -gt 0).Count) { throw 'Normal differs outside the new appearance control. Inspect saved before/after images.' }
Write-Output 'NORMAL_PIXELS=PASS (CP-0015 vs current, light/dark, desktop/mobile; only appearance control differs)'
