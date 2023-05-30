# Architecture


## Local Client / Local Sidecar

Deals with all mappings to and from the onboard system and HiveCommand language semantics

<!-- <img src="./images/sidecar-boot.png" /> -->
![Sidecar Boot Process](./images/sidecar-boot.png)

## Native-App / Web-App

Bring data from backend / sidecar and display using only HiveCommand syntax

## Drivers

- Node.js
- Loaded/Installed into data-dir
- List of available drivers

## Command Program

- HMI Views
    - Component XY + Type
    - Links
- Tags
    - Scope
- Types
    - Fields
- Templates
    - Inputs
    - Outputs
- Alarms
    - Conditions
    - Pathway

