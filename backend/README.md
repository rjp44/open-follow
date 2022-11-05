# SMB Backend

An Express app

## Run locally

Clone this repo, then install dependencies with `npm install`. The following scripts are available for development/testing:

### `npm start`

Start the Express server. Set the `PORT` environment variable to choose which port it should listen on, otherwise it will pick a random available one and log its address.

### `npm run dev`

Start the Express server with Nodemon watching for changes. This will automatically restart the server when you save a file.

### `npm test`

Run all the tests inside the `src/tests` directory using Tape. It will pipe the results through `tap-spec` for a nicer looking output.

## Committing

A pre-commit hook will verify there are no linting errors and format all files before allowing the commit. Since the ESLint config should only error for issues that may cause bugs we should never have code with linting errors checked in.

## Docker builds

Contains a simple Dockerfile which can be used to build an image, and a Google Cloud Build definition for their platform.
The build depends on packages that are private GitHub repos and an SSH deploy private key is needed for the build phase, this is handled for you in the Google Cloud Build environment
but will need to be manually provided in a directory called .ssh for local Docker builds.
