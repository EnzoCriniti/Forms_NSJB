@echo off
setlocal
cd /d "%~dp0..\.."

echo Logs da stack Docker do NSJB Forms...
echo Pressione Ctrl+C para sair.
echo.
docker compose -f docker\compose.yml logs -f %*
