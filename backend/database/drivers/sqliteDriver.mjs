/**
 * @file backend/database/drivers/sqliteDriver.mjs
 * @summary Driver SQLite.
 * @responsibility Expor queries, execucao e transacoes em cima do runtime SQLite atual.
 */

const toParams = params => Array.isArray(params) ? params : [];

const buildExecuteMetadata = result => ({
  rowCount: Number(result?.changes || 0),
  lastInsertId: result?.lastInsertRowid === undefined || result?.lastInsertRowid === null
    ? null
    : Number(result.lastInsertRowid),
});

const buildSqliteFacade = driver => ({
  queryOne(sql, params = []) {
    return driver.prepare(sql).get(...toParams(params)) || null;
  },
  queryMany(sql, params = []) {
    return driver.prepare(sql).all(...toParams(params));
  },
  execute(sql, params = []) {
    return buildExecuteMetadata(driver.prepare(sql).run(...toParams(params)));
  },
  exec(sql) {
    return driver.exec(sql);
  },
  close() {
    return driver.close();
  },
  withTransaction(callback) {
    driver.exec("BEGIN IMMEDIATE");
    try {
      const result = callback(buildSqliteFacade(driver));
      if (result && typeof result.then === "function") {
        return result.then(
          value => {
            driver.exec("COMMIT");
            return value;
          },
          error => {
            try {
              driver.exec("ROLLBACK");
            } catch {
              // ignore rollback failures; the original error matters more
            }
            throw error;
          },
        );
      }
      driver.exec("COMMIT");
      return result;
    } catch (error) {
      try {
        driver.exec("ROLLBACK");
      } catch {
        // ignore rollback failures; the original error matters more
      }
      throw error;
    }
  },
});

export const createSqliteDriver = driver => buildSqliteFacade(driver);
