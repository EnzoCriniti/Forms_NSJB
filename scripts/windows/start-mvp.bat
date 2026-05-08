@echo off
setlocal
set "ROOT=%~dp0..\.."
cd /d "%ROOT%"
set "PATH=%ROOT%\tools\node;%PATH%"
echo Iniciando NSJB Forms com frontend React e API SQLite local...
echo.
echo Encerrando instancias antigas deste projeto, se existirem...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$root = (Resolve-Path '%ROOT%').Path; Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($root) -and ($_.CommandLine -like '*backend\index.mjs*' -or $_.CommandLine -like '*vite*bin*vite.js*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo.
echo Acesse o endereco que aparecer abaixo.
set "LOCAL_IP="
for /f "delims=" %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notlike ''127.*'' -and $_.IPAddress -notlike ''169.254*'' -and $_.IPAddress -ne ''0.0.0.0'' -and $_.AddressState -eq ''Preferred'' } ^| Select-Object -ExpandProperty IPAddress -First 1"') do if not defined LOCAL_IP set "LOCAL_IP=%%I"
if not defined LOCAL_IP set "LOCAL_IP=127.0.0.1"
set "LOCAL_IP=%LOCAL_IP: =%"
echo No notebook: http://127.0.0.1:5173/
echo No celular: http://%LOCAL_IP%:5173/
echo Formularios publicos: http://%LOCAL_IP%:5173/#/f/slug
echo API local (nao e a interface do app): http://127.0.0.1:8787/
echo Se a porta 5173 estiver ocupada, o Vite vai falhar em vez de mudar de porta.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:5173'"
"%ROOT%\tools\node\npm.cmd" run dev
