@echo off
setlocal
cd /d "%~dp0..\.."

echo Reiniciando NSJB Forms no Docker com rebuild...
echo.
docker compose -f docker\compose.yml down
if errorlevel 1 (
  echo Falha ao encerrar a stack Docker.
  exit /b 1
)

docker compose -f docker\compose.yml up -d --build
if errorlevel 1 (
  echo Falha ao subir a stack Docker.
  exit /b 1
)

echo.
docker compose -f docker\compose.yml ps
