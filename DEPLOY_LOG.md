# Deployment Audit Log & Credit Tracker

This log tracks every production deployment to Netlify. It exists to enforce credit budget discipline, keep monthly deploy counts within the free tier allocation, and provide an audit trail for rollback decisions.

---

## Netlify Monthly Credit Budget Rules

- **Free Tier Budget**: **300 credits/month**.
- **Production Deploy Cost**: **15 credits per production deploy**.
- **Target Monthly Deploys**: Max **8–10 production deploys/month** (~120–150 credits).
- **Traffic Overhead**: Operational bandwidth and web requests consume ~15–30 credits/month under 100–200 visits/day.
- **Upgrade Trigger**: If an institution consistently requires more than 15 production deployments per month, upgrade to the **Netlify Personal plan (1,000 credits/month)** or deploy via custom GitHub Actions to external static hosting (e.g. Cloudflare Pages).

---

## Deployment Log

| Date (UTC+7) | Environment | Branch / Commit | Summary of Changes | Prod Deploy (Y/N) | Approx. Netlify Credits Used | Notes |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 2026-11-13 | Production | `main` / `f527847` | Added partial payment modal, recurring rules, and Vite chunking | Y | 15 | Build size optimized |
| 2026-11-14 | Production | `main` / `0685893` | Linked class info to PIN login, attendance recap, and class filters | Y | 15 | Live verified |
| 2026-11-16 | Production | `main` / `docs-init`| Updated comprehensive project documentation & architecture guide | Y | 15 | Non-code commit |
| *YYYY-MM-DD* | *Staging/Prod* | *branch / hash* | *Brief description of features/fixes deployed* | *Y/N* | *15* | *Author / deployment ticket* |
