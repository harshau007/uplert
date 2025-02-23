## Frontend

- [x] Use data from /ws/{projectId}/log to plant all data at dedicated dashboard
- [x] make sure all data is updating correctly as its coming from /ws/{projectId}/log endpoint
- [x] handle delete functionality with their state
- [x] make dashboard entries update as data is coming from backend
- [ ] handle pause & resume functionality with their state
- [x] Manual Ping
- [x] handle duplicate logs and stats
- [ ] Add Validation for website dialog when creating so no duplicate endpoints are monitored

## Backend

- [x] implement log route for separate path for logs and other details
- [x] persistence data for dashboard to keep record
- [x] Manual Ping
- [ ] implement pause & resume feature
- [ ] Backend validation for website url and sending it to frontend for validation
- [ ] cover session close since after connection established is not being used now

## Full Stack

- [ ] External Platform Alerting e.g Email, Slack, Discord, SMS, etc
- [x] Implement emailing using Mailhog or other
