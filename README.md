# Levelove KPI

Restaurant staff KPI, quest, attendance, approval, and ranking web app.

## Pages

- `levelove-store-9c4f2a7.html` - owner/store setup
- `levelove-admin-9c4f2a7.html` - manager/admin dashboard and approvals
- `levelove-staff-9c4f2a7.html` - staff management and private link generation
- `employee-check.html` - employee mobile check-in and quest app

## Deployment

Static app deployed on Vercel.

Production URL:
https://doya-kpi.vercel.app

## Notes

Generate employee and manager links from the staff management page. Current employee links are short and load store-scoped settings from cloud state instead of embedding large JSON settings in the URL.
