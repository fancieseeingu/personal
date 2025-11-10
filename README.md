# Personal Hobby Hub

A web application to track your hobbies including books, media, creative projects, materials, journal entries, and goals.

## 🚀 How to Run

**IMPORTANT:** This application uses ES6 modules and **MUST be run through a web server**. You cannot simply open `index.html` in your browser.

### Quick Start (Windows)

1. **Double-click `START_SERVER.bat`**
2. Your browser will automatically open to `http://localhost:8000`
3. If it doesn't open automatically, manually go to: **http://localhost:8000**

### Manual Start Options

#### Option 1: Python (Recommended)
```bash
# Navigate to the project folder
cd personal-hobby-hub

# Start server with Python 3
python -m http.server 8000

# OR with Python 2
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

#### Option 2: VS Code Live Server
1. Install VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

#### Option 3: Node.js
```bash
npx http-server -p 8000
```

#### Option 4: PHP
```bash
php -S localhost:8000
```

## 📋 Features

- **Dashboard**: Overview of all your hobbies with statistics and active goals
- **Books**: Track books you're reading with status, ratings, and reviews
- **Media**: Track movies and series (Chinese, Korean, American) with episode progress
- **Projects**: Manage creative projects (drawing/crafting) with image galleries
- **Materials**: Inventory of art supplies and craft materials with stock tracking
- **Journal**: Write journal entries with tags and link to other items
- **Goals**: Set and track goals for reading, media watching, and creative projects
- **Search**: Global search across all sections with filters

## 🛠️ Technology Stack

- Pure JavaScript (ES6 Modules)
- HTML5 & CSS3
- LocalStorage for data persistence
- No external dependencies or frameworks

## 📁 Project Structure

```
personal-hobby-hub/
├── index.html              # Main HTML file
├── START_SERVER.bat        # Quick start script for Windows
├── css/                    # Stylesheets
│   ├── main.css
│   ├── components.css
│   ├── dashboard.css
│   ├── books.css
│   ├── media.css
│   ├── projects.css
│   ├── materials.css
│   ├── journal.css
│   ├── goals.css
│   ├── search.css
│   └── toast.css
├── js/
│   ├── app.js             # Main application entry point
│   ├── models/            # Data models
│   ├── views/             # UI views
│   ├── controllers/       # Business logic controllers
│   ├── services/          # Services (Storage, Search, Goal Tracking)
│   └── utils/             # Utility functions
└── assets/                # Images and icons

```

## 💾 Data Storage

All data is stored locally in your browser's LocalStorage. Your data persists between sessions but is specific to your browser and device.

## 🐛 Troubleshooting

### "Unexpected error occurred" when clicking buttons
- **Cause**: You're opening the file directly (file:// protocol)
- **Solution**: Run a local web server using one of the methods above

### Blank page or no content
- Check browser console (F12) for errors
- Ensure you're accessing via http://localhost:8000 (not file://)
- Clear browser cache and reload

### Data not saving
- Check if LocalStorage is enabled in your browser
- Check if you've exceeded storage quota (5-10MB typically)
- Try clearing old data or reducing image sizes

## 📝 Usage Tips

1. **Start with Goals**: Set your hobby goals first
2. **Track Progress**: Add books, media, or projects and mark them complete
3. **Goals Auto-Update**: Your goals automatically update when you complete items
4. **Use Journal**: Reflect on your hobbies by writing journal entries
5. **Link Items**: Connect journal entries to specific books, media, or projects
6. **Search Everything**: Use the global search to find anything quickly

## 🎨 Customization

You can customize the color scheme by editing CSS variables in `css/main.css`:

```css
:root {
    --primary-color: #4A90E2;
    --secondary-color: #7B68EE;
    --success-color: #50C878;
    --warning-color: #FFB347;
    /* ... more colors */
}
```

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork, modify, and enhance this project for your own needs!

---

**Enjoy tracking your hobbies! 🎉**

---

## 📱 Use on Your Phone!

This app is now a **Progressive Web App (PWA)**! You can install it on your phone like a real app!

### Quick Steps:
1. **Deploy online** - See [DEPLOYMENT.md](DEPLOYMENT.md) for easy instructions
2. **Install on phone** - See [INSTALL_ON_PHONE.md](INSTALL_ON_PHONE.md) for step-by-step guide

### What You Get:
- ✅ App icon on your home screen
- ✅ Works offline
- ✅ No app store needed
- ✅ Free forever!
- ✅ No widgets needed - just a regular app icon!

**Perfect for daily hobby tracking! 💕✨**
