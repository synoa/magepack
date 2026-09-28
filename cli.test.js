const { spawnSync } = require('child_process');
const path = require('path');

const { version } = require('./package.json');

const runCli = (...args) =>
    spawnSync(process.execPath, [path.join(__dirname, 'cli.js'), ...args], {
        encoding: 'utf8',
    });

describe('magepack CLI', () => {
    test('prints the current version', () => {
        const result = runCli('--version');

        expect(result.status).toBe(0);
        expect(result.stdout.trim()).toBe(version);
    });

    test('prints usage listing both commands', () => {
        const result = runCli('--help');

        expect(result.status).toBe(0);
        expect(result.stdout).toContain('generate [options]');
        expect(result.stdout).toContain('bundle [options]');
    });

    test('fails when required generate options are missing', () => {
        const result = runCli('generate');

        expect(result.status).toBe(1);
        expect(result.stderr).toContain(
            "required option '--cms-url <url>' not specified"
        );
    });
});
