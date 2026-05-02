### Fixes to work on upon next implementation (25th-April-2026)

- Update the following packages.
  whatwg-encoding@3.1.1: Reason - Faster implementation
  glob@10.5.0: Reason - currently installed version contains punlicized security issues which have all been fixed in the most recent version implementation.

### Artisan and Client/company flow struct.

Now I want to implement the flo of an artisan. he artisan can create his profile, and also have his service imes wich he can be booked. When he is booked on any job he is strictly on a job and probabaly can't be boked for that time. Now when he is also booked he can terminate a booking on a job by a client. Also when he browses ahustle and applies he is booked already on that job when he's application is accepted. Also even when hi application is accepted and he is booked he can thenalso terminate booking on that hustle even after he has been booked.

<!-- Back-end Fixes needed. -->

No existing endpoint to find out applications under a hustler.

Actions a hustler can take on a fresh hustle:

1. Apply.
2. Save.
3. Share via link

More actions at different states:

1. Raise issue -> only when in progress.
2. Mark as completed -> which sets to pending creators approval
3. Rate/Review hustle creator: catch, only after marking as complete oon the hustlers end.

No endpoint to view hustlers
500 error when trying to create a hustle.

403 error when trying to create a booking as a company and 500 server error when trying as a client

## Fixes

No endpoint to view Applied hustles
The job does not return descriptions.
Mark hustle as complete returns internal sever error.

{
"success": true,
"message": "Notifications loaded.",
"data": {
"items": [
{
"id": 72,
"notification_type": "withdrawal_requested",
"title": "Withdrawal requested",
"body": "Use the OTP sent to your email to confirm your withdrawal request.",
"payload_json": "{\"withdrawal_id\":5}",
"delivered_at": "2026-05-02 15:29:01",
"read_at": null,
"created_at": "2026-05-02 15:29:01"
},
{
"id": 69,
"notification_type": "admin_message",
"title": "Welcome",
"body": "You are welcome",
"payload_json": "{\"source\":\"admin\",\"admin_account_id\":4}",
"delivered_at": "2026-05-02 15:09:15",
"read_at": null,
"created_at": "2026-05-02 15:09:15"
},
{
"id": 65,
"notification_type": "application_decision",
"title": "Application updated",
"body": "Your hustle application status changed to accepted.",
"payload_json": "{\"application_id\":18,\"job_id\":9}",
"delivered_at": "2026-05-02 13:41:21",
"read_at": null,
"created_at": "2026-05-02 13:41:21"
},
]
},
"meta": {
"count": 15
}
}
