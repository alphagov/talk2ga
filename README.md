# AskAnalytics

AskAnalytics is a web application used exclusively by GOV.UK staff for querying data insights from our Google Analytics 4 dataset using natural language and receiving responses in natural language.

## Architecture

The application is structured around two core components:

1. **Frontend Application**

   - Developed using ReactJS, adhering to the GOV.UK design system.
   - Responsible for rendering the user interface and sending queries to the backend API.

2. **Backend API**
   - Implemented with Python3 using FastAPI.
   - Manages CRUD operations for updating a PostgreSQL database that stores analytics usage data.
   - Utilizes LLM (Large Language Model) models via the LangChain framework to process user queries and generate SQL queries for the GA4 dataset.

## LangFuse Integration

AskAnalytics integrates closely with LangFuse, an open-source dashboard designed to log and visualize the execution flow of each LLM chain initiated by users. This integration serves as a crucial debugging tool, offering detailed diagrams for monitoring and troubleshooting application performance.

LangFuse can be set up locally using Docker Compose or accessed via a Cloud Run-hosted dashboard, providing flexibility in monitoring and managing application activities.

## Setting Up the Project Locally

### Backend

1. **Python Version Management with pyenv**

   - Install and manage the required Python version specified in `backend/pyproject.toml` using pyenv. Follow the installation instructions from [pyenv GitHub](https://github.com/pyenv/pyenv).
     ```
     pyenv install 3.11.4
     pyenv use 3.11.4
     ```

2. **Virtual Environment Management with Poetry**

   - Use Poetry for managing dependencies and creating a virtual environment specific to the project. Follow the installation guide on [Poetry's official documentation](https://python-poetry.org/docs/#installation).
     ```
     poetry shell
     poetry install
     ```
   - Poetry manages package installation, virtual environments, and dependencies, ensuring project isolation and reproducibility.

3. **Running Dependencies**

   - Start PostgreSQL and LangFuse services using Docker Compose to ensure backend functionality:
     ```
     docker-compose up -d db
     docker-compose up -d langfuse
     ```

4. **Environment Variables Management with direnv**

   - Copy `.envrc.template` to `.envrc`:
     ```
     cp .envrc.template .envrc
     ```
   - Use direnv for loading the `.envrc` file into the shell. Install direnv following the [installation guide](https://direnv.net/docs/installation.html).
   - Allow direnv in the project directory:
     ```
     direnv allow
     ```
   - Ensure the minimum required variables are set in `.envrc`:
     ```
     ENV=your_environment
     DB_URL_LOCAL=your_database_url
     ```

5. **Launching the Backend**
   - Execute the following command within the `backend/` directory to run the backend locally:
     ```
     make run-local
     ```

### Frontend

1. **NodeJS and Yarn Setup**

   - Ensure NodeJS is installed using NVM with the correct version and install yarn globally:
     ```
     npm i -g yarn
     ```

2. **Installing and Running**

   - Navigate to the `frontend/` directory and install frontend dependencies:

     ```
     cd frontend/
     yarn
     ```

   - Start the frontend development server:
     ```
     yarn dev
     ```

## Continuous Integration and Code Quality

- **GitHub CI with Pre-commit**
  - GitHub enforces code quality checks with `pre-commit`, ensuring adherence to coding standards (formatting, linting) on every commit. Commits failing these checks cannot be merged.
    ```
    # In repo root folder:
    make code-quality
    ```

## Testing

- While the application currently has limited testing coverage, the backend includes unit tests implemented using pyenv:

  ```
  cd backend/
  pyenv .
  ```

## Deployment

- **Hosting on GCP Cloud Run**
- Before deploying to Cloud Run, ensure the frontend is compiled to the latest build:

  ```
  cd frontend/
  yarn build
  ```

- Contact the repository admin for deployment instructions tailored to our Cloud Run environment.

- **Future Enhancements**
- Work is underway to establish an automated deployment pipeline to streamline deployment processes and improve overall deployment efficiency.
