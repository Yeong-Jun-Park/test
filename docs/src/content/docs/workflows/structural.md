---
title: Structural MRI
description: Process T1-weighted images and prepare anatomical surfaces.
---

The structural workflow prepares anatomical images, segmentations,
transformations, and cortical surfaces used by downstream modules.

## Before you start

- Complete the installation and environment setup.
- Place the intended T1w image in the subject's `anat/` directory.
- Configure a valid FreeSurfer license.
- Use an output directory separate from your input data.

This example uses:

```text
/path/to/bids/sub-01/anat/sub-01_T1w.nii.gz
```

## Run the workflow

Replace the example paths with your own locations.

```bash
export FuNPrep="/absolute/path/to/FuNPrep"
export FS_LICENSE="/absolute/path/to/license.txt"

bash "${FuNPrep}/funp" \
  -bids /path/to/bids \
  -out /path/to/derivatives/FuNPrep \
  -sub 01 \
  -ses None \
  -fs_license "$FS_LICENSE" \
  -T1w_preproc \
  -Recon_Method Freesurfer \
  -Registration_method ANTs \
  -device cpu \
  -threads 6
```

## Main options

Option names and method values are case-sensitive.

| Option | Default | Purpose |
| --- | --- | --- |
| `-Recon_Method` | `Freesurfer` | Surface reconstruction; the code also includes a `DeepPrep` branch |
| `-BF_method` | `N4BiasFieldCorrection` | Bias-field correction |
| `-Skull_method` | `mri_synthstrip` | Skull stripping |
| `-Seg_method` | `mri_synthseg` | Volume segmentation |
| `-Registration_method` | `ANTs` | Registration; the code also includes a `SynthMorph` branch |
| `-device` | `cpu` | Device selection for steps that use this setting |
| `-threads` | `6` | Requested thread count for steps that accept it |

The bias correction, skull-stripping, and segmentation options currently
have one implemented method each. They are not interchangeable names
for arbitrary external tools.

### Alternative reconstruction

Selecting:

```bash
-Recon_Method DeepPrep
```

uses the Docker-based DeepPrep branch. The supplied code references
the image `pbfslab/deepprep:25.1.0`.

This branch requires Docker and a license file supplied through
`-fs_license`. GPU execution additionally requires a compatible
container GPU environment.

## Results

Outputs are written beneath the selected subject/session directory.

| Location | Main contents |
| --- | --- |
| `anat/` | Prepared T1w images, brain masks, and segmentations |
| `surfRecon/` | Reconstruction outputs |
| `surf/` | Surfaces and surface metrics |
| `xfm/` | Spatial transformations |
| `parc/` | Parcellation outputs |
| `logs/` | Processing logs |

## Inspect the result

Before using these outputs in another module:

1. Inspect the brain mask and segmentation against the anatomical image.
2. Inspect anatomical registration.
3. Inspect white and pial surfaces against cortical anatomy.
4. Check the processing log and reconstruction log for failures.

The FreeSurfer branch checks `surfRecon/scripts/recon-all.log` for
a successful completion message. An existing incomplete reconstruction
directory is not automatically repaired by this workflow.