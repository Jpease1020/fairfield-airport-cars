#!/bin/bash

# Orchestration Agent: Run multiple dev agents in parallel for rapid development

# 1. Expand RTL test coverage
node scripts/agents/testing-agent.js &

# 2. Scaffold Storybook and set up Chromatic/Percy for visual regression
node scripts/agents/structure-agent.js &

# 3. Add/verify CI workflow for guardrails
node scripts/agents/fixes-agent.js &

# Wait for all background jobs to finish
wait

echo "All agents completed!" 