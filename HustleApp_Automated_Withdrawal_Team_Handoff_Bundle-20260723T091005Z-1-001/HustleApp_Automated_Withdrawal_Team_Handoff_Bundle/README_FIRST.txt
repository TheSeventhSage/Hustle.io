HUSTLEAPP AUTOMATED WITHDRAWAL TEAM HANDOFF
============================================

Send the branded PDF to the mobile app, provider web and admin frontend teams.
The DOCX is the editable source.

Supporting files:
- HustleApp_API_v1.1.0_openapi.yaml: machine-readable API specification.
- HustleApp_Paystack_Payouts_Postman_Collection.json: import into Postman for testing.
- Original_API_Handoff_Reference.md: backend release quick reference.

Security:
- No Paystack secret key is included.
- Mobile and frontend teams must call only the HustleApp API.
- Automated payouts remain controlled by backend feature flags.
