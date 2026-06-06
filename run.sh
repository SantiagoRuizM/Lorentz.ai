#!/bin/bash
# run.sh — Run script for Lorentz.ai backend

PORT=${1:-8000}
python3 server.py $PORT
