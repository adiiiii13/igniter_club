Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap('d:\WEBSITES BUILT\IGNINTERS\ignite club\Parallax-website-main\img\igniter-logo.png')
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Content Bounding Box: X=$minX..$maxX, Y=$minY..$maxY (W=$($maxX - $minX), H=$($maxY - $minY))"

# Crop tight without empty margin
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Dispose()

$outPath = 'd:\WEBSITES BUILT\IGNINTERS\ignite club\Parallax-website-main\img\igniter-tight.png'
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
Write-Host "Created igniter-tight.png ($cropW x $cropH)"
