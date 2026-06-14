$ErrorActionPreference = "Stop"

$root = "c:\Users\svbig\Desktop\SMARTPORT"
$port = "8000"

Set-Location $root
python serve-local.py --host 127.0.0.1 --port $port
