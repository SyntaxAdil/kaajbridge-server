# Jobs

GET     /api/jobs
GET     /api/jobs/latest-jobs
POST    /api/jobs
GET     /api/jobs/my-jobs
PATCH   /api/jobs/my-jobs/:id
DELETE  /api/jobs/my-jobs/:id
GET     /api/jobs/:id


# Company

GET     /api/company
GET     /api/company/top-companies
POST    /api/company
GET     /api/company/my-company
PATCH   /api/company/my-company/:id
DELETE  /api/company/my-company/:id
GET     /api/company/:id


# Applications

POST    /api/application
GET     /api/application/job/:jobId
PATCH   /api/application/:id
DELETE  /api/application/:id
GET     /api/application/my-applications
GET     /api/application/:id


# Favorites

POST    /api/favorites
GET     /api/favorites
PATCH   /api/favorites/:id