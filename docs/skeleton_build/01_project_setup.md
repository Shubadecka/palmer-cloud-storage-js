# Step 1: Project Setup

Initialize a new Vite project with React and configure Tailwind CSS.

## Tasks

### 1.1 Create Vite Project

From the repository root, create a new Vite project in the `app/` directory:

```bash
npm create vite@latest app -- --template react
cd app
npm install
```

This scaffolds a React project with:
- `index.html` - Entry HTML file
- `src/main.jsx` - React entry point
- `src/App.jsx` - Root component
- `vite.config.js` - Vite configuration

### 1.2 Install Dependencies

Install the packages you'll need:

```bash
npm install react-router-dom date-fns
npm install -D tailwindcss postcss autoprefixer
```

- `react-router-dom` - Client-side routing
- `date-fns` - Lightweight date utilities
- `tailwindcss`, `postcss`, `autoprefixer` - Tailwind CSS and its dependencies

### 1.3 Initialize Tailwind CSS

Generate Tailwind config files:

```bash
npx tailwindcss init -p
```

This creates:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### 1.4 Configure Tailwind

Edit `tailwind.config.js` to specify which files Tailwind should scan for classes:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 1.5 Add Tailwind Directives

Replace the contents of `src/index.css` with Tailwind's base directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.6 Clean Up Default Files

Remove the default Vite demo content:
- Delete `src/App.css`
- Clear out `src/App.jsx` to a minimal component
- Remove the import for `App.css` from `App.jsx`

### 1.7 Create Folder Structure

Create the directory structure for the project:

```
src/
├── components/
│   ├── auth/
│   ├── entries/
│   ├── pages/
│   ├── layout/
│   └── ui/
├── pages/
├── services/
├── context/
└── hooks/
```

You can create these with:

```bash
mkdir -p src/components/{auth,entries,pages,layout,ui}
mkdir -p src/{pages,services,context,hooks}
```

### 1.8 Verify Setup

Run the dev server to verify everything works:

```bash
npm run dev
```

You should see Vite start on `http://localhost:5173` with a blank or minimal React app.

## Checkpoint

At this point you should have:
- [ ] Vite + React project running
- [ ] Tailwind CSS configured and working
- [ ] Empty folder structure created
- [ ] No errors in the console

## Next Step

Continue to [02_routing_setup.md](./02_routing_setup.md) to configure React Router.
