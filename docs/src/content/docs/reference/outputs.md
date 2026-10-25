---
title: Outputs
description: Locate processing outputs and understand feature-file formats.
---

FuNPrep organizes outputs by subject and optional session beneath
the directory supplied through `-out`.

## Subject directories

| Arguments | Output location relative to `-out` |
| --- | --- |
| `-sub 01 -ses None` | `sub-01/` |
| `-sub 01 -ses 01` | `sub-01/ses-01/` |

Only outputs relevant to the selected workflows are generated.
An existing directory does not necessarily indicate completed processing.

## Directory reference

Paths below are relative to the subject/session output directory.
Capitalization is significant.

| Directory | Contents |
| --- | --- |
| `anat/` | Anatomical images, masks, segmentations, and microstructural image outputs |
| `surfRecon/` | Surface reconstruction outputs |
| `surf/` | Processed surfaces and surface metrics |
| `parc/` | Parcellation outputs |
| `xfm/` | Spatial transformations |
| `dwi/` | Diffusion image and tractography outputs |
| `func/` | Functional image outputs |
| `features/dwi/connectomes/` | Structural connectivity matrices |
| `features/dwi/edgeLengths/` | Tract-length-derived matrices |
| `features/func/Timeseries/` | Surface, subcortical, and regional time series |
| `features/func/Connectomes/` | Functional connectivity matrices |
| `features/micro/MPC/` | Microstructural profile covariance matrices |
| `features/micro/MP_moments/` | Regional profile summary features |
| `logs/` | Module processing logs |
| `QC/` | Quality-control outputs where generated |

## Filename conventions

Many outputs include subject/session identifiers, acquisition entities,
a space identifier, and a description.

For example:

```text
sub-01_task-rest_space-fsLR_res-32k_desc-sub-cor-connectome_R_schaefer-100.shape.gii
```

| Component | Meaning |
| --- | --- |
| `sub-01` | Subject |
| `task-rest` | Acquisition task |
| `space-fsLR_res-32k` | Cortical surface representation used in the workflow |
| `connectome_R` | Pearson-correlation connectivity |
| `schaefer-100` | Cortical parcellation |
| `.shape.gii` | GIFTI storage format used by this implementation |

A connectivity matrix stored in `.shape.gii` is still a matrix.
The extension does not imply that each entry corresponds to a surface vertex.

Combined cortical/subcortical functional outputs carry the fsLR identifier
even though the subcortical signals are extracted from volumes.

## Functional connectivity

The functional feature script saves two connectivity matrices.

| Filename marker | Values | Diagonal |
| --- | --- | --- |
| `connectome_R` | Pearson correlation coefficients | `1` |
| `connectome_Z` | Fisher-transformed correlation coefficients | `0` |

Before the Fisher transform, correlations are clipped to
`[-0.999999, 0.999999]`.

Do not apply the Fisher transform again to a `connectome_Z` file.

### Regional time series

Atlas-specific regional time-series files contain one array with shape:

```text
(number of time points, number of regions)
```

The combined regional order is:

1. Subcortical regions.
2. Cortical parcels in ascending nonzero label order from the atlas CSV.

The subcortical extraction script uses this label sequence:

```text
10, 11, 12, 13, 17, 18, 26,
49, 50, 51, 52, 53, 54, 58
```

The combined matrix therefore contains 14 subcortical regions plus
the cortical parcels represented by the atlas labels.

Missing subcortical labels produce NaN time series and can propagate
NaNs into connectivity values.

## Structural connectivity

Structural connectivity is generated from tractography and the selected
parcellation. With `SIFT2`, streamline weights are supplied to the
connectome calculation.

The `edgeLengths/` outputs are calculated using streamline-length
scaling and a mean edge statistic. They are not Euclidean distances
between regional coordinates. When SIFT2 is selected, weights are also
passed to this calculation.

The conversion script selects regions using sorted nonzero labels
present in the combined parcellation volume.

Do not assume that structural and functional matrices have identical
ROI ordering merely because their filenames contain the same atlas name.
Check label identities and ordering before comparing modalities.

## Microstructural features

### MPC

The regional MPC calculation:

1. Computes the mean regional profile.
2. Regresses this mean profile from each regional profile.
3. Correlates the residual profiles.
4. Applies a Fisher transform.

The saved matrix has a zero diagonal. The current implementation
replaces NaN and infinite MPC values with zero.

Consequently, an all-finite output alone does not establish that the
underlying profiles are valid.

### Profile moments

`MP_moments` files contain one row per region and four columns:

1. Mean depth index.
2. Standard deviation of depth indices.
3. Skewness.
4. Kurtosis.

These statistics describe a depth-index distribution weighted by
scaled, rounded, nonnegative profile intensities. They are not simply
the mean and variance of MRI intensities across depth.

## Read a matrix in Python

For a generated connectivity matrix:

```python
import nibabel as nib
import numpy as np

path = "/path/to/connectome.shape.gii"

image = nib.load(path)
matrix = image.darrays[0].data

print("Shape:", matrix.shape)
print("Data type:", matrix.dtype)
print("All finite:", np.isfinite(matrix).all())
```

For an atlas-specific regional time-series file:

```python
image = nib.load("/path/to/regional_timeseries.func.gii")
timeseries = image.darrays[0].data

n_timepoints, n_regions = timeseries.shape
print(n_timepoints, n_regions)
```

Surface time-series GIFTI files may instead store multiple data arrays.
Inspect the number and shapes of arrays before loading an unfamiliar file:

```python
print("Number of arrays:", len(image.darrays))
print("First array shapes:", [a.data.shape for a in image.darrays[:3]])
```

## Logs and processing status

Each selected module creates a timestamped log under `logs/`.

`Processed_sub.csv` is stored at the output root, outside individual
subject directories. It records module status where the corresponding
status-update code is enabled.

Review logs and expected outputs together. A status entry is not a
substitute for quality control.

## Intermediate files

Cleanup removes temporary files and selected intermediate outputs.
For example, the diffusion cleanup removes the normalized white-matter
FOD file, and microstructural cleanup removes `anat/micro_layers/`.

Do not expect every intermediate file mentioned in the processing log
to remain after completion.