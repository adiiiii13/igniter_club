Add-Type -AssemblyName System.Drawing
$imgPath = "d:\WEBSITES BUILT\IGNINTERS\ignite club\Parallax-website-main\img\jis-uni-preview.png"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Find where the squircle ends and text begins
# Let's inspect rows around 70-80% height
$splitY = [int]($bmp.Height * 0.73)

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($y -ge $splitY -and $c.A -gt 15) {
            # Make the blue line and UNIVERSITY text pure bright white
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 255, 255, 255))
        } else {
            $outBmp.SetPixel($x, $y, $c)
        }
    }
}
$bmp.Dispose()

$outPath = "d:\WEBSITES BUILT\IGNINTERS\ignite club\Parallax-website-main\img\jis-uni-white-text.png"
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Success: jis-uni-white-text.png created"
