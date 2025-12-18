
$base64Path = "e:\Antigravity\icon_base64.txt"
$cssPath = "e:\Antigravity\style.css"

try {
    $base64 = Get-Content $base64Path -Raw
    $base64 = $base64.Trim()
    
    $css = Get-Content $cssPath -Raw -Encoding UTF8
    
    # Construct new URL
    $newUrl = "url('data:image/png;base64," + $base64 + "')"
    
    # Replace
    $newCss = $css.Replace("url('instagram_icon.png')", $newUrl)
    
    # Write back
    $newCss | Set-Content $cssPath -Encoding UTF8
    Write-Host "Successfully embedded icon."
}
catch {
    Write-Host "Error: $_"
}
