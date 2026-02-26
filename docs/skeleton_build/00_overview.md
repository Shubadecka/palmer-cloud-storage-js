# Journal Transcription App - Build Guide

This guide walks you through building a React frontend for a journal transcription application. Each step builds on the previous one.

## Prerequisites

- Node.js 18+ installed
- Basic familiarity with React, JSX, and Tailwind CSS
- A code editor

## Build Order

1. [Project Setup](./01_project_setup.md) - Initialize Vite, React, and Tailwind CSS
2. [Routing Setup](./02_routing_setup.md) - Configure React Router with protected routes
3. [Auth Context](./03_auth_context.md) - Create authentication state management
4. [UI Components](./04_ui_components.md) - Build reusable Button, Input, Modal, LoadingSpinner
5. [Layout Components](./05_layout_components.md) - Create Header and Navbar
6. [Auth Pages](./06_auth_pages.md) - Build Login and Register pages
7. [Dashboard Page](./07_dashboard_page.md) - Entry list sorted by date
8. [Upload Page](./08_upload_page.md) - Image upload with drag-and-drop
9. [Entry Detail Page](./09_entry_detail_page.md) - View entry with lazy-loaded image
10. [API Service](./10_api_service.md) - Create all API call functions

## Data Model Reference

- **Page**: A scanned journal page image (one image file)
- **Entry**: A transcribed text segment from a page (multiple entries per page)

## API Endpoints Reference

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Pages (Images)
- `GET /api/pages/:id`
- `POST /api/pages`
- `DELETE /api/pages/:id`

### Entries (Transcriptions)
- `GET /api/entries`
- `GET /api/entries/:id`
- `PUT /api/entries/:id`
- `DELETE /api/entries/:id`
