# Verification

## Automated checks

Run from the repository root with a current Node.js installation:

```sh
node tests/output-options.test.js
node tests/camera-picker.test.js
```

No npm dependencies are required. These tests parse the full script and exercise
its output and camera helpers without launching DAZ. All metadata is synthetic;
`fixtures/cameras.json` is a minimal metadata example, not a renderable scene.

The 93 assertions cover output formats and filenames, legacy defaults, animation
and camera suffixes, Windows filename restrictions, output collisions, camera
instance overrides, duplicate labels, missing selections, referenced definitions,
reference cycles, Unicode labels, and the camera named `ALL` edge case.

## Native checks performed

Windows, DAZ Studio 6 Public Build 6.26.2026.30002:

- The output-options revision produced valid 16x16 PNG, JPEG, TIFF, and BMP images.
  Each image decoded in its selected format. Filename/type choices survived
  closing and reopening the queue. Invalid filename input returned to the dialog;
  editing a completed job reset that job's completion state.
- The camera-picker revision listed four cameras from both plain and gzip DUF
  files while the current scene remained empty (zero nodes and no scene filename).
  A relative DSF camera reference resolved; malformed JSON reported a scan failure.
- Dropdown selection and Refresh preserved a Unicode camera label. After the
  queue was reopened, two actual renders used the selected cameras, as confirmed
  by the DAZ render log. Both output PNGs decoded at 16x16.
- Starting the queue with unsaved scene changes showed the save warning and did
  not start a render.

The tests used disposable scenes and separate queue state/preferences. Native
fixtures and machine-specific logs are not included in this contribution.

## Reproduce the camera demonstration

1. Create a disposable scene with two distinctly positioned cameras named
   **Front** and **Side**. Save it as a DUF; repeat with compression enabled to
   exercise both file encodings.
2. Clear the scene after saving, then launch the queue. Leave automatic shutdown
   unchecked and select a fresh output folder.
3. Add the saved scene and double-click its queue item. Confirm the Camera list
   shows Front and Side while DAZ's scene remains empty.
4. Choose Side, enter `side-test`, and select JPEG. Accept, close the queue, and
   reopen it; confirm the choices are retained.
5. Start the queue. Confirm `side-test.jpg` is a JPEG rendered from Side, using
   the scene's saved render settings.
6. To check Refresh, save a camera rename in the DUF and refresh or reopen its
   Scene Options. Confirm the saved name appears. Unsaved changes should not.

Use disposable scenes for additional missing/duplicate camera checks. A missing
selection must stop rendering with an explanation rather than select another
camera. Distinct labels disambiguate duplicate internal names; identical names
and labels require a rename.

## Coverage limits

Native execution was verified on the Windows Public Build listed above.
Production-sized scenes, macOS, older DAZ versions, crash recovery, automatic
shutdown, and complete animated/multi-camera render batches were not exercised.
Animation and multi-camera filename generation is covered by automated checks.
JPEG quality and TIFF bit depth remain DAZ defaults. Saved camera discovery reads
explicit camera instances; it does not execute scripts to discover dynamic ones.
