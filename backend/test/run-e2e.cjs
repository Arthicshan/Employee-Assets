const { spawnSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({quiet: true});
const schema = `assessment_test_${Date.now()}`;
const url = new URL(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);
url.searchParams.set('schema', schema);
const env = {...process.env, DATABASE_URL: url.toString(), TEST_DATABASE_URL: url.toString()};
function run(script, args) {
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', script, ...args], {env, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status}`);
}
void (async () => {
  let failed = false;
  try {
    console.log(`Running E2E tests in isolated schema ${schema}`);
    run(require.resolve('prisma/build/index.js'), ['migrate', 'deploy']);
    run(require.resolve('ts-node/dist/bin.js'), ['prisma/seed.ts']);
    run(require.resolve('jest/bin/jest'), ['--config', './test/jest-e2e.json', '--runInBand', ...process.argv.slice(2)]);
  } catch (error) { console.error(error.message); failed = true; }
  finally {
    const client = new PrismaClient({datasources: {db: {url: url.toString()}}});
    try {
      await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      console.log('Temporary test schema removed.');
    } catch (error) {console.error('Test schema cleanup failed:', error.message); failed = true;}
    await client.$disconnect();
  }
  process.exitCode = failed ? 1 : 0;
})();
