$filePath = "d:\antigravity\My Apps\Med Prep\client\src\pages\flashcards\FlashSpace.tsx"
$lineArray = Get-Content $filePath -Encoding UTF8

Write-Host "Total lines before: $($lineArray.Length)"

# Remove lines 12290 through 12504 (1-indexed), which is array indices 12289 through 12503
# Keep everything before index 12289 and everything from index 12504 onwards
$newLines = $lineArray[0..12288] + $lineArray[12504..($lineArray.Length - 1)]

Write-Host "Total lines after: $($newLines.Length)"
Write-Host "Line 12289 (0-indexed 12288): $($newLines[12288])"
Write-Host "Line 12290 (0-indexed 12289): $($newLines[12289])"
Write-Host "Line 12291 (0-indexed 12290): $($newLines[12290])"

# Write back with CRLF line endings
$newContent = $newLines -join "`r`n"
[System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)

Write-Host "File saved successfully!"
