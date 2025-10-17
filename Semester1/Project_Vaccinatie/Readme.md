
## Table of Contents

- [HTML Templates](#html-templates)
- [Tutorial](#tutorial)
- [Setup Instructions](#setup-instructions)
- [Notes](#notes)
- [License](#license)

---

## Data Templates

All JSON files are located in te 'data' folder. 

## HTML Templates

All HTML templates are located in the `public` folder. They are functional and ready for server-side integration.

### 1. `index.html`

- Two input fields: **Email** and **Password**.
- Only email is currently used; password is reserved for future functionality.
- Login via **BSN** was considered, but the JavaScript validation is currently set for email and password.

### 2. `burger.html`

- Placeholders: `{{BSN}}` and `{{NAME}}`.
- The `server.js` creates JSON data for the logged-in 'burger' and sends it via `/api/burger?email=user@burger.com`.  

### 3. `zorg.html`

- Placeholders: `{{ZSN}}` and `{{NAME}}`.
- The `server.js` creates JSON data for the logged-in 'zorg medewerker' and sends it via `/api/zorg?email=user@zorg.com`.

    #### Example JSON response

```json
{
  "name": "Sofie Janssen",
  "zsn": "Z001",
  "appointments": [
    {
      "id": 1,
      "date": "2025-10-06",
      "time": "10:00",
      "bsn": "B001",
      "patient": {
        "name": "John Doe",
        "email": "john@burger.com"
      }
    },
    {
      "id": 2,
      "date": "2025-10-06",
      "time": "11:00",
      "bsn": "B002",
      "patient": {
        "name": "Jane Doe",
        "email": "jane@burger.com"
      }
    }
  ]
}
```

---

## Tutorial

Step-by-step setup guide available here:  
[Tutorial Video](https://youtu.be/32M1al-Y6Ag?si=r9QhcCDehi0JoXHrgit)

---

## Setup Instructions

1. Initialize the project:

```bash
npm init
```

Update `package.json` to include:

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}
```

- Run the project with:

```bash
npm start
```

- If using **nodemon**, update the script:

```json
"start": "nodemon server.js"
```

- If using a `.env` file:

```json
"start": "nodemon --env-file=.env server.js"
```

2. Install dependencies:

```bash
npm install -D nodemon
```

- Creates `node_modules` and `package-lock.json`.
- Adds to `devDependencies`:

```json
"devDependencies": {
  "nodemon": "^3.1.10"
}
```

> **Tip:** Do **not** push `node_modules` to GitHub. Recreate dependencies with:

```bash
npm install
```

3. Add a `.gitignore` file:

```
node_modules
```

> Ensures the `node_modules` folder is not pushed to GitHub.

4. Add a `.env` file for environment variables:

```
PORT=8000
```

- Can also store API keys or passwords.
- Ensures secure, easy configuration.

---



---

## License

This project is licensed under the [MIT License](LICENSE).
