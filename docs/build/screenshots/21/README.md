# Prompt 21 browser captures

Playwright writes the measured shell captures in this directory. They are
TEST_ONLY review evidence, not approved production design certification.

| Capture | CSS viewport / condition | Result |
|---|---|---|
| `desktop-target-1920x1080.png` | 1920 × 1080 | no horizontal document overflow |
| `desktop-common-1440x900.png` | 1440 × 900 | no horizontal document overflow |
| `desktop-minimum-1280x720.png` | 1280 × 720 | no horizontal document overflow |
| `tablet-landscape-1024x768.png` | 1024 × 768 | no horizontal document overflow |
| `text-zoom-200.png` | 1280 × 720 with root text at 200% | no horizontal document overflow; controls remain present |

The values are asserted by `tests/e2e/ui-shell.spec.ts`; the final run reported
9/9 passing browser tests. Screenshot review found no clipping or hidden
controls. Human novice playtesting and production browser certification remain
outstanding.
