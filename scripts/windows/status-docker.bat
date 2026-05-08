@echo off
setlocal
cd /d "%~dp0..\.."

echo Status da stack Docker do NSJB Forms...
echo.
docker compose -f docker\compose.yml ps
