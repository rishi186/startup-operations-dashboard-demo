# Startup Operations Dashboard

A read-only portfolio demo for tracking startup incubation, college outreach, small business programs, and grant finances.

**Synthetic data.** All people, organizations, events, and financial records shown in this demo were created for illustration. The dashboard runs as a static site with its data included in the app.

[Open the live demo](https://rishi186.github.io/startup-operations-dashboard-demo/)

## What to explore

- **Overview** follows ventures from idea validation to funding and summarizes engagement across the dashboard.
- **Incubation** includes a prototype roster, founder cohort, sample program schedule, and event breakdowns.
- **MSME** filters events by fiscal year, event type, and district. The current selection can be downloaded as a synthetic CSV.
- **College Outreach** shows campus participation by district and includes a searchable college directory.
- **Finance** compares grants and expenses across two fiscal years and provides a filterable transaction breakdown.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Use `npm run build` to type-check the app and create the production site in `dist`. Use `npm run preview` to serve that build locally.
