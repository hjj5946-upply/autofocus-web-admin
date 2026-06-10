# AutoFocus Admin Portal

## Project Identity

AutoFocus Admin is not a simple admin page.

It is the internal operating system for managing customers, projects, employees, assets, inquiries, and future platform services.

The system must be designed for long-term business operations and future platform expansion.

---

## Purpose

Primary Goals:

* Contact Management
* Customer Management (CRM)
* Project Management
* Employee Management
* Asset Management
* Platform Operations
* Future AI Business Tools

---

## Design Philosophy

Enterprise Operations Console

Keywords:

* Clean
* Efficient
* Professional
* Operational
* Data-Driven

Avoid:

* Marketing-style layouts
* Excessive animations
* Large empty spaces
* Fancy landing page aesthetics
* Overuse of glassmorphism

Reference Products:

* Linear
* Jira
* Atlassian
* GitHub
* Notion Admin

---

## Technology Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React

Future:

* Zustand
* TanStack Query
* Spring Boot or NestJS API

---

## Architecture

Feature-Based Architecture

src/

* app
* components

  * ui
  * common
* layouts
* features

  * auth
  * contacts
  * crm
  * projects
  * employees
  * assets
  * ai
* services
* hooks
* store
* types
* utils
* pages

---

## Development Principles

Business Domain First

Features must be organized by business domain rather than UI type.

Preferred:

features/crm
features/employees
features/assets

Avoid excessive growth of shared component folders.

---

## UI Principles

Desktop First

High Information Density

Fast Navigation

Consistent Layouts

Reusable Data Tables

Reusable Form Patterns

---

## Localhost Policy

UI review is performed manually.

Claude Code does not access localhost.

Developers are responsible for visual verification and testing.

---

## Long-Term Vision

AutoFocus Admin will evolve into the operational platform of AutoFocus.

Future modules may include:

* AI Assistant
* Knowledge Base
* Internal Workflow Automation
* Document Management
* Customer Portal Integration
* Platform Monitoring

All architectural decisions should support future expansion.

## UI & UX Standards

### Language

The admin portal is designed for Korean business operations.

All interfaces should be written in Korean.

---

### Responsive Strategy

Desktop First

The admin portal is primarily designed for desktop business operations.

All screens should remain fully usable on tablets and mobile devices.

Requirements:

* Responsive layouts
* Mobile navigation drawer
* Mobile-friendly forms
* Mobile-friendly tables
* Touch-friendly interactions

---

### Navigation Layout

Desktop:

* Left Sidebar Navigation
* Top Header
* Main Content Area

Mobile:

* Sidebar becomes an overlay drawer
* Hamburger menu opens navigation

Sidebar Requirements:

* Expand / Collapse support
* Expanded Width: 240px
* Collapsed Width: 72px

Primary Navigation:

* Dashboard
* Contacts
* CRM
* Projects
* Employees
* Assets
* Settings

---

### Theme System

Support Light Mode and Dark Mode.

Default:

Light Mode

Theme preference should persist across sessions.

Provide a theme toggle in the header.

---

### Visual Style

Style Direction:

Enterprise Operations Console

Keywords:

* Clean
* Professional
* Efficient
* Data-Focused
* Minimal

---

### Color Strategy

Default Interface:

* White background
* Neutral gray surfaces
* Dark text

Brand colors should be used as accents only.

Primary Brand Color:

#1e293b

Accent Color:

#1e293b

Typical Usage:

* Active navigation
* Primary actions
* Status indicators
* Important controls

The overall interface should remain neutral, clean, and professional.

---

### Component Philosophy

Prioritize:

* Data tables
* Forms
* Filters
* Search
* Dashboards
* Management tools

Business efficiency is more important than decorative effects.
