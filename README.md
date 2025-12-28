# Simple Iconify Picker Extension
A custom interface extension for Directus that provides an intuitive icon picker powered by the Iconify API. Browse and select from thousands of icons across multiple icon sets.

## ✨ Features
- 🎨 Massive Icon Library - Access to 150+ icon sets with over 200,000 icons via Iconify API
- 🔍 Real-time Search - Quickly find icons with instant search filtering
- 🌐 Cross-Collection Search - Search across all icon sets simultaneously
- 📦 Collection Filtering - Browse icons by specific collection (Material Design, FontAwesome, etc.)
- 🎯 Visual Preview - See selected icons directly in your field
- ⚙️ Configurable - Customize default collections, allowed sets, and icon sizes
- 🚀 Lightweight - No external dependencies, uses native Fetch API
- 🔒 CSP Compliant - Built-in proxy to bypass Content Security Policy restrictions
- ⚡ Smart Caching - Reduces API calls with intelligent caching
- 🛡️ Rate Limiting - Built-in rate limiting to prevent API abuse

## 📋 Requirements
- Directus 10.0.0 or higher
- Node.js 16.x or higher

## Screenshots
![](/screenshots/field-creation.jpg?raw=true)
![](/screenshots/icon-collection.jpg?raw=true)
![](/screenshots/icon-filtering.jpg?raw=true)
![](/screenshots/icon-selected.jpg?raw=true)

## 🚀 Installation
Option 1: NPM Package (Recommended)
```
npm install directus-extension-iconify-picker
```
Option 2: Manual Installation
Download or clone this repository
```
git clone https://github.com/yourusername/directus-extension-iconify-picker.git
cd directus-extension-iconify-picker
```
Install dependencies
```
npm install
```

Build the extension
```
npm run build
```
Copy to Directus extensions folder
```
# Copy the entire dist folder to your Directus extensions directory
cp -r dist /path/to/your/directus/extensions/simple-iconify-picker
``` 

# 🎯 Usage
## 1. Add Field to Collection
   - Navigate to Settings → Data Model
   - Select your collection or create a new one
   - Click Create Field
   - Choose Input → String as the field type
   - In the Interface section, select Iconify Picker
   - Configure options (see below)
   - Save your field

## 2 . Configure Options
Default Icon Collection - Set the default collection that loads when opening the picker.

```
Default: mdi (Material Design Icons)
Examples: mdi, fa, heroicons, lucide
```

Allowed Collections - Restrict the picker to specific icon collections. Leave empty to allow all collections.

```
Examples: 
- mdi, fa, heroicons
- material-symbols, lucide, tabler
```

Preview Icon Size - Set the size (in pixels) for icon previews.
```
Default: 24
Range: 16-64
```

## 3. Using in Your Application
The extension stores the icon identifier as a string in the format collection:icon-name.

Example stored value:
 
```
mdi:home
fa:user
heroicons:bell
```
 
# 🎨 Popular Icon Collections
| Collection	| Prefix	| Icons	| Description |
|---------------|-----------|-------|-------------|
|Material Design Icons	| mdi	| 7,000+	| Google's Material Design icons||
|Font Awesome	|fa, fa6-solid	|2,000+	|Popular icon toolkit|
|Heroicons	|heroicons	|300+	|Beautiful hand-crafted SVG icons|
|Lucide	|lucide	|1,000+	|Clean, consistent icon set|
|Bootstrap Icons	|bi	|1,800+|	Official Bootstrap icons|
|Tabler Icons	|tabler	|4,000+|	Customizable open-source icons|
|Feather	|feather	|280+|	Simply beautiful icons|
|Phosphor	|ph	|6,000+|	Flexible icon family|

[Browse all collections →](https://icon-sets.iconify.design/)


## 🛠️ Development
Setup Development Environment

### Clone the repository
```
git clone https://github.com/yourusername/directus-extension-iconify-picker.git
cd directus-extension-iconify-picker
```

### Install dependencies
```
npm install
```

### Start development mode (watch for changes)
```
npm run dev
```

### Build for Production
```
npm run build
```

### Project Structure
```
simple-iconify-picker/
├── src/
│   ├── endpoint/
│   ├────── api.ts          # API proxy endpoint entry point
│   ├── interface/
│   ├────── index.ts        # Interface extension entry point
│   ├────── interface.vue   # Main Vue component
│   ├────── types.ts        # TypeScript type definitions
│   └────── shims.d.ts      # TypeScript module declarations
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

# 🔧 Technical Details
## Bundle Architecture
This extension is built as a bundle containing two components:

Interface Extension (app.js) - The Vue-based UI component that runs in the Directus admin panel
Endpoint Extension (api.js) - A proxy API that handles requests to the Iconify API
## API Proxy Features
- **Rate Limiting**: 10 requests per minute per IP address
- **Caching**: 1-hour cache for collections and icons
- **Error Handling**: Graceful error handling with user-friendly messages
- **CSP Bypass**: Proxies requests to avoid Content Security Policy restrictions

## Endpoints
- **GET** /iconify-proxy/collections - Fetch all available icon collections
- **GET** /iconify-proxy/collection?prefix={prefix} - Fetch icons from a specific collection
- **GET** /iconify-proxy/search?query={query}&limit={limit} - Search across all icon sets
- **GET** /iconify-proxy/icon/{collection}/{icon}?height={height} - Fetch a specific icon as SVG

# 🐛 Troubleshooting
### Problem: The icon picker opens but no icons are displayed.
- Check your internet connection (Iconify API requires internet access)
- Verify that the extension is properly installed in the extensions folder
- Check browser console for error messages
- Ensure Directus has been restarted after installation

### Problem: Search doesn't filter icons or returns no results.
- When searching in a specific collection, ensure icons are loaded first
- For "All Icon Sets" search, type at least 2 characters
- Wait for the debounce delay (500ms for all sets, instant for single collection)
- Check for rate limiting errors in the console

### Problem: 429 Too Many Requests error - Getting rate limit errors from the API.
- The extension has built-in rate limiting (10 requests/minute)
- Wait a minute before trying again
- The cache should reduce API calls significantly
- Consider increasing the cache duration in endpoint-entry.ts

### Problem: Can't find "Iconify Picker" in the interface dropdown.
- Ensure both app.js and api.js are in the extensions folder
- Verify the extension folder structure is correct
- Restart your Directus instance
- Check Directus logs for extension loading errors
- Ensure the extension type is set to "bundle" in package.json

### Problem: Icon is selected but doesn't show in the field.
- Ensure the field type is set to String
- Check that the value is being saved correctly in the database
- Verify the icon identifier format is collection:icon-name
- Check browser console for image loading errors

# 🙏 Acknowledgments
- [Iconify](https://iconify.design/) - For providing the amazing icon API
- [Directus](https://directus.io/) - For the excellent headless CMS platform
- All icon set creators and maintainers

# 🔗 Links
- [Iconify API Documentation](https://iconify.design/docs/api/)
- [Directus Extensions Documentation](https://docs.directus.io/extensions/)
- [Browse Icon Collections](https://icon-sets.iconify.design/)

--------------------
Made with ❤️ for the Directus community