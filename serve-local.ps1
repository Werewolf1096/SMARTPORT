$ErrorActionPreference = "Stop"

$prefix = "http://127.0.0.1:8000/"
$root = "c:\Users\svbig\Desktop\SMARTPORT"

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $relativePath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
      }

      $safeRelativePath = $relativePath.Replace('/', '\')
      $fullPath = Join-Path $root $safeRelativePath
      $resolvedPath = [System.IO.Path]::GetFullPath($fullPath)

      if (-not $resolvedPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        continue
      }

      $extension = [System.IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()
      $contentType = switch ($extension) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".svg"  { "image/svg+xml" }
        ".ico"  { "image/x-icon" }
        ".png"  { "image/png" }
        ".jpg"  { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".webp" { "image/webp" }
        ".json" { "application/json; charset=utf-8" }
        default { "application/octet-stream" }
      }

      $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
      $response.StatusCode = 200
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.LongLength
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    catch {
      $response.StatusCode = 500
      $buffer = [System.Text.Encoding]::UTF8.GetBytes("Server Error")
      $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    finally {
      $response.OutputStream.Close()
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
