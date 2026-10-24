# Verification loop prompt

After implementation, do not ask whether the code looks correct. Execute the checks.

- Unit behavior: run the relevant backend/frontend tests.
- Contract behavior: compare API response keys with `.brain/contracts/api-contract.md`.
- Runtime behavior: run the actual API/UI flow for changed features.
- Negative behavior: test missing evidence, conflicts, parser failure, network failure, and export lock where applicable.
- Boundary behavior: search changed output for unsupported claims such as official compliance, collision prediction, conjunction assessment, or maneuver advice.

If verification fails, classify the failure as code, contract, environment, or scope. Repair only code/contract/environment failures. For scope failures, create a new task instead of hiding the issue.
