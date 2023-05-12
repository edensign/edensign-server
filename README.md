# edensign-server
----------------------------------------------------------**Node.js APIs**----------------------------------------------------------
**Start server**
- npm install
- npm start


**Branching Strategy**

**Naming**
- There will be two different envs, dev and prod and their respective branches
- There will be a release branch for each and every sprint
- For every 'story/task/sub-task/bug' branch the naming conventions that follows are:
    - branch must start with the specification eg: story/task/sub-task/bug
    - followed by a slash and the Jira id (ticket number)
    - followed by a slash and the Jira ticket title, all lower case, hyphen separated

eg: If Jira ticket number is ESW-325 and the title is create component for products
    branch will be named as - task/ESW-325/create-component-for-products

**Merging**
- All the story/task/sub-task/bug branches will get merged to their repsective release branch.
- The release branch will get merged to the dev branch for dev testing in the sprint cycle.
- After the completion of the sprint, the respective release branch will get merged to the prod branch

**Push and Pull**
- For all the tasks done, the developer need to raise a Pull Request against the release branch and get it reviewed with peer.
- After the review is completed, then feauture branch will get merged to release
- Before starting any task developer need to take a pull from release branch into their respective feautre branches
