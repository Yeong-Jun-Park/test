---
title: Command reference
description: Command-line options and defaults for FuNPrep.
---

Run FuNPrep through its main entry point:

```bash
bash "${FuNPrep}/funp" [options]
```

Set the `FuNPrep` environment variable to the directory containing
`funp` before running a command.

Option names and method values are case-sensitive. The current parser
uses single-hyphen options.

## Argument conventions

Options fall into two categories:

| Type | Example | Usage |
| --- | --- | --- |
| Switch | `-T1w_preproc` | Include the option without a following value |
| Value option | `-threads 6` | Follow the option with its value |

For example:

```bash
-T1w_preproc -threads 6
```

Do not append `TRUE` to a module switch.

Use the literal value `None` where shown in the examples.
Quote filesystem paths containing spaces, although paths without spaces
are preferable with the current shell implementation.

## Common options

| Option | Default | Description |
| --- | --- | --- |
| `-bids PATH` | Not set | Input dataset root |
| `-out PATH` | Not set | Output root |
| `-sub ID` | Not set | Subject identifier without `sub-` |
| `-ses ID` | Not set | Session identifier without `ses-`; use `None` for no session |
| `-fs_license PATH` | Not set | FreeSurfer license path passed to workflows that use it |
| `-procDir PATH` | Automatically created when needed | Disposable processing directory |
| `-device VALUE` | `cpu` | Device selection for supported steps |
| `-threads N` | `6` | Requested thread count for supported steps |
| `-h`, `-help` | — | Print the built-in help and exit |

Supply the dataset root, output root, and subject identifier for
processing. For clarity, explicitly use `-ses None` when no session
directory is present.

The built-in help is abbreviated. The option tables on this page
describe the supplied argument parser.

### Device and threads

`cpu` and `gpu` are checked by particular processing branches.
Selecting `gpu` does not make every command GPU-accelerated.

Likewise, `-threads` is passed to commands that support it; it is not
a global limit on every process started by external software.

### Temporary directory

If `-procDir` is omitted, the entry point creates a temporary directory
when a selected module starts.

If supplied, the directory must be dedicated to that run. Its contents
may be deleted during processing, and the directory may be removed
during cleanup or error handling.

## Module switches

All four modules are disabled by default.

| Switch | Enables |
| --- | --- |
| `-T1w_preproc` | Structural processing |
| `-dwi_preproc` | Diffusion processing |
| `-func_preproc` | Functional processing |
| `-micro_preproc` | Microstructural processing |

Selecting multiple modules runs them in the fixed order:

1. Structural
2. Diffusion
3. Functional
4. Microstructure

Changing their order in the command does not change execution order.

## Structural options

| Option | Default | Implemented selections |
| --- | --- | --- |
| `-Recon_Method VALUE` | `Freesurfer` | `Freesurfer`, `DeepPrep` |
| `-BF_method VALUE` | `N4BiasFieldCorrection` | `N4BiasFieldCorrection` |
| `-Skull_method VALUE` | `mri_synthstrip` | `mri_synthstrip` |
| `-Seg_method VALUE` | `mri_synthseg` | `mri_synthseg` |
| `-Registration_method VALUE` | `ANTs` | `ANTs`, `SynthMorph` |

Registration selection is also passed to downstream modules.
Availability of a code branch does not establish compatibility with
every possible combination of processing options.

## Diffusion options

| Option | Default | Description |
| --- | --- | --- |
| `-dwi_file_name STEM` | `64dir-AP_dwi` | Main input filename portion |
| `-dwi_rev_file_name STEM` | `None` | Reverse phase-encoding input filename portion |
| `-GDC_Method_dwi VALUE` | `None` | `TOPUP`, `SyN`, or `None` |
| `-tract_method VALUE` | `iFOD2` | Tracking algorithm passed to `tckgen` |
| `-tract_num VALUE` | `10M` | Requested streamline count |
| `-tract_scaling_method VALUE` | `SIFT2` | Selects the implemented SIFT2 weighting branch |

Filename portions exclude the subject/session prefix and file extension.

For example:

```text
Input:  sub-01_dir-AP_dwi.nii.gz
Option: -dwi_file_name dir-AP_dwi
```

The documented tractography configuration uses `iFOD2` and `SIFT2`.
The parser does not maintain a validated list of alternative tracking
algorithms or scaling methods.

## Functional options

| Option | Default | Description |
| --- | --- | --- |
| `-func_file_name STEM` | `task-rest_bold` | Main input filename portion |
| `-func_rev_file_name STEM` | `None` | Reverse phase-encoding input filename portion |
| `-GDC_Method_func VALUE` | `None` | `TOPUP`, `SyN`, or `None` |
| `-TR_thr SECONDS` | `2` | Apply slice-timing correction when TR exceeds this value |
| `-slice_order PATH` | `None` | Custom slice-order file passed to `slicetimer --ocustom` |
| `-FIX_train_file_name STEM` | `None` | FIX training-file stem; `None` selects ICA-AROMA |
| `-FWHM MM` | `5` | Surface smoothing full width at half maximum |

The FIX branch constructs the training-file path as:

```text
/usr/local/fix/training_files/STEM.RData
```

Supply the stem, without the directory or `.RData` extension.

## Microstructural options

| Option | Default | Description |
| --- | --- | --- |
| `-micro_type VALUE` | `None` | `ratio` selects measured-image ratio processing |
| `-micro_file_name STEM` | `None` | Input filename portion in `anat/` |
| `-NUM_SURFACES N` | `14` | Parameter passed to the equivolumetric surface generator |
| `-LS_MAT` | Disabled | Switch enabling the synthesized-T2w route |
| `-age VALUE` | `None` | Passed to the synthesis script |
| `-sex VALUE` | `None` | Passed to the synthesis script |

When LS-MAT is enabled, its synthesis branch takes precedence over
the measured-image ratio branch.

Without LS-MAT or `-micro_type ratio`, the current implementation follows
the direct-image processing branch. It does not validate a fixed list
of quantitative image types.

## Options not connected to the main workflow

The parser recognizes `-flair_preproc` and `-flair_file_name`, but the
supplied `funp` entry point does not dispatch a FLAIR module.

These options are therefore not documented as an executable workflow
through the main entry point.

## Example: select two modules

The following illustrates structural and diffusion processing in the
same invocation. Replace paths and acquisition names before use.

```bash
bash "${FuNPrep}/funp" \
  -bids /path/to/bids \
  -out /path/to/derivatives/FuNPrep \
  -sub 01 \
  -ses None \
  -fs_license "$FS_LICENSE" \
  -T1w_preproc \
  -dwi_preproc \
  -dwi_file_name dir-AP_dwi \
  -dwi_rev_file_name dir-PA_dwi \
  -GDC_Method_dwi TOPUP \
  -threads 6
```

Structural processing runs first. Diffusion processing then uses the
anatomical outputs in the same output root.

Inspect the individual module logs and outputs; reaching a later module
alone does not confirm that every earlier processing step succeeded.