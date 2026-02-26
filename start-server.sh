#!/bin/bash

# Start LM Studio
/home/tim/applications/LM-Studio-0.3.15-11-x64.AppImage --no-sandbox

# Activate the virtual environment
source /home/tim/GitHub/palmer-cloud-storage/venv/bin/activate

# Start the server
streamlit run /home/tim/GitHub/palmer-cloud-storage/main.py
