import { SystemAuditEngine } from '../src/engines/systemAuditEngine';

const suite = SystemAuditEngine.runFullTestSuite();
const release = SystemAuditEngine.evaluateReleaseGates();

console.log('Fulgor IA Analicer Economic — automated audit');
console.log(JSON.stringify(suite.summary, null, 2));

for (const test of suite.tests) {
  console.log(`${test.passed ? 'PASS' : 'FAIL'} ${test.testId}: ${test.name} — ${test.details}`);
}

const gatesPassed = release.gates.filter((gate) => gate.status === 'PASSED').length;
console.log(`Release gates passed: ${gatesPassed}/${release.gates.length}`);
console.log(`Release status: ${release.report.overallStatus}`);

if (suite.summary.failed > 0) {
  console.error(`Automated audit failed: ${suite.summary.failed} check(s) failed.`);
  process.exitCode = 1;
}

if (gatesPassed > 0 || release.report.overallStatus === 'READY FOR RELEASE') {
  console.error('Release gate error: demo code must not certify production readiness.');
  process.exitCode = 1;
}
