#!/bin/bash

#################################################################
# Hack to remove CSS file imports from the resulting d.ts. file #
#################################################################

sed -i -E "s/import\s+\".?*\.css\"\;//" ./dist-esm/docking-library.d.ts
