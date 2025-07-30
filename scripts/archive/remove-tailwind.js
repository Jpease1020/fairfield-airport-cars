#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Tailwind class patterns to match
const tailwindPatterns = [
  // Layout
  /\b(flex|grid|block|inline|hidden|visible)\b/g,
  /\b(container|max-w-|w-|h-|min-w-|min-h-)\b/g,
  /\b(mx-|my-|mt-|mb-|ml-|mr-|px-|py-|pt-|pb-|pl-|pr-)\b/g,
  
  // Colors
  /\b(bg-|text-|border-|ring-|shadow-)\b/g,
  /\b(from-|to-|via-)\b/g,
  /\b(opacity-|bg-opacity-|text-opacity-)\b/g,
  
  // Typography
  /\b(text-|font-|leading-|tracking-|align-)\b/g,
  /\b(italic|not-italic|uppercase|lowercase|capitalize|normal-case)\b/g,
  
  // Spacing
  /\b(space-|gap-|row-|col-)\b/g,
  
  // Sizing
  /\b(basis-|grow-|shrink-)\b/g,
  
  // Borders
  /\b(border-|rounded-|ring-)\b/g,
  
  // Effects
  /\b(shadow-|blur-|brightness-|contrast-|grayscale-|hue-rotate-|invert-|saturate-|sepia-)\b/g,
  
  // Transitions
  /\b(transition-|duration-|ease-|delay-)\b/g,
  
  // Transforms
  /\b(transform|scale-|rotate-|translate-|skew-)\b/g,
  
  // Interactivity
  /\b(cursor-|select-|resize-)\b/g,
  
  // Responsive
  /\b(sm:|md:|lg:|xl:|2xl:)\b/g,
  
  // Hover/Focus/Active states
  /\b(hover:|focus:|active:|disabled:|group-hover:|group-focus:)\b/g,
  
  // Position
  /\b(static|fixed|absolute|relative|sticky|inset-|top-|right-|bottom-|left-|z-)\b/g,
  
  // Overflow
  /\b(overflow-|overscroll-)\b/g,
  
  // Display
  /\b(table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row|table-row-group)\b/g,
  
  // Object fit
  /\b(object-|object-position-)\b/g,
  
  // Background
  /\b(bg-|bg-clip-|bg-origin-|bg-position-|bg-repeat-|bg-size-)\b/g,
  
  // Gradients
  /\b(bg-gradient-)\b/g,
  
  // Animation
  /\b(animate-)\b/g,
  
  // Backdrop
  /\b(backdrop-)\b/g,
  
  // Will change
  /\b(will-change-)\b/g,
  
  // Content
  /\b(content-|clear-|float-|break-|isolation|mix-blend-|background-blend-)\b/g,
  
  // Filters
  /\b(filter|backdrop-filter)\b/g,
  
  // Tables
  /\b(table-|border-separate|border-collapse)\b/g,
  
  // Flexbox
  /\b(flex-|flex-row|flex-col|flex-wrap|flex-nowrap|flex-grow|flex-shrink|flex-basis|order-|justify-|items-|content-|self-|place-)\b/g,
  
  // Grid
  /\b(grid-|grid-cols-|grid-rows-|col-|row-|col-start-|col-end-|row-start-|row-end-|auto-cols-|auto-rows-|gap-|gap-x-|gap-y-)\b/g,
  
  // Columns
  /\b(columns-|column-|break-inside-|break-before-|break-after-)\b/g,
  
  // Box alignment
  /\b(justify-|align-|place-|self-)\b/g,
  
  // Spacing
  /\b(space-|divide-|divide-x-|divide-y-|divide-reverse)\b/g,
  
  // Sizing
  /\b(w-|h-|min-w-|min-h-|max-w-|max-h-)\b/g,
  
  // Typography
  /\b(font-|text-|leading-|tracking-|align-|whitespace-|break-|hyphens-|content-)\b/g,
  
  // Backgrounds
  /\b(bg-|bg-clip-|bg-origin-|bg-position-|bg-repeat-|bg-size-|bg-attachment-)\b/g,
  
  // Borders
  /\b(border-|border-t-|border-r-|border-b-|border-l-|border-opacity-|border-style-|border-width-|rounded-|rounded-t-|rounded-r-|rounded-b-|rounded-l-|rounded-tl-|rounded-tr-|rounded-br-|rounded-bl-)\b/g,
  
  // Effects
  /\b(box-shadow-|opacity-|mix-blend-|background-blend-|filter|backdrop-filter|backdrop-blur-|backdrop-brightness-|backdrop-contrast-|backdrop-grayscale-|backdrop-hue-rotate-|backdrop-invert-|backdrop-opacity-|backdrop-saturate-|backdrop-sepia-)\b/g,
  
  // Transitions
  /\b(transition-|duration-|ease-|delay-|animate-)\b/g,
  
  // Transforms
  /\b(transform|scale-|rotate-|translate-|skew-|origin-)\b/g,
  
  // Interactivity
  /\b(appearance-|cursor-|outline-|pointer-events-|resize-|select-|user-select-)\b/g,
  
  // SVG
  /\b(fill-|stroke-|stroke-width-)\b/g,
  
  // Accessibility
  /\b(sr-only|not-sr-only)\b/g,
  
  // Screen readers
  /\b(sr-only|not-sr-only)\b/g,
  
  // Print
  /\b(print:)\b/g,
  
  // Dark mode
  /\b(dark:)\b/g,
  
  // Reduced motion
  /\b(motion-reduce:|motion-safe:)\b/g,
  
  // Container queries
  /\b(@container)\b/g,
  
  // Arbitrary values
  /\b(\[.*?\])\b/g,
];

function removeTailwindClasses(content) {
  // Remove className attributes that contain only Tailwind classes
  content = content.replace(/className="([^"]*)"([^>]*>)/g, (match, classes, rest) => {
    // Check if the classes contain any Tailwind patterns
    const hasTailwind = tailwindPatterns.some(pattern => pattern.test(classes));
    
    if (hasTailwind) {
      return `className=""${rest}`;
    }
    
    return match;
  });
  
  // Remove className attributes that are empty after Tailwind removal
  content = content.replace(/className="\s*"/g, 'className=""');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = removeTailwindClasses(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts',
    'src/**/*.jsx',
    'src/**/*.js'
  ];
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    totalFiles += files.length;
    
    files.forEach(file => {
      processFile(file);
      updatedFiles++;
    });
  });
  
  console.log(`\n🎯 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log(`\n✨ Tailwind CSS removal complete!`);
}

if (require.main === module) {
  main();
}

module.exports = { removeTailwindClasses, processFile }; 