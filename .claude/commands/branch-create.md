# Command: branch-create

This command creates a new Git branch following best practices.

## Workflow

1.  **Ask for Branch Type**: Prompt the user to select a branch type from the following list:
    - `feat`: A new feature for the user.
    - `fix`: A bug fix for the user.
    - `chore`: Routine tasks, maintenance, or dependency updates.
    - `refactor`: Refactoring code without changing its external behavior.
    - `docs`: Documentation changes.
    - `test`: Adding missing tests or correcting existing tests.

2.  **Ask for Branch Name**: Prompt the user for a descriptive, kebab-case name (e.g., `new-login-flow`).

3.  **Construct Full Branch Name**: Combine the type and name into the format `<type>/<name>`.

4.  **Check for Staged Changes**: Run `git status --porcelain`. If there are staged (but not committed) files, ask the user if they want to create a `chore: WIP` commit before creating the new branch.

5.  **Validate Uniqueness**:
    - Run `git branch --all` to list all local and remote branches.
    - Check if a branch with the constructed name already exists.
    - If it exists, inform the user and abort the process to prevent errors.

6.  **Create Branch**:
    - If the name is unique, execute `git checkout -b <type>/<name>`.

7.  **Confirmation**:
    - Report to the user that the branch has been successfully created and they have been switched to it.
