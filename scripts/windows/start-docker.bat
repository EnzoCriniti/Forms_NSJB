@echo off
setlocal
cd /d "%~dp0..\.."

echo Iniciando NSJB Forms com Docker...
echo.
docker compose -f docker\compose.yml up -d
if errorlevel 1 (
  echo Falha ao subir a stack Docker.
  exit /b 1
)

set "LOCAL_IP="
for /f "delims=" %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$items = Get-NetIPAddress -AddressFamily IPv4; foreach ($item in $items) { $alias = $item.InterfaceAlias; if ($item.IPAddress -notlike '127.*' -and $item.IPAddress -notlike '169.254*' -and $item.IPAddress -ne '0.0.0.0' -and $item.AddressState -eq 'Preferred' -and $alias -notlike '*vEthernet*' -and $alias -notlike '*WSL*' -and $alias -notlike '*Docker*') { $item.IPAddress; break } }"') do if not defined LOCAL_IP set "LOCAL_IP=%%I"
if not defined LOCAL_IP set "LOCAL_IP=127.0.0.1"
set "LOCAL_IP=%LOCAL_IP: =%"

echo No notebook: http://127.0.0.1:5173/
echo No celular: http://%LOCAL_IP%:5173/
echo Formularios publicos: http://%LOCAL_IP%:5173/#/f/slug
echo API local (nao e a interface do app): http://127.0.0.1:8787/
echo.
docker compose -f docker\compose.yml ps
