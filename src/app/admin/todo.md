for admin side stuff to work on:

-   vendor management
    vendor database (name, contact, tags)
    be able to add and remove vendors (use supabase for this)
    allow filtering of vendors based on tags (if time is there)

-   project dashbaord with a small card for each project
    *I should be able to see projects
    *create project button

then when you click the project card you should have an edit button and publish after edit
project name, description, deadline, create tags(categories) -> select vendors inside that tag , and it should show number of quotes received (if possible like based on tag numbers or something || beside the tag)
also number of vendors on the outside card along with quotes

-   BOQ Upload and management
    Select project
    Upload BOQ Based on tags and the vendor with the tag will receive it
    store in filestorage supabase I think for now

-   Quotes Management
    you will receive all the quotes from the vendors here..
    you should be able to view the quote pdf
    and it should be sorted based on project
    and should be able to view comments from vendors if any
    pending, approved, rejected
