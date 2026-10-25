---
title: Functional MRI
description: Process fMRI data and derive functional connectivity features.
---

The functional workflow prepares and denoises fMRI data, projects
signals onto cortical surfaces, and constructs connectivity features.

## Before you start

- Complete structural processing in the same output root.
- Provide the functional NIfTI image and matching JSON sidecar.
- Confirm that the NIfTI header contains the correct TR.
- Configure the denoising software required by your selected branch.

The example below uses:

```text
sub-01/func/sub-01_task-rest_bold.nii.gz
sub-01/func/sub-01_task-rest_bold.json
```

## Run the workflow

This example explicitly omits susceptibility-distortion correction.
Choose a suitable correction branch when supported by your acquisition
and analysis plan.

```bash
export FuNPrep="/absolute/path/to/FuNPrep"

bash "${FuNPrep}/funp" \
  -bids /path/to/bids \
  -out /path/to/derivatives/FuNPrep \
  -sub 01 \
  -ses None \
  -func_preproc \
  -func_file_name task-rest_bold \
  -GDC_Method_func None \
  -Registration_method ANTs \
  -TR_thr 2 \
  -FIX_train_file_name None \
  -FWHM 5 \
  -threads 6
```

## Main options

| Option | Default | Purpose |
| --- | --- | --- |
| `-func_file_name` | `task-rest_bold` | Main input filename portion |
| `-func_rev_file_name` | `None` | Reverse input filename portion |
| `-GDC_Method_func` | `None` | `TOPUP`, `SyN`, or no selected correction |
| `-TR_thr` | `2` | TR threshold in seconds for slice-timing correction |
| `-slice_order` | `None` | Custom slice-order file passed to `slicetimer` |
| `-FIX_train_file_name` | `None` | FIX training-file stem; `None` selects the ICA-AROMA branch |
| `-FWHM` | `5` | Surface smoothing FWHM in millimeters |
| `-threads` | `6` | Requested thread count |

## Initial volumes and slice timing

The code calculates the number of initial volumes to remove using
a 10-second target and the NIfTI-header TR.

Slice-timing correction runs only when:

```text
TR > TR_thr
```

When correction runs, a supplied `-slice_order` file is passed to
`slicetimer` using `--ocustom`. Without this file, the code uses `--odd`.

The JSON `SliceTiming` array is not automatically used.

## Denoising

### ICA-AROMA branch

The default:

```bash
-FIX_train_file_name None
```

selects the ICA-AROMA branch. The expected script location is:

```text
${FuNPrep}/functions/ICA-AROMA/ICA_AROMA.py
```

### FIX branch

For a training-file stem such as `StudyTraining`, use:

```bash
-FIX_train_file_name StudyTraining
```

The current code constructs this path:

```text
/usr/local/fix/training_files/StudyTraining.RData
```

Pass the stem without `.RData`, not an arbitrary full path.
The classification threshold is fixed at `20` in the supplied code.

A compatible training file and correctly configured FIX environment
are required.

## Distortion correction

For TOPUP, select both acquisitions explicitly:

```bash
-GDC_Method_func TOPUP \
-func_file_name task-rest_dir-AP_bold \
-func_rev_file_name task-rest_dir-PA_bold
```

The reverse image and JSON are expected in `func/`.
See Input preparation for acquisition metadata and the current
readout-time assumption.

The `SyN` branch uses anatomical information and additional dependencies
for fieldmap-less correction.

## Results

| Location | Main contents |
| --- | --- |
| `func/` | Functional image outputs |
| `features/func/Timeseries/` | Surface time-series outputs |
| `features/func/` | Functional connectivity and related features |
| `xfm/` | Transformations |
| `logs/` | Processing logs |

## Inspect the result

Inspect motion, functional-to-anatomical alignment, denoising results,
surface coverage, and extracted time series before interpreting
connectivity features.

In the supplied source, the final completion-status update is commented
out. Check logs and expected outputs rather than relying on
`Processed_sub.csv` to identify functional completion.