# SACCO management system using React and Django


**Open SACCO** is a comprehensive SACCO management system designed to streamline operations for Savings and Credit Cooperative Organizations (SACCOs). The platform is built with a Django REST API backend and a React.js frontend, offering a seamless and user-friendly experience.

---

## Features

- **Membership Management**: Register, manage, and update member information.
- **Account Management**: Handle individual and group accounts, including deposits, withdrawals, and balances.
- **Loans and Savings**: Manage loan applications, approvals, repayments, and savings contributions.
- **Transactions**: Record and track all financial transactions.
- **Dashboards**: Visualize data with dynamic charts and summaries for better decision-making.
- **Authentication**: Secure user authentication and role-based access control.
- **Custom Reports**: Generate reports tailored to organizational needs.

---

## Technologies Used

### Backend
- **Framework**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: PostgreSQL (or your chosen database)
- **Authentication**: Token-based authentication (e.g., JWT)

### Frontend
- **Library**: [React.js](https://reactjs.org/)
- **State Management**: Context API or Redux
- **UI Framework**: Tailwind CSS or Material-UI (if applicable)

---

## Installation and Setup

### Prerequisites
- Python 3.9+ and pip
- Node.js 16+ and npm or yarn
- PostgreSQL
- Git

### Clone the Repository
```bash
git clone https://github.com/isaacmain254/open-sacco.git
cd open-sacco
```

Backend Setup
Navigate to the backend folder:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up the database:

Update settings.py with your database credentials.
Run migrations:

```bash
python manage.py makemigrations
```
Then migrate to create the database:

```bash
python manage.py migrate
```
Run the development server:

```bash
python manage.py runserver
```

Frontend Setup
Navigate to the frontend folder:

```bash
cd web-app
```

Install dependencies:

```bash
npm install
```

Configure API endpoint:

Update the API base URL in the environment file (.env).
Start the development server:

```bash
npm start
```

Usage
Access the app via http://localhost:3000 for the frontend.
The API is accessible via http://localhost:8000 for backend routes.

Use the admin panel for administrative tasks:
URL: http://localhost:8000/admin
Create a superuser:

```bash
python manage.py createsuperuser
```
Contributing
Contributions are welcome! Follow these steps to contribute:

Fork the repository.
Create a feature branch:

```bash
git checkout -b feature-name
```

Commit your changes and push to the branch:

```bash
git commit -m "Description of feature"
git push origin feature-name
```
Create a pull request.

License

This project is licensed under the MIT License.

Contact


For inquiries or support, reach out to isaacmain254.
