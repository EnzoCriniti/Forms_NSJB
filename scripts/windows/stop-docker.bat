@echo off
setlocal
cd /d "%~dp0..\.."

echo Encerrando NSJB Forms no Docker...
echo.
docker compose -f docker\compose.yml down
if errorlevel 1 (
  echo Falha ao encerrar a stack Docker.
  exit /b 1
)

echo Stack Docker encerrada.
