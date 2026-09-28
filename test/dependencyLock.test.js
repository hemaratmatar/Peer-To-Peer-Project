const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const envKeys = file => fs.readFileSync(path.join(root, file), 'utf8')
  .split(/\r?\n/)
  .filter(line => /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line))
  .map(line => line.split('=', 1)[0].trim())
  .sort();

test('runtime, dependencies, lockfiles and environment keys stay synchronized', () => {
  const rootPackage = readJson('package.json');
  const frontendPackage = readJson('front-knowledge/package.json');
  const lock = readJson('package-lock.json');

  for (const manifest of [rootPackage, frontendPackage]) {
    for (const version of Object.values({ ...manifest.dependencies, ...manifest.devDependencies })) {
      assert.match(version, /^\d+\.\d+\.\d+$/, `Dependency version must be exact: ${version}`);
    }
  }

  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(lock.packages[''].dependencies, rootPackage.dependencies);
  assert.deepEqual(lock.packages[''].devDependencies || {}, rootPackage.devDependencies || {});
  assert.deepEqual(lock.packages[''].workspaces, rootPackage.workspaces);
  assert.deepEqual(lock.packages['front-knowledge'].dependencies, frontendPackage.dependencies);
  assert.deepEqual(rootPackage.workspaces, ['front-knowledge']);
  assert.equal(fs.existsSync(path.join(root, 'front-knowledge/package-lock.json')), false);
  assert.equal(fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(), rootPackage.engines.node);
  assert.equal(rootPackage.packageManager, `npm@${rootPackage.engines.npm}`);
  assert.deepEqual(envKeys('.env.example'), ['JWT_SECRET', 'MONGODB_DB', 'MONGODB_URI', 'PORT']);
  assert.deepEqual(envKeys('.env'), ['JWT_SECRET', 'MONGODB_DB', 'MONGODB_URI', 'PORT']);
});
