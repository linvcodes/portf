# REFERENCE.md — Stage 0 Analysis
Source: `Portfolio/website basic mockup.png` (1920 × 3804, measured)
Base fig: `Daily Hero 3 – Arkkhe (Copy).fig` → template #03 Enchanted Diary — **motion mechanics only, zero pixels reused**

## Measured palette (sampled, not described)
| Metric | Value |
|---|---|
| light_frac | 0.72 |
| dark_frac  | 0.07 |
| saturation | 0.18 |
| dominant hues | 210° sky · 60–90° grass · 0° goldfish orange |

Anchors: sky `#488ec9` main / `#2765c8` edge (from user filename), grass green, white type, goldfish orange `#f26a1b`.

## Typography
- **Display** — Cross Stitch Cursive W95 (CC BY 4.0, local). Hero only. Attribution link required in footer.
- **Body/UI** — Imprima (already in fig, Google Fonts).
- Hero is a two-line question, line 2 indented right, mixed size — deliberate hand-placed feel, not centered.
- Section labels are bracketed monospace `[Whats on my laptop...]` — underlined, typewriter register.
- **Contrast note:** white display type over sky at 210° passes AA only above ~48px. Small white text over sky must gain a shadow or move onto the scrim.

## Layer / z-order plan (hero)
| z | layer | source | parallax |
|---|---|---|---|
| 0 | sky gradient | CSS radial `#488ec9`→`#2765c8` | static |
| 1 | clouds | `clouds.png` ✅ 5000×2219 α | ±10px slowest |
| 2 | grass horizon | `Background grass.png` ✅ 880×587 α | ±22px |
| 3 | hero display type | live text | ±0 (anchor) |
| 4 | goldfish ×3 | `goldfish.png` ✅ + 2 webp | ±46px fastest |
| 5 | **figure + hand** | ❌ GENERATE | ±60px, breaks frame |
| 6 | scrim band | `Rectangle 1` equiv, 0.6 α | static |

Fig confirms overflow is native: `Group 50` 1688.9w and `bg1 1` 1516.3w both exceed the 1440 frame at negative x. The fourth-wall hand is the template's own device.

## Motion (decoded from fig, real curves)
- Hero doors/reveal: `cubic-bezier(1.0000, 0.0100, 0.0200, 1.0000)` @ 2.0s
- Secondary: `cubic-bezier(0.4037, -0.0259, 0.0000, 0.9886)` @ 1.0s
- Overshoot (sticker pops): `cubic-bezier(1.0000, -0.0296, 0.0000, 1.0946)` @ 1.0s
- Cursor parallax = continuous loop, NOT entrance. Grid 48 col / 60px / 8px gutter / 24px offset.

## Layout
80% content width = 38.4 of 48 cols → snap **38 cols**. Card trio = 12.67 each. Scrim band starts 61.4% down frame (y=497/810), height 38.6%.
