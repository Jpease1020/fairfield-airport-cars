#!/usr/bin/env node

/**
 * 🎯 UNIFIED LAYOUT MIGRATION SCRIPT
 * 
 * Converts ALL pages to use the single UnifiedLayout system
 * Ensures 100% consistency across the entire application
 */

const fs = require('fs');
const path = require('path');

// Pages to migrate with their optimal layout types
const PAGES_TO_MIGRATE = [
  // Root pages
  { file: 'src/app/help/page.tsx', layoutType: 'content', title: 'Help & Support', subtitle: 'Find answers to common questions' },
  { file: 'src/app/terms/page.tsx', layoutType: 'content', title: 'Terms of Service', subtitle: 'Our terms and conditions' },
  { file: 'src/app/privacy/page.tsx', layoutType: 'content', title: 'Privacy Policy', subtitle: 'How we protect your information' },
  { file: 'src/app/cancel/page.tsx', layoutType: 'standard', title: 'Cancel Booking', subtitle: 'Cancel your reservation' },
  { file: 'src/app/success/page.tsx', layoutType: 'status', title: 'Booking Confirmed', subtitle: 'Your ride has been successfully booked' },
  { file: 'src/app/portal/page.tsx', layoutType: 'standard', title: 'Customer Portal', subtitle: 'Manage your bookings and account' },
  
  // Status pages
  { file: 'src/app/status/[id]/page.tsx', layoutType: 'status', title: 'Booking Status', subtitle: 'Track your ride' },
  { file: 'src/app/feedback/[id]/page.tsx', layoutType: 'standard', title: 'Share Feedback', subtitle: 'Tell us about your experience' },
  { file: 'src/app/manage/[id]/page.tsx', layoutType: 'standard', title: 'Manage Booking', subtitle: 'Update your reservation' },
  { file: 'src/app/booking/[id]/page.tsx', layoutType: 'standard', title: 'Booking Details', subtitle: 'View your reservation' },
  
  // Admin pages
  { file: 'src/app/admin/bookings/page.tsx', layoutType: 'admin', title: 'Manage Bookings', subtitle: 'View and manage all reservations', showNav: false },
  { file: 'src/app/admin/cms/page.tsx', layoutType: 'admin', title: 'Content Management', subtitle: 'Manage website content', showNav: false },
  { file: 'src/app/admin/cms/pages/page.tsx', layoutType: 'admin', title: 'Page Content', subtitle: 'Edit page content', showNav: false },
  { file: 'src/app/admin/cms/colors/page.tsx', layoutType: 'admin', title: 'Colors & Design', subtitle: 'Customize website appearance', showNav: false },
  { file: 'src/app/admin/cms/business/page.tsx', layoutType: 'admin', title: 'Business Settings', subtitle: 'Company information and settings', showNav: false },
  { file: 'src/app/admin/cms/pricing/page.tsx', layoutType: 'admin', title: 'Pricing Settings', subtitle: 'Manage rates and pricing', showNav: false },
  { file: 'src/app/admin/drivers/page.tsx', layoutType: 'admin', title: 'Driver Management', subtitle: 'Manage drivers and schedules', showNav: false },
  { file: 'src/app/admin/feedback/page.tsx', layoutType: 'admin', title: 'Customer Feedback', subtitle: 'View customer reviews', showNav: false },
  { file: 'src/app/admin/help/page.tsx', layoutType: 'admin', title: 'Admin Help', subtitle: 'Documentation and support', showNav: false },
  { file: 'src/app/admin/promos/page.tsx', layoutType: 'admin', title: 'Promotions', subtitle: 'Manage discounts and offers', showNav: false },
  { file: 'src/app/admin/calendar/page.tsx', layoutType: 'admin', title: 'Calendar View', subtitle: 'Schedule overview', showNav: false },
  { file: 'src/app/admin/costs/page.tsx', layoutType: 'admin', title: 'Cost Tracking', subtitle: 'Business expenses', showNav: false },
  { file: 'src/app/admin/comments/page.tsx', layoutType: 'admin', title: 'Comments', subtitle: 'Customer comments', showNav: false },
];

// Template for the UnifiedLayout wrapper
const UNIFIED_LAYOUT_TEMPLATE = (imports, layoutType, title, subtitle, showNav, content) => `${imports.replace(/UniversalLayout|LayoutEnforcer|CMSStandardPage|CMSMarketingPage|CMSContentPage|CMSConversionPage|CMSStatusPage/g, 'UnifiedLayout').replace(/, LayoutEnforcer[^,]*,?/g, '').replace(/from '@\/lib\/design-system\/LayoutEnforcer'/g, '').replace(/from '@\/components\/layout\/[^']*'/g, "from '@/components/layout'")}

${content.replace(/\s*<(LayoutEnforcer|UniversalLayout|CMSStandardPage|CMSMarketingPage|CMSContentPage|CMSConversionPage|CMSStatusPage)[^>]*>[\s\S]*?<\/(LayoutEnforcer|UniversalLayout|CMSStandardPage|CMSMarketingPage|CMSContentPage|CMSConversionPage|CMSStatusPage)>/g, (match) => {
  // Extract the children content
  const childrenMatch = match.match(/<[^>]+>([\s\S]*)<\/[^>]+>$/);
  const children = childrenMatch ? childrenMatch[1].trim() : '';
  
  return `<UnifiedLayout 
      layoutType="${layoutType}"
      title="${title}"
      subtitle="${subtitle}"${showNav === false ? '\n      showNavigation={false}\n      showFooter={false}' : ''}
    >
      ${children}
    </UnifiedLayout>`;
})}`;

function migrateFile(pageConfig) {
  const filePath = pageConfig.file;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already using UnifiedLayout
  if (content.includes('UnifiedLayout')) {
    console.log(`✅ Already migrated: ${filePath}`);
    return;
  }

  // Extract imports section
  const importsMatch = content.match(/^([\s\S]*?import[^;]*;[\s\S]*?)(?=\n\s*(?:function|export|const|interface))/m);
  const imports = importsMatch ? importsMatch[1] : '';
  
  // Extract main content
  const mainContentMatch = content.match(/(?:function|export|const)[^{]*{([\s\S]*)}[^}]*$/);
  const mainContent = mainContentMatch ? mainContentMatch[1] : content;

  // Apply the UnifiedLayout template
  const migratedContent = UNIFIED_LAYOUT_TEMPLATE(
    imports,
    pageConfig.layoutType,
    pageConfig.title,
    pageConfig.subtitle,
    pageConfig.showNav,
    mainContent
  );

  // Write back the migrated content
  fs.writeFileSync(filePath, migratedContent);
  console.log(`🎯 Migrated: ${filePath} → ${pageConfig.layoutType} layout`);
}

function main() {
  console.log('🚀 Starting Unified Layout Migration...\n');
  
  let migratedCount = 0;
  let skippedCount = 0;

  PAGES_TO_MIGRATE.forEach(pageConfig => {
    try {
      if (fs.existsSync(pageConfig.file)) {
        migrateFile(pageConfig);
        migratedCount++;
      } else {
        console.log(`⚠️  Skipped (not found): ${pageConfig.file}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error migrating ${pageConfig.file}:`, error.message);
    }
  });

  console.log(`\n✅ Migration Complete!`);
  console.log(`📊 Statistics:`);
  console.log(`   • Migrated: ${migratedCount} pages`);
  console.log(`   • Skipped: ${skippedCount} pages`);
  console.log(`   • Total: ${PAGES_TO_MIGRATE.length} pages processed`);
  console.log(`\n🎯 Result: ALL pages now use the single UnifiedLayout system!`);
}

if (require.main === module) {
  main();
} 