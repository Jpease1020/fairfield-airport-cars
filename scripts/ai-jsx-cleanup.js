#!/usr/bin/env node

/**
 * AI-Assisted JSX Cleanup Script
 * 
 * This script helps automate JSX cleanup using AI assistance patterns
 * based on our established component rules and refactoring patterns.
 */

const fs = require('fs');
const path = require('path');

// AI-assisted cleanup patterns
const AI_CLEANUP_PATTERNS = {
  // HTML tag replacements
  htmlTagReplacements: [
    {
      pattern: /<div\s+([^>]*)>/g,
      replacement: '<Container $1>',
      description: 'Replace div with Container'
    },
    {
      pattern: /<\/div>/g,
      replacement: '</Container>',
      description: 'Close Container tag'
    },
    {
      pattern: /<span\s+([^>]*)>/g,
      replacement: '<Span $1>',
      description: 'Replace span with Span'
    },
    {
      pattern: /<\/span>/g,
      replacement: '</Span>',
      description: 'Close Span tag'
    },
    {
      pattern: /<p\s+([^>]*)>/g,
      replacement: '<Text $1>',
      description: 'Replace p with Text'
    },
    {
      pattern: /<\/p>/g,
      replacement: '</Text>',
      description: 'Close Text tag'
    },
    {
      pattern: /<h1\s+([^>]*)>/g,
      replacement: '<H1 $1>',
      description: 'Replace h1 with H1'
    },
    {
      pattern: /<\/h1>/g,
      replacement: '</H1>',
      description: 'Close H1 tag'
    },
    {
      pattern: /<h2\s+([^>]*)>/g,
      replacement: '<H2 $1>',
      description: 'Replace h2 with H2'
    },
    {
      pattern: /<\/h2>/g,
      replacement: '</H2>',
      description: 'Close H2 tag'
    },
    {
      pattern: /<h3\s+([^>]*)>/g,
      replacement: '<H3 $1>',
      description: 'Replace h3 with H3'
    },
    {
      pattern: /<\/h3>/g,
      replacement: '</H3>',
      description: 'Close H3 tag'
    },
    {
      pattern: /<h4\s+([^>]*)>/g,
      replacement: '<H4 $1>',
      description: 'Replace h4 with H4'
    },
    {
      pattern: /<\/h4>/g,
      replacement: '</H4>',
      description: 'Close H4 tag'
    },
    {
      pattern: /<h5\s+([^>]*)>/g,
      replacement: '<H5 $1>',
      description: 'Replace h5 with H5'
    },
    {
      pattern: /<\/h5>/g,
      replacement: '</H5>',
      description: 'Close H5 tag'
    },
    {
      pattern: /<h6\s+([^>]*)>/g,
      replacement: '<H6 $1>',
      description: 'Replace h6 with H6'
    },
    {
      pattern: /<\/h6>/g,
      replacement: '</H6>',
      description: 'Close H6 tag'
    },
    {
      pattern: /<section\s+([^>]*)>/g,
      replacement: '<Section $1>',
      description: 'Replace section with Section'
    },
    {
      pattern: /<\/section>/g,
      replacement: '</Section>',
      description: 'Close Section tag'
    },
    {
      pattern: /<article\s+([^>]*)>/g,
      replacement: '<Card $1>',
      description: 'Replace article with Card'
    },
    {
      pattern: /<\/article>/g,
      replacement: '</Card>',
      description: 'Close Card tag'
    },
    {
      pattern: /<(header|footer|main|aside|nav)\s+([^>]*)>/g,
      replacement: '<Container $2>',
      description: 'Replace header/footer/main/aside/nav with Container'
    },
    {
      pattern: /<\/(header|footer|main|aside|nav)>/g,
      replacement: '</Container>',
      description: 'Close Container tag'
    }
  ],

  // Nested component cleanup
  nestedComponentCleanup: [
    {
      pattern: /<Container[^>]*>\s*<Container[^>]*>/g,
      replacement: '<Container',
      description: 'Remove nested Container components'
    },
    {
      pattern: /<\/Container>\s*<\/Container>/g,
      replacement: '</Container>',
      description: 'Close single Container'
    },
    {
      pattern: /<Stack[^>]*>\s*<Stack[^>]*>/g,
      replacement: '<Stack',
      description: 'Remove nested Stack components'
    },
    {
      pattern: /<\/Stack>\s*<\/Stack>/g,
      replacement: '</Stack>',
      description: 'Close single Stack'
    },
    {
      pattern: /<Card[^>]*>\s*<Card[^>]*>/g,
      replacement: '<Card',
      description: 'Remove nested Card components'
    },
    {
      pattern: /<\/Card>\s*<\/Card>/g,
      replacement: '</Card>',
      description: 'Close single Card'
    }
  ],

  // className cleanup for reusable components
  classNameCleanup: [
    {
      pattern: /<Container\s+className=\{([^}]+)\}/g,
      replacement: '<Container',
      description: 'Remove className from Container (use props instead)'
    },
    {
      pattern: /<Stack\s+className=\{([^}]+)\}/g,
      replacement: '<Stack',
      description: 'Remove className from Stack (use props instead)'
    },
    {
      pattern: /<Card\s+className=\{([^}]+)\}/g,
      replacement: '<Card',
      description: 'Remove className from Card (use props instead)'
    },
    {
      pattern: /<Text\s+className=\{([^}]+)\}/g,
      replacement: '<Text',
      description: 'Remove className from Text (use props instead)'
    },
    {
      pattern: /<Span\s+className=\{([^}]+)\}/g,
      replacement: '<Span',
      description: 'Remove className from Span (use props instead)'
    }
  ]
};

class AICleanupAgent {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      violationsFixed: 0,
      errors: 0
    };
  }

  // Get all TypeScript/TSX files to process
  getFilesToProcess() {
    const files = [];
    const dirs = [
      'src/components',
      'src/app',
      'src/lib'
    ];

    dirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.walkDir(dir, (filePath) => {
          if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            files.push(filePath);
          }
        });
      }
    });

    return files;
  }

  // Walk directory recursively
  walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.walkDir(filePath, callback);
      } else {
        callback(filePath);
      }
    });
  }

  // Process a single file with AI cleanup patterns
  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let changesMade = 0;

      // Apply HTML tag replacements
      AI_CLEANUP_PATTERNS.htmlTagReplacements.forEach(pattern => {
        const matches = content.match(pattern.pattern);
        if (matches) {
          content = content.replace(pattern.pattern, pattern.replacement);
          changesMade += matches.length;
        }
      });

      // Apply nested component cleanup
      AI_CLEANUP_PATTERNS.nestedComponentCleanup.forEach(pattern => {
        const matches = content.match(pattern.pattern);
        if (matches) {
          content = content.replace(pattern.pattern, pattern.replacement);
          changesMade += matches.length;
        }
      });

      // Apply className cleanup (only for reusable components)
      if (filePath.includes('/ui/') || filePath.includes('/components/ui/')) {
        AI_CLEANUP_PATTERNS.classNameCleanup.forEach(pattern => {
          const matches = content.match(pattern.pattern);
          if (matches) {
            content = content.replace(pattern.pattern, pattern.replacement);
            changesMade += matches.length;
          }
        });
      }

      // Write changes if any were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${changesMade} violations in: ${filePath}`);
        this.stats.violationsFixed += changesMade;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  // Run the AI cleanup process
  run() {
    console.log('🤖 Starting AI-assisted JSX cleanup...\n');

    const files = this.getFilesToProcess();
    console.log(`📁 Found ${files.length} files to process\n`);

    let processedCount = 0;
    files.forEach(filePath => {
      if (this.processFile(filePath)) {
        processedCount++;
      }
      this.stats.filesProcessed++;
    });

    this.printResults();
  }

  // Print cleanup results
  printResults() {
    console.log('\n📊 AI Cleanup Results:');
    console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
    console.log(`🔧 Violations fixed: ${this.stats.violationsFixed}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    if (this.stats.violationsFixed > 0) {
      console.log('\n🎉 Successfully applied AI cleanup patterns!');
      console.log('💡 Next steps:');
      console.log('   1. Run "npm run check:components" to verify fixes');
      console.log('   2. Test components to ensure functionality is maintained');
      console.log('   3. Review any remaining violations manually');
    } else {
      console.log('\n✨ No violations found to fix!');
    }
  }
}

// Run the AI cleanup agent
if (require.main === module) {
  const agent = new AICleanupAgent();
  agent.run();
}

module.exports = AICleanupAgent; 