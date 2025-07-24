import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

describe('Build Verification', () => {
  const projectRoot = process.cwd();

  describe('Package.json Validation', () => {
    it('should have required dependencies', () => {
      const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      
      // Check for critical dependencies
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.next).toBeDefined();
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
      
      // Check for critical dev dependencies
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.devDependencies.jest).toBeDefined();
    });

    it('should have valid scripts', () => {
      const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });
  });

  describe('Configuration Files', () => {
    it('should have required config files', () => {
      const requiredFiles = [
        'next.config.ts',
        'tsconfig.json',
        'jest.config.js',
        'postcss.config.mjs',
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(() => readFileSync(filePath, 'utf8')).not.toThrow();
      });
    });

    it('should have valid TypeScript configuration', () => {
      const tsConfig = JSON.parse(readFileSync(path.join(projectRoot, 'tsconfig.json'), 'utf8'));
      
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.include).toBeDefined();
      expect(tsConfig.exclude).toBeDefined();
    });
  });

  describe('Critical Source Files', () => {
    it('should have main app files', () => {
      const criticalFiles = [
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/book/page.tsx',
        'src/app/book/booking-form.tsx',
      ];

      criticalFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(() => readFileSync(filePath, 'utf8')).not.toThrow();
      });
    });

    it('should have critical API endpoints', () => {
      const criticalApis = [
        'src/app/api/booking/create-booking-simple/route.ts',
        'src/app/api/booking/estimate-fare/route.ts',
        'src/app/api/booking/check-time-slot/route.ts',
      ];

      criticalApis.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(() => readFileSync(filePath, 'utf8')).not.toThrow();
      });
    });

    it('should have critical business logic', () => {
      const criticalServices = [
        'src/lib/services/booking-service.ts',
        'src/lib/validation/booking-validation.ts',
        'src/lib/utils/utils.ts',
      ];

      criticalServices.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(() => readFileSync(filePath, 'utf8')).not.toThrow();
      });
    });
  });

  describe('Environment Setup', () => {
    it('should have environment configuration', () => {
      const envFiles = [
        '.env.local',
        '.env.example',
      ];

      // Check if at least one env file exists
      const hasEnvFile = envFiles.some(file => {
        try {
          readFileSync(path.join(projectRoot, file), 'utf8');
          return true;
        } catch {
          return false;
        }
      });

      expect(hasEnvFile).toBe(true);
    });
  });

  describe('Test Infrastructure', () => {
    it('should have test configuration', () => {
      const testFiles = [
        'tests/setup.ts',
        'tests/unit/booking-validation.test.ts',
        'tests/unit/lib/utils.test.ts',
        'tests/unit/lib/notification-service.test.ts',
      ];

      testFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        expect(() => readFileSync(filePath, 'utf8')).not.toThrow();
      });
    });
  });
}); 