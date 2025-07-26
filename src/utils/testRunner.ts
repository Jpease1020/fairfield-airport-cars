import { FeatureTest } from '../hooks/useBrowserFeatures';

export interface TestRunnerOptions {
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export async function runTest(test: FeatureTest, options: TestRunnerOptions): Promise<boolean> {
  const { showToast } = options;
  
  try {
    const result = await test.test();
    
    if (result) {
      showToast('success', test.successMessage);
      if (test.action) {
        await test.action();
      }
      return true;
    } else {
      showToast('error', test.errorMessage);
      return false;
    }
  } catch (error) {
    console.error(`Test ${test.name} failed:`, error);
    showToast('error', test.errorMessage);
    return false;
  }
}

export function createTestRunner(options: TestRunnerOptions) {
  return {
    run: (test: FeatureTest) => runTest(test, options),
    runMultiple: async (tests: FeatureTest[]) => {
      const results = await Promise.allSettled(
        tests.map(test => runTest(test, options))
      );
      
      const successes = results.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;
      
      const failures = results.length - successes;
      
      if (failures === 0) {
        options.showToast('success', `All ${tests.length} tests passed!`);
      } else if (successes === 0) {
        options.showToast('error', `All ${tests.length} tests failed.`);
      } else {
        options.showToast('warning', `${successes} passed, ${failures} failed.`);
      }
      
      return { successes, failures, total: tests.length };
    }
  };
} 