# Campus Evaluation System

## Overview
This is a monorepo implementation for the Campus Hiring Evaluation. It contains robust notification fetching logic, a custom compliant logging middleware, and a responsive frontend built with React. 

## Structure
- `logging_middleware`: Custom reusable logging package for full-stack telemetry.
- `notification_app_be`: Logic package handling external API requests, prioritization using a min-heap, and data sorting.
- `notification_app_fe`: React frontend utilizing Material UI for clean aesthetics, implementing pagination, filtering, and priority tracking.
- `vehicle_maintenance_scheduler`: Reserved for backend track functionalities.

## Setup
To run the project locally:
1. Ensure you have generated the required tokens via `generate_token.js` and updated the `ACCESS_TOKEN` values.
2. Run `npm install` in the root directory.
3. Run `npm run dev` inside `notification_app_fe`.
