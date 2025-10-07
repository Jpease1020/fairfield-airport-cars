# 📚 Business Documentation - Fairfield Airport Cars

## For Gregg (Non-Technical)

This section contains plain-English explanations of how our booking system works. Everything here is automatically kept up-to-date with our current settings and code.

### 📖 What's Here

- **[Pricing & Fare Calculation](./pricing.md)** - How we calculate ride costs
- **[Booking Flow](./booking-flow.md)** - What happens when someone books a ride
- **[Cancellations & Refunds](./cancellations.md)** - Our refund policy and how it works
- **[Notifications](./notifications.md)** - When we send emails and texts to customers

### 🔄 How This Works

- These docs are automatically generated from our system settings
- When we change pricing or rules, the docs update automatically
- You can see current numbers and examples on every page
- If something looks wrong, you can propose changes using the "Propose a Change" button

### 💡 Proposing Changes

If you want to change how something works:

1. Click "Propose a Change" on any doc page
2. Fill out the form with what you want to change and why
3. We'll review it and implement if it makes sense
4. The docs will update automatically once we make the change

### 📱 Access

- **Online**: Visit our docs site (password protected)
- **In-App**: Go to Admin → Docs (if you have admin access)

---

## For Developers

This documentation is generated from:
- Zod contracts in `src/lib/contracts/**`
- CMS settings via `cmsFlattenedService`
- Mermaid diagrams for visual flows

### Regeneration

```bash
npm run docs:build    # Generate docs from contracts
npm run docs:check    # Verify docs are in sync
```

### Adding New Business Logic

1. Add Zod contract to `src/lib/contracts/**`
2. Update docs generator in `scripts/docs/build-business-docs.ts`
3. Run `npm run docs:build` and commit changes

### Architecture

See [Business Logic Interface Plan](../architecture/BUSINESS_LOGIC_INTERFACE_PLAN.md) for full implementation details.
