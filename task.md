# Feature: Add an edit button for each project.

the edit button should be placed on the top right of the project-details-dialog
Functionality:
When clicking the edit button, the admin should be able to update all the project details.

Backend/API Considerations:
API Endpoints:
Edit Project: PUT /api/projects/:projectId

UI: The project detail view or a modal form should enable editing. Confirmation dialogs or saving indicators can help improve the user experience.
