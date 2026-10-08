#!/usr/bin/env python3
"""Static authoring fixture validator; NOT a gameplay simulation or data validator."""
from pathlib import Path
import json, re, sys
root = Path(__file__).parent
source = Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'AFRICAN_MANDATE_STAGE2_PACKAGE3_FOUR_MONTH_GAMEPLAY_SPEC_v0_1.md'
fixture = json.loads((root/'authoring_fixtures.json').read_text())
content=source.read_text()
section=content.split('## 4. Strategic decision catalogue')[1].split('## 5. First four months')[0]
actions=re.findall(r'`(action_[a-z0-9_]+)`\s*\|',section)
assert actions, 'No action catalogue rows detected'
assert len(set(actions))==len(actions), 'Duplicate catalogue action ID'
errors=[]
for s in fixture['scripts']:
    if len(s['months'])!=4: errors.append(f"{s['id']}: wrong month count")
    for idx,month in enumerate(s['months'],1):
        if len(month)>fixture['decisionsPerMonth']: errors.append(f"{s['id']} month {idx}: more than three actions")
        for a in month:
            if a not in actions: errors.append(f"{s['id']}: unknown action {a}")
if fixture['classification']!='TEST_ONLY_NOT_EXECUTABLE_SIMULATION':errors.append('fixture lacks test-only marker')
assert not errors,'\n'.join(errors)
print('STATIC_AUTHORING_CHECK: PASS')
print(f'catalogue_actions={len(actions)} script_templates={len(fixture["scripts"])} decisions_per_month={fixture["decisionsPerMonth"]}')
print('SIMULATION_TESTS: NOT RUN (no compiled ScenarioBundle/engine supplied)')
print('RELEASE_GATE: BLOCKED')
