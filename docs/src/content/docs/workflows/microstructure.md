---
title: Microstructure
description: Sample intracortical profiles and derive microstructural features.
---

The microstructural workflow samples image values across cortical
depth and derives vertexwise and regional profile features.

## Before you start

Complete structural processing for the same subject/session.

For the measured T1w/T2w example, provide:

```text
sub-01/anat/sub-01_T2w.nii.gz
```

The workflow uses processed T1w images and cortical surfaces from
the existing structural outputs.

## Run a T1w/T2w ratio workflow

```bash
export FuNPrep="/absolute/path/to/FuNPrep"

bash "${FuNPrep}/funp" \
  -bids /path/to/bids \
  -out /path/to/derivatives/FuNPrep \
  -sub 01 \
  -ses None \
  -micro_preproc \
  -micro_type ratio \
  -micro_file_name T2w \
  -NUM_SURFACES 14 \
  -Registration_method ANTs \
  -device cpu \
  -threads 6
```

The selected T2w image is prepared and aligned to the anatomical
reference before constructing the ratio image.

## Main options

| Option | Default | Purpose |
| --- | --- | --- |
| `-micro_type` | `None` | Selects the ratio branch when set to `ratio` |
| `-micro_file_name` | `None` | Input filename portion in the `anat/` directory |
| `-NUM_SURFACES` | `14` | Surface-count parameter passed to the equivolumetric surface generator |
| `-Registration_method` | `ANTs` | Image registration method |
| `-LS_MAT` | Disabled | Enables the optional synthesized-T2w route |
| `-age` | `None` | Passed to the LS-MAT synthesis script |
| `-sex` | `None` | Passed to the LS-MAT synthesis script |

Do not interpret the number of generated surfaces as a count of
histological cortical layers.

## Image-processing routes

### Measured-image ratio

Use `-micro_type ratio` to construct a ratio using the processed
T1w image and the selected additional image.

The example on this page uses a measured T2w image.

### Direct image sampling

Without the ratio or LS-MAT branch, the current code prepares,
registers, and samples the selected image directly.

The implementation does not use a strict whitelist of quantitative
map types. Entering a type label alone does not establish that the
processing is appropriate for a particular image contrast.

### Synthesized T2w

The optional `-LS_MAT` flag invokes:

```text
${FuNPrep}/functions/LS-MAT/synthesize_T2w.py
```

This route requires the external synthesis implementation, its resources,
and valid age/sex inputs. Consult that implementation for accepted
input encodings; they are not validated by the FuNPrep argument parser.

## Results

| Location | Main contents |
| --- | --- |
| `anat/` | Prepared microstructural images and ratio images where applicable |
| `features/micro/` | Profile-derived outputs |
| `features/micro/MPC/` | Microstructural profile covariance outputs |
| `features/micro/MP_moments/` | Regional profile summary features |
| `logs/` | Processing logs |

Temporary equivolumetric surfaces under `anat/micro_layers/` are
removed by the cleanup step.

## Inspect the result

1. Inspect alignment between the sampled image and T1w anatomy.
2. Inspect white and pial surface placement.
3. Review the sampled image for artifacts or invalid values.
4. Check profile coverage and regional features before downstream analysis.

Image-derived profiles depend on the input contrast and processing
choices. Interpret them as features of the sampled MRI signal.