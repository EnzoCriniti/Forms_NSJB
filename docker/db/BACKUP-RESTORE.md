# Backup e Restore do PostgreSQL

Os dados do NSJB Forms (formularios, respostas, escala, participacao/BI, equipes,
usuarios e camadas) vivem no volume `postgres_data` do container `nsjb-postgres`.
Perder esse volume e perder o historico. Este guia mostra como gerar e restaurar
backups.

## Pre-requisitos

- A stack Docker rodando (`docker compose -f docker/compose.yml ps`).
- Container do banco: `nsjb-postgres` (usuario `nsjb`, banco `nsjb_forms`).

## Backup manual

Gera um dump comprimido com timestamp na pasta `backups/` local:

```bash
mkdir -p backups
docker exec -t nsjb-postgres pg_dump -U nsjb -d nsjb_forms -Fc \
  > "backups/nsjb_forms_$(date +%Y%m%d_%H%M%S).dump"
```

- `-Fc` = formato custom (comprimido, restauravel com `pg_restore`).
- Para um SQL texto simples, troque `-Fc` por `--format=plain` e salve como `.sql`.

No Windows (PowerShell), use o atalho:

```powershell
scripts/windows/backup-db.bat
```

## Restore

> Restaurar SOBRESCREVE os dados atuais. Faca um backup antes, se houver duvida.

A partir de um dump `-Fc`:

```bash
# 1. (opcional) recria o banco do zero
docker exec -i nsjb-postgres psql -U nsjb -d postgres -c "DROP DATABASE IF EXISTS nsjb_forms;"
docker exec -i nsjb-postgres psql -U nsjb -d postgres -c "CREATE DATABASE nsjb_forms;"

# 2. restaura o dump
docker exec -i nsjb-postgres pg_restore -U nsjb -d nsjb_forms --clean --if-exists \
  < backups/nsjb_forms_AAAAMMDD_HHMMSS.dump
```

De um dump `.sql` (formato plain):

```bash
docker exec -i nsjb-postgres psql -U nsjb -d nsjb_forms < backups/arquivo.sql
```

Depois de restaurar, reinicie o backend para reaplicar o `ensureSchema` idempotente:

```bash
docker compose -f docker/compose.yml restart backend
```

## Recomendacoes

- **Agende** o backup (cron no host, ou um job do sistema) — ex.: diario, retendo 7-30 dias.
- **Guarde fora da maquina** (storage/objeto remoto): o backup junto do volume nao protege contra perda do host.
- **Teste o restore** periodicamente em um banco descartavel; backup que nunca foi restaurado nao e backup.
- O segredo de cifra (`NSJB_SECRET_KEY`) NAO fica no dump: guarde-o separadamente. Sem ele, o token do Twilio cifrado nao e recuperavel (basta reconfigurar o token).
