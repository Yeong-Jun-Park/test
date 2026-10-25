---
title: Diffusion MRI
description: Process diffusion images and construct structural connectomes.
---

The diffusion workflow prepares diffusion data, estimates diffusion
features, performs tractography, and constructs structural connectomes.

## Before you start

Complete structural processing for the same subject/session in the
same output root.

For the TOPUP example below, provide forward and reverse acquisitions
in the subject's `dwi/` directory, with matching gradient and metadata files.

Example acquisition stems:

```text
sub-01_dir-AP_dwi
sub-01_dir-PA_dwi
```

The reverse acquisition is imported with its `.bvec` and `.bval` files
before b=0 extraction.

## Run with reverse phase-encoding data

This example assumes that the acquisition metadata and reverse images
are suitable for TOPUP processing.

```bash
export FuNPrep="/absolute/path/to/FuNPrep"

bash "${FuNPrep}/funp" \
  -bids /path/to/bids \
  -out /path/to/derivatives/FuNPrep \
  -sub 01 \
  -ses None \
  -dwi_preproc \
  -dwi_file_name dir-AP_dwi \
  -dwi_rev_file_name dir-PA_dwi \
  -GDC_Method_dwi TOPUP \
  -Registration_method ANTs \
  -tract_method iFOD2 \
  -tract_num 10M \
  -tract_scaling_method SIFT2 \
  -threads 6
```

## Main options

| Option | Default | Purpose |
| --- | --- | --- |
| `-dwi_file_name` | `64dir-AP_dwi` | Main input filename portion |
| `-dwi_rev_file_name` | `None` | Reverse input filename portion |
| `-GDC_Method_dwi` | `None` | Distortion-correction selection |
| `-tract_method` | `iFOD2` | Algorithm passed to `tckgen` |
| `-tract_num` | `10M` | Requested streamline count |
| `-tract_scaling_method` | `SIFT2` | SIFT2 streamline-weight estimation |
| `-threads` | `6` | Requested thread count |

Filename options exclude the subject/session prefix and file extension.

## Distortion-correction choices

| Value | Current behavior |
| --- | --- |
| `TOPUP` | Uses forward/reverse b=0 information with the MRtrix/FSL preprocessing workflow |
| `SyN` | Estimates a fieldmap-less deformation and applies it to diffusion volumes |
| `None` | Uses `dwifslpreproc` with `-rpe_none`, without TOPUP or the SyN branch |

The SyN branch requires additional Python dependencies and reference
resources. It should be validated for the intended acquisition before use.

Selecting `None` does not skip motion/eddy-current processing.
The workflow still reads phase-encoding direction and total readout
time from the main JSON sidecar.

## Tractography

The current implementation uses anatomical constraints and dynamic
seeding. Several tracking parameters are fixed in the code rather than
exposed as command-line options.

`-tract_num` controls the requested streamline count. A smaller count
may be useful for an initial execution check, but does not establish
that the resulting connectome is suitable for the final analysis.

The documented configuration uses `SIFT2`; do not assume that other
scaling method names correspond to implemented alternatives.

## Results

Inspect these locations beneath the subject/session output directory:

| Location | Main contents |
| --- | --- |
| `dwi/` | Processed diffusion data and diffusion-model outputs |
| `features/dwi/` | Connectivity and other diffusion-derived features |
| `parc/` | Parcellation outputs |
| `xfm/` | Transformations |
| `logs/` | Processing logs |

Some intermediate files are removed during cleanup.

## Inspect the result

1. Review motion and distortion-correction results.
2. Inspect diffusion-to-anatomy alignment.
3. Inspect tissue constraints and parcellation alignment.
4. Check tractography and connectome outputs for unexpected missing regions
   or implausible patterns.
5. Review logs before accepting the run as complete.