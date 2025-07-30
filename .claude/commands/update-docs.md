---
description: "Updates all documentation files (README.md, CLAUDE.md) based on current codebase state"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"]
argument-hint: "[optional: specific files to focus on]"
---

# Documentation Update Command

You are tasked with updating all documentation files in this Reputul frontend project to reflect the current state of the codebase. Follow these steps:

## 1. Analyze Current Codebase Structure

First, scan the entire project structure to understand:
- New components, pages, or features added
- Changes to existing functionality
- Updates to dependencies or configuration
- New API endpoints or integrations
- Modified routing or architecture

## 2. Update CLAUDE.md

Review and update `/Users/r.j.culley/Projects/reputul-frontend/CLAUDE.md` with:
- Current project structure (src/ directory contents)
- New pages in the pages/ directory and their routes
- Updated component list in components/
- Any new services, utils, or API integrations
- Changes to the tech stack or dependencies
- Updated development commands if any have changed
- New environment variables or configuration

## 3. Update README.md

Review and update `/Users/r.j.culley/Projects/reputul-frontend/README.md` with:
- Current feature set and capabilities
- Updated installation and setup instructions
- New scripts or commands
- Updated project description if features have evolved
- Any new dependencies or requirements
- Updated screenshots or examples if UI has changed significantly

## 4. Validation Steps

After updating documentation:
- Ensure all file paths mentioned in docs actually exist
- Verify all commands mentioned actually work
- Check that the project structure accurately reflects reality
- Confirm new features are properly documented

## 5. Focus Areas (if $ARGUMENTS provided)

If specific files or areas are mentioned in $ARGUMENTS, pay special attention to documenting changes related to those areas.

## Instructions

- Be thorough but concise
- Focus on user-facing changes and developer workflow impacts  
- Maintain the existing documentation style and structure
- Only update sections that have actually changed
- Preserve any custom formatting or specific sections that are still accurate