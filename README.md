# Startup Operations Dashboard

I built and delivered a full-stack operations dashboard for RTIH as the sole developer. The dashboard gives the team one place to track startup programs, college outreach, support for micro, small, and medium enterprises (MSMEs), and grant finances.

[Open the live demo](https://rishi186.github.io/startup-operations-dashboard-demo/) · [Try Demo Admin](https://rishi186.github.io/startup-operations-dashboard-demo/#/admin)

## My contribution

I took the original project from design through delivery. I built the dashboard, the admin tools staff use to maintain its data, and the data flow connecting the two.

- **Frontend** — Built the responsive React and TypeScript interface, including the startup pipeline, interactive charts, filters, and record drill-downs.
- **Backend and access** — Integrated Firebase Authentication and Cloud Firestore so staff could sign in, access their assigned admin sections, and save updates that feed the dashboard.
- **Reporting workflows** — Built Excel import and export and the calculations that turn program, attendance, and finance records into dashboard totals.

## What the dashboard tracks

| Section | What you can explore |
| --- | --- |
| Overview | Key metrics and the startup pipeline from idea validation through funding |
| Incubation | Founder cohorts, prototypes, upcoming programs, and event breakdowns |
| College Outreach | Campus participation by district and a searchable college directory |
| MSME | Events by fiscal year, type, and district, with details and a filtered CSV export |
| Finance | Grants, expenses, net balance, and transactions across two fiscal years |

## Try the admin workflow

This repository is the public portfolio demo. It runs on GitHub Pages using fictional people, organizations, events, and financial records. Demo Admin lets visitors add, edit, and delete sample MSME events. Edits are stored in each visitor’s browser.

1. Open **Demo Admin** and select the first sample event, **Business Registration · Cedar Vale**.
2. Change **Actual participants** from **20** to **22**. The **Dashboard preview** recalculates as you edit.
3. Click **Save event**, then **View MSME dashboard** to see the updated total. Return to Demo Admin and select **Reset demo data** to restore the original samples.

## How the data flows

In the original RTIH project, an authorized staff member can import an Excel sheet or edit records in the admin interface. Saved records in Firestore feed the dashboard’s charts and totals.

The public demo uses React, TypeScript, Vite, Tailwind CSS, and Recharts. Demo Admin updates browser-local event storage, and the Overview and MSME views recalculate their totals from those records. GitHub Actions builds and publishes the demo to GitHub Pages. [Synthetic dataset](src/data/synthetic.ts) · [Demo Admin source](src/pages/DemoAdmin.tsx) · [Event store](src/data/demoEvents.ts) · [Deployment workflow](.github/workflows/deploy.yml)

## Run locally

Use Node.js 24 and npm.

```sh
git clone https://github.com/rishi186/startup-operations-dashboard-demo.git
cd startup-operations-dashboard-demo
npm ci
npm run dev
```

Open the local address printed in the terminal. Run `npm run build` to type-check the demo and create the production build.
