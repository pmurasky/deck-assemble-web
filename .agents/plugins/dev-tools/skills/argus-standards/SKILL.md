---
name: argus-standards
description: Use Argus to validate, scaffold, and generate engineering standards across AI agent platforms.
---

# Argus Standards Skill

Use the `argus` CLI (`/home/peter/.local/bin/argus` or `argus`) to manage, validate, and generate engineering standards (TDD, SOLID, atomic commits, code quality, testing strategies, etc.) across AI platforms.

## Core Workflows

### 1. Initialize Standards
```bash
argus init
```
Scaffolds a `.argus.yml` file with active packs and target platforms.

### 2. Validate Standards
```bash
argus validate
```
Validates `.argus.yml` against available packs and configuration rules.

### 3. Generate Platform Files
```bash
argus generate
```
Generates configuration files for platforms (e.g. `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`, `GEMINI.md`, etc.).

### 4. CI Verification
```bash
argus generate --check
```
Ensures generated files are committed and up-to-date in CI pipelines.
