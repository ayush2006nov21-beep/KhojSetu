# 🔎 KhojSetu – Find What Matters

**KhojSetu** is a web-based Lost and Found Management System designed to bridge the gap between people who have lost their belongings and those who have found them.

The platform simplifies the process of reporting lost and found items and uses intelligent matching to help users discover potential matches.

## ✨ Key Features

- **User Authentication:** Secure user registration and login.
- **Lost Item Reporting:** Submit reports for missing belongings.
- **Found Item Reporting:** Upload details of discovered items.
- **Smart Matching System:** Automatically identifies potential matches between lost and found reports.
- **Match Details:** View matching results and relevant item information.
- **Admin Management:** Manage reports and platform activities.
- **CSV Export:** Export report data for management and analysis.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend development |
| Flask | Web framework |
| SQLite | Database |
| HTML | Web structure |
| CSS | Styling and design |
| JavaScript | Frontend interactivity |

## 📁 Project Structure

```text
KhojSetu/
│
├── services/          # Matching and backend services
├── templates/         # HTML templates
├── static/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── uploads/       # Upload directory
│
├── app.py             # Main Flask application
├── requirements.txt   # Project dependencies
├── Procfile           # Deployment configuration
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/ayush2006nov21-beep/KhojSetu.git
```

### 2. Navigate to the project

```bash
cd KhojSetu
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

### 4. Activate the environment

Windows:

```bash
venv\Scripts\activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Configure environment variables

Create a local `.env` file and add the required configuration and API credentials, if applicable. Never upload this file to GitHub.

### 7. Run the application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

## 🎯 Project Objective

KhojSetu aims to make recovering lost belongings easier by connecting people through a centralised digital platform and intelligent matching.

## 👨‍💻 Developer

**Ayush Sharma**

GitHub: [@ayush2006nov21-beep](https://github.com/ayush2006nov21-beep)

---

*KhojSetu – Find What Matters.*
