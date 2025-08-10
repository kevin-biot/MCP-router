#!/bin/bash

# Create MCP-router directory structure
echo "Creating MCP-router directory structure..."

# Source directories
mkdir -p src/{routing,workflow,backends,auth,memory,monitoring,types,utils}

# Script directories
mkdir -p scripts/{dev,build,deploy}

# Test directories  
mkdir -p tests/unit/{routing,workflow,auth}
mkdir -p tests/integration/{end-to-end,backend-tests}
mkdir -p tests/fixtures/{mock-requests,sample-workflows}
mkdir -p tests/helpers

# Documentation
mkdir -p docs/{architecture,api,workflows,deployment}

# Configuration
mkdir -p config

# Operational directories
mkdir -p {logs,tmp,dist}

# GitHub workflows
mkdir -p .github/workflows

echo "✅ MCP-router directory structure created"
