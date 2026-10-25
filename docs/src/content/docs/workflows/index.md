---
title: Workflows
description: Choose a processing workflow and understand its main stages.
---

FuNPrep provides four processing modules. Select a module using its
command-line flag and configure its modality-specific inputs.

## Choose a workflow

| Your goal | Module flag | Required starting point |
| --- | --- | --- |
| Process anatomy and reconstruct cortical surfaces | `-T1w_preproc` | T1w image |
| Derive diffusion features and structural connectivity | `-dwi_preproc` | DWI, gradients, metadata, and anatomical outputs |
| Derive surface time series and functional connectivity | `-func_preproc` | fMRI, metadata, and anatomical outputs |
| Derive intracortical profiles and MPC | `-micro_preproc` | Microstructural input or configured synthesis route, and anatomical outputs |

Selecting a downstream module does not automatically enable anatomical
processing.

## Structural MRI

The structural workflow prepares anatomical images and surfaces used
by the other modules.

Main stages:

1. Prepare and reorient T1w images.
2. Apply bias-field correction.
3. Extract the brain and segment the volume.
4. Register the anatomical image to MNI space.
5. Reconstruct cortical surfaces.
6. Convert and process surface geometry and metrics.
7. Resample surfaces and metrics at the configured 164k and 32k resolutions.
8. Build Workbench specification files.

Default method selections:

| Setting | Default |
| --- | --- |
| Reconstruction | `Freesurfer` |
| Bias correction | `N4BiasFieldCorrection` |
| Skull stripping | `mri_synthstrip` |
| Segmentation | `mri_synthseg` |
| Registration | `ANTs` |

## Diffusion MRI

The diffusion workflow processes diffusion images and constructs
structural connectomes.

Main stages:

1. Prepare diffusion data and b=0 reference images.
2. Process the selected distortion-correction branch and run
   the MRtrix/FSL preprocessing workflow.
3. Apply diffusion bias correction.
4. Estimate diffusion metrics.
5. Prepare anatomical labels and tissue constraints in diffusion space.
6. Prepare parcellations and perform tractography.
7. Construct structural connectivity features.

Default tractography settings:

| Setting | Default |
| --- | --- |
| Tracking method | `iFOD2` |
| Requested streamline count | `10M` |
| Scaling method | `SIFT2` |
| Distortion-correction selection | `None` |

`None` does not disable the entire diffusion preprocessing workflow.
The code still invokes `dwifslpreproc` using the no-reverse-encoding
configuration.

## Functional MRI

The functional workflow processes fMRI data and derives connectivity
features.

Main stages:

1. Remove initial volumes using the header TR and a 10-second target.
2. Apply slice-timing correction when the TR exceeds the configured threshold.
3. Apply the selected distortion-correction branch.
4. Perform motion processing and brain extraction.
5. Denoise the functional data.
6. Project data onto cortical surfaces.
7. Mask and smooth the surface data.
8. Construct functional connectivity features.

The denoising branch uses ICA-AROMA when
`-FIX_train_file_name` is `None`; otherwise it follows the FIX branch.

The default `-FWHM` value is `5`.

:::note[Processing status]
In the supplied source, the final status-update block in
`func_preproc.sh` is commented out. Functional completion should
therefore be checked using the processing log and expected outputs,
rather than relying on a `COMPLETE` entry in `Processed_sub.csv`.
:::

## Microstructure

The microstructural workflow samples image values across cortical
depth and derives profile-based features.

Main stages:

1. Prepare the measured or synthesized microstructural image.
2. Process the image and construct a ratio when applicable.
3. Generate equivolumetric surfaces.
4. Sample intracortical profiles.
5. Build vertexwise profile outputs.
6. Derive regional profile features and microstructural profile covariance.

The default `-NUM_SURFACES` value is `14`.

## Execution order

When multiple modules are selected in one invocation, the entry point
runs them in this order:

1. Structural MRI
2. Diffusion MRI
3. Functional MRI
4. Microstructure

Existing files are used as skip conditions in several processing steps.
This is not a comprehensive validation of previous outputs.
Review logs and output quality when reusing an existing output directory.