# ZeroLine

ZeroLine bridges the gap between monitoring systems and human operators, enhancing alert management with contextual information and actionable insights.

## Overview

ZeroLine is a Node.js application that serves as an intermediary between monitoring systems and Operations Centers. The application enriches alerts with crucial context by automatically retrieving relevant system documentation, analyzing historical alert patterns, and providing actionable recommendations to technicians.

## Key Features

- **Alert Enrichment**: Automatically enhances alerts with CMDB data from ServiceNow
- **Contextual Documentation**: Fetches relevant system-specific documentation and SOPs
- **Historical Analysis**: Examines past incidents for pattern recognition
- **Resolution Suggestions**: Provides technicians with actionable next steps based on historical data
- **Feedback Loop**: Operators can rate suggested resolutions, helping the system learn and improve
- **Smart Filtering**: Reduces alert noise through intelligent categorization and correlation
- **State Awareness**: Maintains context across related incidents

## Technical Details

- **Backend**: Node.js with Express
- **Database**: MongoDB for alert history and feedback storage
- **Integrations**:
  - ServiceNow CMDB API for system information
  - Knowledge Base API for retrieving SOPs
  - Case Management System for historical incident data
- **Authentication**: JWT-based authentication with role-based access control
- **Deployment**: Containerized application deployable on Kubernetes

## Development Status

This project is actively maintained and in production use at multiple operations centers.

## License

Private - All rights reserved
