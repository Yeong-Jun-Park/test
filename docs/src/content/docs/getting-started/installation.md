---
title: Installation
description: Prepare the software environment and resources required by FuNPrep.
---

FuNPrep combines Bash workflows with Python utilities and external
neuroimaging software. Prepare the dependencies for your selected
processing modules before running the pipeline.

## Obtain the complete pipeline

Use a complete FuNPrep checkout containing the following files and
resource directories:

| Path | Contents |
| --- | --- |
| `funp` | Main command-line entry point |
| `functions/` | Processing workflows and shared functions |
| `Miscellaneous/` | Python utilities |
| `Templates/` | Reference volumes |
| `Surfaces/` | Reference surfaces and surface-processing resources |
| `Parcellations/` | Atlases, labels, and lookup tables |

A code-only copy without the required reference resources is insufficient
to run the complete pipeline.

## Software requirements

The required software depends on the selected workflow and options.

| Software | Main use |
| --- | --- |
| FreeSurfer | Surface reconstruction, SynthStrip, SynthSeg, and image/surface utilities |
| ANTs | Bias-field correction and registration with the default settings |
| AFNI | Image preparation and functional processing |
| FSL | Image processing, registration, and diffusion/functional workflows |
| Connectome Workbench | Surface processing, resampling, and feature operations |
| MRtrix3 | Diffusion processing, tractography, and structural connectomes |
| Python | Feature extraction and supporting utilities |
| jq and bc | JSON metadata extraction and command-line calculations |

Install and initialize these packages according to their own instructions.
Required commands must be available in the shell used to launch FuNPrep.

### Optional components

- **DeepPrep and Docker:** required when selecting `-Recon_Method DeepPrep`.
- **ICA-AROMA:** called by the functional workflow when no FIX training
  file is supplied. Its script is expected at
  `functions/ICA-AROMA/ICA_AROMA.py`.
- **FSL FIX and a compatible training file:** required for the FIX branch.
- **LS-MAT:** required when selecting `-LS_MAT`; the code expects
  `functions/LS-MAT/synthesize_T2w.py`.
- **Fieldmap-less SyN correction:** the supporting Python script imports
  ANTsPy, Nipype, and SDCFlows.

The supplied Python utilities also use NumPy, NiBabel, pandas, and SciPy.
Both `python` and `python3` are invoked by the workflows; ensure that
each resolves to an environment with the dependencies it needs.

:::note[Version compatibility]
A tested dependency-version matrix has not yet been established for
this documentation. Dependency availability alone does not establish
compatibility between all processing options.
:::

## Configure the pipeline location

Set `FuNPrep` to the directory containing `funp`, not the documentation
directory. Replace the example path with your installation location.

```bash
export FuNPrep="/absolute/path/to/FuNPrep"
```

The main script reads this variable when loading its supporting functions.

For a basic file check:

```bash
test -f "${FuNPrep}/funp" && echo "Entry point found"
test -f "${FuNPrep}/functions/functions.sh" && echo "Functions found"
test -d "${FuNPrep}/Templates" && echo "Templates directory found"
test -d "${FuNPrep}/Surfaces" && echo "Surfaces directory found"
test -d "${FuNPrep}/Parcellations" && echo "Parcellations directory found"
```

These checks verify presence only, not resource completeness.

## Configure the FreeSurfer license

Configure FreeSurfer in your shell and provide a valid license:

```bash
export FS_LICENSE="/absolute/path/to/license.txt"
```

The `-fs_license` argument is also used when mounting the license into
the DeepPrep container. It does not replace configuration of the
host FreeSurfer environment.

## Check command availability

For an initial structural-workflow check:

```bash
for cmd in \
  recon-all mri_synthstrip mri_synthseg \
  N4BiasFieldCorrection antsRegistrationSyN.sh antsApplyTransforms \
  3dWarp 3dresample fslmaths wb_command
do
  if command -v "$cmd" >/dev/null 2>&1; then
    printf "FOUND    %s\n" "$cmd"
  else
    printf "MISSING  %s\n" "$cmd"
  fi
done
```

This is a preliminary check, not a complete dependency or execution test.