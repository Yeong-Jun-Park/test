---
title: Input preparation
description: Organize input images and select the files used by each workflow.
---

FuNPrep constructs input paths from the dataset root, subject,
optional session, modality directory, and filename options.

The examples below describe paths used by the current implementation.
They are not a complete specification of BIDS compliance.

## Subject and session identifiers

Pass identifiers without their directory prefixes.

| Input directory | Arguments |
| --- | --- |
| `sub-01/` | `-sub 01 -ses None` |
| `sub-01/ses-01/` | `-sub 01 -ses 01` |

Set `-bids` to the dataset root containing the subject directories,
not to an individual subject or modality directory.

## Example input paths

For a subject without sessions:

| Modality | Example path relative to the dataset root |
| --- | --- |
| T1w | `sub-01/anat/sub-01_T1w.nii.gz` |
| T2w | `sub-01/anat/sub-01_T2w.nii.gz` |
| Diffusion | `sub-01/dwi/sub-01_dir-AP_dwi.nii.gz` |
| Functional | `sub-01/func/sub-01_task-rest_bold.nii.gz` |

With a session, include the session in both the directory and filename:

```text
sub-01/ses-01/func/sub-01_ses-01_task-rest_bold.nii.gz
```

## How filename options work

For diffusion, functional, and microstructural inputs, provide the
filename portion after the subject/session prefix and before the extension.

| Input filename | Argument |
| --- | --- |
| `sub-01_dir-AP_dwi.nii.gz` | `-dwi_file_name dir-AP_dwi` |
| `sub-01_task-rest_bold.nii.gz` | `-func_file_name task-rest_bold` |
| `sub-01_task-rest_run-02_bold.nii.gz` | `-func_file_name task-rest_run-02_bold` |
| `sub-01_T2w.nii.gz` | `-micro_file_name T2w` |

Do not include the full path, subject/session prefix, or `.nii.gz`
extension in these options.

These workflows construct an exact filename; they do not automatically
select all matching runs.

## Structural MRI

Place T1-weighted images in the subject/session `anat/` directory.

The structural workflow searches for:

```text
*_T1w.nii.gz
*_T1w.nii
```

When multiple matching T1w images are present, the code invokes
FreeSurfer's `mri_robust_template`.

For a first run, use a single compressed T1w image and confirm that
the directory contains only the acquisitions intended for processing.

## Diffusion MRI

Provide the following files with matching stems:

```text
sub-01_dir-AP_dwi.nii.gz
sub-01_dir-AP_dwi.bvec
sub-01_dir-AP_dwi.bval
sub-01_dir-AP_dwi.json
```

Select this acquisition with:

```bash
-dwi_file_name dir-AP_dwi
```

The current diffusion correction function reads these JSON fields:

| Field | Purpose |
| --- | --- |
| `PhaseEncodingDirection` | Phase-encoding direction |
| `TotalReadoutTime` | Total readout time in seconds |

These values are read even when TOPUP is not selected.

### Reverse phase-encoding data

The TOPUP branch expects reverse phase-encoding data in the same
`dwi/` directory, with its own matching filenames.

Example selection:

```bash
-GDC_Method_dwi TOPUP \
-dwi_file_name dir-AP_dwi \
-dwi_rev_file_name dir-PA_dwi
```

The current reverse-DWI processing path uses `.bvec` and `.bval` files
to import the reverse acquisition and extract its b=0 volumes.
A reverse image alone is insufficient for this implementation.

## Functional MRI

Provide a compressed functional image and its matching JSON sidecar:

```text
sub-01_task-rest_bold.nii.gz
sub-01_task-rest_bold.json
```

Select the image with:

```bash
-func_file_name task-rest_bold
```

The current workflow reads TR from the NIfTI header.
Ensure that the header contains the correct temporal spacing.

The distortion-correction function also reads
`PhaseEncodingDirection` and `TotalReadoutTime` from the JSON sidecar.

### Reverse phase-encoding data

For functional TOPUP correction, the reverse image and its JSON
sidecar are currently expected in the same `func/` directory.

Example selection:

```bash
-GDC_Method_func TOPUP \
-func_file_name task-rest_dir-AP_bold \
-func_rev_file_name task-rest_dir-PA_bold
```

The code does not automatically discover reverse images from a
`fmap/` directory or resolve `IntendedFor` associations.

The current TOPUP implementation uses the forward acquisition's
`TotalReadoutTime` for both directions. Confirm that this assumption
matches your acquisitions before using this branch.

### Slice timing

Slice-timing correction is applied when the NIfTI-header TR exceeds
`-TR_thr`, whose default is `2`.

If `-slice_order` is provided, its value is passed to FSL `slicetimer`
as a custom slice-order file. Otherwise, the code uses `--odd`.

The current implementation does not automatically read the JSON
`SliceTiming` array.

## Microstructural MRI

Microstructural inputs are read from the subject/session `anat/`
directory.

For a T1w/T2w ratio workflow, an example input is:

```text
sub-01/anat/sub-01_T2w.nii.gz
```

Select it with:

```bash
-micro_type ratio \
-micro_file_name T2w
```

The ratio workflow uses processed T1w outputs from the structural
module and prepares the selected additional image.

The optional LS-MAT route requires separate software resources and
additional inputs; it is not needed for the measured-T2w example.

## Check before processing

- Confirm that subject and session identifiers match the directory names.
- Confirm that filename options reproduce the intended input paths.
- Keep diffusion images, gradients, and JSON sidecars matched.
- Verify phase-encoding metadata from the acquisition information;
  labels such as `AP` and `PA` are not substitutes for JSON metadata.
- Ensure that required anatomical outputs exist for downstream modules.
- Use separate input, output, and disposable temporary directories.