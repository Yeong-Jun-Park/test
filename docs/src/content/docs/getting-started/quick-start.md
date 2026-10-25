---
title: Quick start
description: Configure a single-subject structural MRI run.
---

This example introduces a single-subject structural workflow.
Complete the installation and environment setup before running it.

## 1. Prepare your input

For a subject without sessions, place a compressed T1-weighted image at:

```text
/path/to/bids/sub-01/anat/sub-01_T1w.nii.gz
```

The structural workflow searches the subject's anatomical directory
for files ending in `_T1w.nii.gz` or `_T1w.nii`.

Use a single compressed T1w image for this first example.

## 2. Set your paths

Replace all example paths with your own locations.

```bash
export FuNPrep="/absolute/path/to/FuNPrep"
export FS_LICENSE="/absolute/path/to/license.txt"

bids_dir="/path/to/bids"
output_dir="/path/to/derivatives/FuNPrep"

mkdir -p "$output_dir"
```

Keep the output directory separate from the input images.

## 3. Run structural processing

```bash
bash "${FuNPrep}/funp" \
  -bids "$bids_dir" \
  -out "$output_dir" \
  -sub 01 \
  -ses None \
  -fs_license "$FS_LICENSE" \
  -T1w_preproc \
  -Recon_Method Freesurfer \
  -Registration_method ANTs \
  -device cpu \
  -threads 6
```

| Argument | Meaning |
| --- | --- |
| `-bids` | Root directory containing the input subjects |
| `-out` | Root output directory |
| `-sub 01` | Subject identifier without the `sub-` prefix |
| `-ses None` | No session directory |
| `-T1w_preproc` | Enable structural processing |
| `-Recon_Method Freesurfer` | Select FreeSurfer reconstruction; spelling is case-sensitive |
| `-Registration_method ANTs` | Select ANTs registration |
| `-device cpu` | Select CPU mode for steps that use this setting |
| `-threads 6` | Requested thread count for steps that accept it |

With these settings, the pipeline uses N4 bias-field correction,
SynthStrip skull stripping, and SynthSeg segmentation.

:::caution[Temporary processing directory]
This example omits `-procDir`, allowing FuNPrep to create a temporary
directory automatically.

If you supply `-procDir`, use a dedicated disposable directory for
that run. The pipeline deletes its contents during processing and
may remove the directory itself. Never use your input, output,
repository, or a shared working directory.
:::

## 4. Inspect the outputs

For this example, subject outputs are written beneath:

```text
/path/to/derivatives/FuNPrep/sub-01/
```

Start with:

| Location | What to inspect |
| --- | --- |
| `logs/` | Structural processing log |
| `anat/` | Prepared anatomical images, masks, and segmentations |
| `surfRecon/` | Surface reconstruction outputs |
| `surf/` | Processed surfaces and surface metrics |
| `xfm/` | Spatial transformation files |
| `parc/` | Parcellation outputs |

The root output directory also contains `Processed_sub.csv`.

Inspect the logs and expected outputs before accepting a run as
successful. A completion label alone is not sufficient validation.

## Subjects with sessions

For an input such as:

```text
/path/to/bids/sub-01/ses-01/anat/sub-01_ses-01_T1w.nii.gz
```

use:

```bash
-sub 01 -ses 01
```

The subject output directory becomes `sub-01/ses-01/`.

## Continue with other modalities

Diffusion, functional, and microstructural workflows use anatomical
outputs. Prepare the required structural outputs before running those
modules, or enable structural processing in the same invocation.

Each modality requires additional inputs and options described in its
workflow guide.

## Related guides

- [Prepare your inputs](../input-preparation/)
- [Explore the workflows](../../workflows/)
- [Find command-line options](../../reference/command-reference/)
- [Understand the outputs](../../reference/outputs/)
- [Troubleshoot a run](../../reference/troubleshooting/)