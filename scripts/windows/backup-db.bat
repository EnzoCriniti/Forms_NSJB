@echo off
setlocal
cd /d "%~dp0..\.."

if not exist "backups" mkdir "backups"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "DT=%%I"
set "STAMP=%DT:~0,8%_%DT:~8,6%"
set "OUTFILE=backups\nsjb_forms_%STAMP%.dump"

echo Gerando backup do banco em %OUTFILE% ...
docker exec -t nsjb-postgres pg_dump -U nsjb -d nsjb_forms -Fc > "%OUTFILE%"
if errorlevel 1 (
  echo Falha ao gerar o backup. A stack Docker esta rodando?
  exit /b 1
)

echo Backup concluido: %OUTFILE%
