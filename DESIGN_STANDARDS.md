# Craw Hammer Trades School - Design Standards & Color Consistency

## Primary Color Palette
- **Primary Blue**: `blue-900` (#111827) - Used for headers, main sections, navbar accents
- **Primary Orange**: `orange-500` (#f97316) - Used for accents, badges, buttons, hover states
- **Secondary Blue**: `blue-100-200` - Used for text on dark backgrounds
- **Background**: `slate-50` (#f8fafc) - Main page background
- **Text Primary**: `slate-900` (#0f172a) - Primary text
- **Text Secondary**: `slate-600-700` - Secondary text

## Component Standards

### Navbar (All Pages)
- **Class**: `glass sticky top-0 z-50 rounded-b-2xl mx-2 mt-2`
- **Branding**: "CRAW HAMMER TRADES" with subtext "School"
- **Logo**: h-14 w-14 rounded-full with border-2 border-slate-100
- **Desktop Links**: text-slate-600 with hover:text-orange-500
- **Mobile Menu**: bg-white border-t-2 border-blue-900
- **Home Link (Mobile)**: text-blue-900 font-bold bg-blue-50 border-l-4 border-orange-500
- **CTA Button**: bg-orange-600 hover:bg-blue-900

### Page Headers (All Pages)
- **Class**: `bg-blue-900 py-12 sm:py-16 lg:py-20 text-center text-white relative overflow-hidden`
- **Background**: Background image with opacity-40 and gradient overlay
- **Title**: `text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight`
- **Subtitle**: `text-blue-200 text-sm sm:text-base`

### Footer (All Pages)
- **Class**: `bg-slate-900 text-slate-300 pt-16 pb-8`
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12`
- **Section Headers**: `text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-orange-500`
- **Links**: `hover:text-orange-500 transition`

### Primary Buttons
- **CTA Buttons**: `bg-orange-600 text-white hover:bg-orange-700`
- **Secondary Buttons**: `glass-button text-blue-900`
- **Padding**: `px-6 sm:px-8 py-3 sm:py-4`
- **Text Size**: `text-base sm:text-lg`

### Cards (Glass Effect)
- **Class**: `glass-card rounded-3xl`
- **Padding**: `p-6 sm:p-8 lg:p-10`
- **Hover**: Enhanced shadows and transitions

### TEVETA Accreditation Badge
- **Class**: `bg-orange-500 text-white`
- **Icon**: `fas fa-certificate`
- **Placement**: Top of headers and key sections

## Responsive Breakpoints
- **Mobile**: Default (base styles)
- **Small (sm)**: 640px
- **Medium (md)**: 768px
- **Large (lg)**: 1024px

## Typography Standards
- **Page Titles**: font-black, uppercase, tracking-tight
- **Section Headers**: font-bold, uppercase, tracking-widest, text-sm
- **Body Text**: font-medium, text-slate-600 to text-slate-700
- **Leading**: leading-relaxed for paragraphs, tight for headings

## Key Design Features
1. **Glassmorphism**: All cards use glass effect with backdrop-filter
2. **Orange Accents**: All interactive elements use orange-500 for hover/focus
3. **Consistency**: All pages follow same header/footer/navbar structure
4. **Responsiveness**: All components scale properly on mobile/tablet/desktop
5. **Floating Action Button**: Bottom-right, z-9999, orange-500 background
