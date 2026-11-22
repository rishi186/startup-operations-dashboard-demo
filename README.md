# Startup Operations Dashboard

An interactive portfolio demo for tracking startup incubation, college outreach, small business programs, and grant finances.

**Synthetic data.** All people, organizations, events, and financial records shown in this demo were created for illustration. The dashboard runs as a static site with bundled sample records. Demo Admin saves edits locally in each visitor’s browser.

[Open the live demo](https://rishi186.github.io/startup-operations-dashboard-demo/)

## What to explore

- **Overview** follows ventures from idea validation to funding and summarizes engagement across the dashboard.
- **Incubation** includes a prototype roster, founder cohort, sample program schedule, and event breakdowns.
- **MSME** filters events by fiscal year, event type, and district. The current selection can be downloaded as a synthetic CSV.
- **College Outreach** shows campus participation by district and includes a searchable college directory.
- **Finance** compares grants and expenses across two fiscal years and provides a filterable transaction breakdown.

- **Demo Admin** lets you add, edit, and delete fictional MSME events. To try it, increase the registered count on the first event, preview the total, then select **Save event** and **View MSME dashboard**. Use **Reset demo data** to restore the original sample records. [Open Demo Admin](https://rishi186.github.io/startup-operations-dashboard-demo/#/admin)

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Use `npm run build` to type-check the app and create the production site in `dist`. Use `npm run preview` to serve that build locally.
