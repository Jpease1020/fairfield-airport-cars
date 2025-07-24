# Multi-Agent Orchestration Guide

## 🎯 **Overview**

The Multi-Agent Orchestration System coordinates 6 specialized agents to work in parallel on different aspects of the Fairfield Airport Cars application. This allows you to test multiple critical areas simultaneously, dramatically reducing testing time.

---

## 🤖 **Available Agents**

### **1. Booking Specialist**
- **Focus:** Booking system optimization, customer journey improvement
- **Tasks:** Form validation, fare calculation, autocomplete testing
- **Script:** `scripts/test-booking-flow.js`

### **2. Payment Engineer**
- **Focus:** Payment processing, Square integration, webhook handling
- **Tasks:** Square Checkout testing, payment confirmation, refund process
- **Script:** `scripts/verify-booking.js`

### **3. Communication Manager**
- **Focus:** Email/SMS notifications, template management
- **Tasks:** Email delivery testing, SMS notifications, template rendering
- **Script:** `scripts/manual-booking-test.js`

### **4. Admin Dashboard Developer**
- **Focus:** Admin interface, booking management, analytics
- **Tasks:** Admin authentication, booking management, dashboard testing
- **Script:** `scripts/comprehensive-flow-test.js`

### **5. QA Tester**
- **Focus:** End-to-end testing, customer journey validation
- **Tasks:** E2E tests, mobile testing, error handling validation
- **Script:** `scripts/run-tests.js`

### **6. Business Analyst**
- **Focus:** Business process optimization, performance metrics
- **Tasks:** Status analysis, performance reporting, gap identification
- **Script:** `scripts/daily-analysis.js`

---

## 🚀 **Quick Start**

### **Option 1: Using the Launcher Script**
```bash
# Test critical gaps (payment, email, admin) in parallel
./scripts/launch-agents.sh critical-gaps parallel

# Run comprehensive testing with 4 agents
./scripts/launch-agents.sh comprehensive

# Full system test with all 6 agents
./scripts/launch-agents.sh full-system sequential
```

### **Option 2: Direct Node.js Execution**
```bash
# Test critical gaps
node scripts/orchestrate-agents.js critical-gaps parallel

# Business analysis
node scripts/orchestrate-agents.js business-analysis sequential
```

### **Option 3: Demo Mode**
```bash
# Run a demonstration
node scripts/demo-orchestration.js
```

---

## 📋 **Orchestration Scenarios**

### **1. Critical Gaps (3 Agents)**
**Purpose:** Test the most critical areas blocking revenue
- **Payment Engineer** - Test Square integration
- **Communication Manager** - Test email/SMS delivery  
- **Admin Dashboard Developer** - Test admin interface

**Use Case:** When you need to quickly verify the core business functionality

### **2. Comprehensive Testing (4 Agents)**
**Purpose:** Thorough testing of customer-facing features
- **QA Tester** - Run E2E tests
- **Booking Specialist** - Test booking flow
- **Payment Engineer** - Test payment processing
- **Communication Manager** - Test notifications

**Use Case:** Before launching new features or after major changes

### **3. Business Analysis (2 Agents)**
**Purpose:** Analyze current status and performance
- **Business Analyst** - Generate status report
- **QA Tester** - Validate current functionality

**Use Case:** Weekly status reviews or performance analysis

### **4. Full System (6 Agents)**
**Purpose:** Complete system validation
- All 6 agents working together
- Maximum coverage and testing

**Use Case:** Major releases or comprehensive validation

---

## ⚡ **Execution Modes**

### **Parallel Mode**
- **Agents run simultaneously**
- **Faster execution** (all tasks run at once)
- **Resource intensive** (multiple processes)
- **Best for:** Quick testing, when you have good system resources

### **Sequential Mode**
- **Agents run one after another**
- **Slower execution** (tasks run in sequence)
- **Resource efficient** (one process at a time)
- **Best for:** Resource-constrained environments, detailed debugging

---

## 📊 **Example Output**

```
🎯 Running scenario: critical-gaps in parallel mode

🚀 Starting Payment Engineer on task: Test Square Checkout integration
🚀 Starting Communication Manager on task: Test email confirmation delivery
🚀 Starting Admin Dashboard Developer on task: Test admin authentication

[Payment Engineer] Testing Square Checkout integration...
[Communication Manager] Testing email confirmation delivery...
[Admin Dashboard Developer] Testing admin authentication...

✅ Payment Engineer completed task in 2341ms
✅ Communication Manager completed task in 1892ms
❌ Admin Dashboard Developer failed with code 1

📊 Multi-Agent Results Summary
==================================================
✅ Payment Engineer: SUCCESS
✅ Communication Manager: SUCCESS
❌ Admin Dashboard Developer: FAILED

📋 Multi-Agent Orchestration Report
==================================================
⏱️  Total Duration: 2456ms
✅ Successful Agents: 2/3
📊 Success Rate: 66.7%

📈 Agent Performance:
✅ Payment Engineer: 2341ms
✅ Communication Manager: 1892ms
❌ Admin Dashboard Developer: N/A
```

---

## 🛠️ **Customization**

### **Adding New Agents**
1. **Define the agent** in `scripts/orchestrate-agents.js`:
```javascript
'New Agent': {
  role: 'Description of what this agent does',
  capabilities: ['capability1', 'capability2'],
  focus: 'agent-focus',
  tasks: [
    'Task 1 description',
    'Task 2 description'
  ]
}
```

2. **Add script mapping**:
```javascript
const scriptMap = {
  'agent-focus': 'scripts/your-new-script.js',
  // ... existing mappings
};
```

3. **Create the agent script** in `scripts/`

### **Creating Custom Scenarios**
Add to `ORCHESTRATION_SCENARIOS`:
```javascript
'custom-scenario': [
  { agent: 'Agent Name', taskIndex: 0 },
  { agent: 'Another Agent', taskIndex: 1 }
]
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Development Server Not Running**
```bash
# Start the dev server first
npm run dev

# Then run orchestration
./scripts/launch-agents.sh critical-gaps
```

#### **2. Agent Script Not Found**
- Check that the script exists in `scripts/`
- Verify the script mapping in `orchestrate-agents.js`
- Ensure the script is executable

#### **3. Process Hanging**
```bash
# Kill hanging processes
node scripts/quick-kill.js

# Or manually kill
pkill -f "node scripts"
```

#### **4. Resource Issues**
- Use sequential mode instead of parallel
- Reduce the number of agents in the scenario
- Close other applications to free up resources

### **Debug Mode**
```bash
# Run with verbose output
DEBUG=* node scripts/orchestrate-agents.js critical-gaps
```

---

## 📈 **Performance Optimization**

### **Best Practices**
1. **Use parallel mode** for quick testing
2. **Use sequential mode** for detailed debugging
3. **Start with critical-gaps** for quick validation
4. **Use full-system** only for major releases

### **Resource Management**
- **Parallel mode:** Requires more CPU/memory
- **Sequential mode:** More efficient for limited resources
- **Monitor system resources** during execution

---

## 🎯 **Integration with Existing Workflow**

### **Daily Development**
```bash
# Quick validation before commits
./scripts/launch-agents.sh critical-gaps parallel

# Comprehensive testing before releases
./scripts/launch-agents.sh comprehensive sequential
```

### **CI/CD Integration**
```bash
# Add to your CI pipeline
node scripts/orchestrate-agents.js critical-gaps parallel
```

### **Scheduled Testing**
```bash
# Add to cron for daily testing
0 2 * * * cd /path/to/project && ./scripts/launch-agents.sh business-analysis
```

---

## 📞 **Support**

### **Getting Help**
- Check the script output for error messages
- Verify all required scripts exist
- Ensure the development server is running
- Check system resources

### **Extending the System**
- Add new agents for specific testing needs
- Create custom scenarios for your workflow
- Integrate with your existing testing tools

---

*Last Updated: July 23, 2024*
*Version: 1.0* 