# Assets Directory

This directory contains static assets like images, icons, and other media files.

## Usage Options

### Option 1: Import Assets (Recommended)

Import assets directly in your components. Vite will optimize and hash them:

```tsx
import logoImage from '@/assets/logo.png';
import iconSvg from '@/assets/icon.svg';

// Use in components
<Image src={logoImage} alt="Logo" />
<img src={iconSvg} alt="Icon" />
```

**Benefits:**
- ✅ Vite optimizes and hashes the files
- ✅ TypeScript support with proper types
- ✅ Tree-shaking (only imports what you use)
- ✅ Better performance with caching

### Option 2: Public Directory

Place assets in `public/` directory and reference them with absolute paths:

```tsx
// Place file in: public/images/logo.png
<Image src="/images/logo.png" alt="Logo" />
```

**Benefits:**
- ✅ Simple to use
- ✅ No import needed
- ❌ No optimization by Vite
- ❌ No TypeScript support

### Option 3: Dynamic Imports

For conditional loading:

```tsx
const loadImage = async (imageName: string) => {
  const module = await import(`@assets/${imageName}.png`);
  return module.default;
};

// Usage
const [imageSrc, setImageSrc] = useState<string>('');

useEffect(() => {
  loadImage('logo').then(setImageSrc);
}, []);
```

## Supported File Types

- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Vectors**: `.svg`
- **Other**: Any file type supported by Vite

## Best Practices

1. **Use imports for component assets** - Better optimization
2. **Use public directory for favicon, robots.txt, etc.** - Files that need specific URLs
3. **Organize by type** - Group similar assets in subdirectories
4. **Optimize images** - Compress before adding to assets
5. **Use descriptive names** - `user-avatar.png` instead of `img1.png`

## Directory Structure

```
src/assets/
├── images/
│   ├── logo.png
│   ├── icons/
│   └── backgrounds/
├── icons/
│   └── svg/
└── README.md
```

## Alias Configuration

The `@assets` alias is configured in:
- `vite.config.ts` - For build-time resolution
- `tsconfig.app.json` - For TypeScript support

This allows you to use `@assets/` instead of relative paths.

