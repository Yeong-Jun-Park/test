---
title: Troubleshooting
description: Diagnose input, environment, and processing problems.
---

Begin with the log for the affected module. Locate the earliest
relevant error and inspect the command and input paths immediately
before it.

Later errors may be consequences of an earlier failed step.

## Find the relevant log

Replace the example path with your subject/session output directory.

```bash
subject_dir="/path/to/derivatives/FuNPrep/sub-01"

ls -lt "$subject_dir/logs/"
```

Inspect a selected log:

```bash
tail -n 100 "$subject_dir/logs/SELECTED_LOG.txt"
```

Search for common error messages:

```bash
grep -nEi \
  'error|failed|traceback|command not found|no such file' \
  "$subject_dir/logs/SELECTED_LOG.txt"
```

Search matches are clues, not a definitive success/failure test.

## Common problems

| Symptom | What to check |
| --- | --- |
| Supporting scripts cannot be found | `FuNPrep` must point to the directory containing `funp` and `functions/` |
| `command not found` | Initialize the relevant software environment in the shell running the pipeline |
| No T1w image found | Check the subject/session `anat/` path and `_T1w` filename ending |
| DWI or fMRI input missing | Check the exact filename generated from the subject/session prefix and filename option |
| JSON metadata is `null` | Check the sidecar and required acquisition fields |
| Reverse-DWI import fails | Check the reverse image and matching `.bvec`/`.bval` files |
| ICA-AROMA script missing | Check `functions/ICA-AROMA/ICA_AROMA.py` |
| FIX training file missing | Check the training-file stem and `/usr/local/fix/training_files/` |
| Surface or transform missing | Verify that structural processing completed in the same output root |
| Permission denied | Check access to inputs and write permissions for output and temporary locations |

## Check environment variables

```bash
printf 'FuNPrep: %s\n' "$FuNPrep"
printf 'FS_LICENSE: %s\n' "$FS_LICENSE"

test -f "${FuNPrep}/funp" && echo "Entry point exists"
test -r "$FS_LICENSE" && echo "License is readable"
```

The license check verifies readability, not license validity.

## Check acquisition metadata

For a diffusion or functional JSON sidecar:

```bash
jq '{
  PhaseEncodingDirection,
  TotalReadoutTime
}' /path/to/acquisition.json
```

Use the actual acquisition metadata. Do not infer these values solely
from filename labels such as `AP` or `PA`.

The functional workflow reads TR from the NIfTI header:

```bash
fslinfo /path/to/functional_image.nii.gz
```

Inspect `pixdim4` and confirm that it represents the intended TR.

## Existing outputs are skipped

Several processing functions skip work when a particular output file
already exists.

This does not verify that:

- The earlier run completed successfully.
- All expected outputs exist.
- Inputs and parameters are unchanged.
- Existing outputs are valid.

When testing changed settings, a separate output root provides a clear
separation from previous results. Generate the required anatomical
outputs there before running dependent modules.

Do not delete the entire dataset to resolve a skip condition.

## Incomplete FreeSurfer reconstruction

Inspect:

```text
surfRecon/scripts/recon-all.log
```

The reconstruction branch checks for the text:

```text
finished without error
```

If the directory exists without that completion message, investigate
the underlying FreeSurfer failure. FuNPrep does not automatically repair
or resume that incomplete reconstruction.

## Functional completion is absent from the status file

In the supplied source, the final status-update block in
`func_preproc.sh` is commented out.

A missing functional `COMPLETE` record alone does not establish failure.
Inspect the functional log, processed images, time series, and connectomes.

## Temporary files disappear

Temporary directories are deliberately cleaned during processing.
The error handler may also remove the processing directory.

Use `-procDir` only with a dedicated disposable directory for the run.
Do not use a shared directory or a location containing input data.

## Connectivity contains invalid values

For functional outputs, inspect:

- Missing segmentation labels.
- Empty cortical parcels.
- Constant or invalid regional time series.
- Registration and surface coverage.

For microstructural outputs, inspect:

- Image-to-surface alignment.
- Invalid image values.
- Constant or poorly sampled profiles.
- Missing regional data.

MPC processing replaces non-finite matrix values with zero, so checking
only the final matrix for NaNs is insufficient.

## Information to include when reporting a problem

Provide:

1. The FuNPrep version or Git commit.
2. The selected module and full command, with private paths redacted if needed.
3. Relevant software versions.
4. Whether outputs from an earlier run were reused.
5. The earliest relevant error and surrounding log lines.
6. Input filenames and shapes relevant to the failure.

Do not include identifiable participant data.