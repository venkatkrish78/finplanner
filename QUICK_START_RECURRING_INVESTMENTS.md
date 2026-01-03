# Quick Start Guide - Recurring Investments Feature

## 🚀 Getting Started in 5 Minutes

### Step 1: Setup Database with Demo Data

```bash
cd /home/ubuntu/finplanner/app

# Reset database and seed with demo data
npx prisma db push --force-reset
npx prisma db seed

# Start the development server
npm run dev
```

### Step 2: Login

- **URL**: http://localhost:3000
- **Email**: demo@finplanner.com
- **Password**: password123

### Step 3: Explore the Features

#### 📊 View Recurring SIPs

1. Navigate to **Investments** tab
2. Click **"Recurring SIPs"** tab
3. See 5 demo SIPs with different types and frequencies

**What to Check**:
- ✓ Summary cards show correct totals
- ✓ Table displays all SIP details
- ✓ Status badges are color-coded
- ✓ Actions buttons (Pause/Resume, Delete) are present

#### ➕ Create a New SIP

1. Click **"Start SIP"** button (emerald, top-right)
2. Fill in the form:
   - **Name**: "Test SIP Fund"
   - **Type**: "Mutual Fund SIP"
   - **Platform**: "Groww"
   - **Amount**: 3000
   - **Frequency**: "Monthly"
   - **Unit Price**: 100
   - **Start Date**: Today's date
3. Click **"Create Recurring Investment"**

**Expected Result**:
- ✓ Success message appears
- ✓ "Bill auto-generated" notification shows
- ✓ New SIP appears in table
- ✓ Units auto-calculated (30 units)

#### 💳 View SIP Bills

1. Navigate to **Bills** tab
2. Click **"SIP Bills Only"** button
3. View only investment-linked bills

**What to Check**:
- ✓ 5 SIP bills visible
- ✓ All show "Investment" category
- ✓ Amounts match SIP amounts
- ✓ Next due dates are shown

#### 💰 Pay a SIP Bill

1. In Bills tab, switch to **"Monthly View"**
2. Select **January 2026**
3. Find **"Kotak Equity Opportunities Fund - SIP"** (due Jan 15)
4. Click **"Mark Paid"**
5. Enter:
   - Amount: 7500
   - Reference: UPI-TEST
   - Enable "Create Transaction"
6. Click **"Mark as Paid"**

**Expected Result**:
- ✓ Bill marked as paid
- ✓ Success toast appears
- ✓ Go to Investments → Recurring SIPs tab
- ✓ Kotak fund units should increase
- ✓ Current value should increase by ₹7500

#### 📈 Dashboard Metric

1. Navigate to **Dashboard**
2. Find **"Upcoming SIPs"** card (top row)

**What to Check**:
- ✓ Shows count of upcoming SIPs
- ✓ Shows total amount due
- ✓ Clicking "View SIP bills" → Bills tab with filter

#### ⏸️ Pause a SIP

1. Go to Investments → Recurring SIPs
2. Click **Pause** button on any SIP
3. Observe status change to "PAUSED"
4. Click **Play** button to resume

**Expected Result**:
- ✓ Status toggles correctly
- ✓ Toast notifications appear

---

## 📋 Demo Data Included

The seed script creates:

| SIP Name | Type | Amount | Frequency | Units | Current Value |
|----------|------|--------|-----------|-------|---------------|
| SBI Bluechip Fund | Mutual Fund | ₹5,000 | Monthly | 33.33 | ₹5,165 |
| ICICI Prudential Equity | ELSS | ₹10,000 | Monthly | 66.67 | ₹10,533 |
| HDFC Bank RD | RD | ₹1,000 | Monthly | 3,000 | ₹3,000 |
| Axis Long Term Equity | ELSS | ₹20,000 | Quarterly | 133.33 | ₹21,333 |
| Kotak Equity Fund | Mutual Fund | ₹7,500 | Monthly | 50 | ₹7,600 |

**Total Monthly Investment**: ₹23,500  
**Total Portfolio Value**: ₹47,631

---

## 🔍 Key Features to Test

### ✅ Feature Checklist

- [ ] View all SIPs in Recurring SIPs tab
- [ ] Create a new SIP
- [ ] View auto-generated bill
- [ ] Filter SIP bills in Bills tab
- [ ] Mark SIP bill as paid
- [ ] Verify investment units updated
- [ ] Check dashboard metric
- [ ] Pause a SIP
- [ ] Resume a SIP
- [ ] Delete a SIP
- [ ] View summary metrics

---

## 🎯 What to Look For

### UI/UX
- ✓ Emerald color scheme for SIP actions
- ✓ Consistent styling with existing components
- ✓ Responsive design on mobile/tablet
- ✓ Smooth animations and transitions
- ✓ Clear status indicators

### Functionality
- ✓ Auto-calculation of units from amount/price
- ✓ Bills auto-created on SIP creation
- ✓ Investment updates on bill payment
- ✓ Filter works across all bill views
- ✓ Status changes persist

### Data Integrity
- ✓ Units calculation is accurate
- ✓ Values update correctly
- ✓ Average price recalculates
- ✓ Next due dates roll forward
- ✓ Transaction creation optional

---

## 🐛 Common Issues & Solutions

### Issue: Bills don't show in SIP filter

**Check**:
1. Bill has `linkedInvestmentId` set
2. Filter button is clicked (emerald = active)
3. Browser console for errors

### Issue: Units not updating on payment

**Check**:
1. Investment has `currentPrice` or `averagePrice` > 0
2. Payment completes without errors
3. API response shows updated values

### Issue: Dashboard metric shows 0

**Check**:
1. Bills have `nextDueDate` within next 30 days
2. Bills are `isActive = true`
3. At least one bill has `linkedInvestmentId`

---

## 📱 Mobile Testing

Test on different screen sizes:

- **Desktop** (1920x1080): All features visible
- **Tablet** (768x1024): Responsive grid layouts
- **Mobile** (375x667): Stacked layouts, drawer menus

---

## 🔄 Testing Workflow

### Complete Test Path (15 minutes)

1. **Login** (1 min)
2. **View Demo SIPs** (2 min)
3. **Create New SIP** (3 min)
4. **View Dashboard Metric** (1 min)
5. **Filter Bills** (2 min)
6. **Pay a Bill** (3 min)
7. **Verify Investment Update** (2 min)
8. **Pause/Resume SIP** (1 min)

---

## 📊 Expected Test Results

After following this guide, you should have:

- ✓ 6 total SIPs (5 demo + 1 created)
- ✓ 6 SIP bills in Bills tab
- ✓ 1 paid SIP bill (Kotak fund)
- ✓ Updated investment with increased units
- ✓ Dashboard showing correct upcoming SIPs
- ✓ At least 1 paused SIP

---

## 📞 Need Help?

Refer to the comprehensive documentation:
- **Full Documentation**: `/home/ubuntu/finplanner/RECURRING_INVESTMENTS_FEATURE.md`
- **API Reference**: See Section 13 in full docs
- **Troubleshooting**: See Section 12 in full docs

---

## 🎉 Success Criteria

Your implementation is working correctly if:

1. ✅ All demo SIPs load without errors
2. ✅ New SIP creation works end-to-end
3. ✅ Bills are auto-generated
4. ✅ Payment updates investment correctly
5. ✅ Dashboard metric is accurate
6. ✅ Filter works in all bill views
7. ✅ Status management (Pause/Resume) works
8. ✅ UI matches existing design patterns

---

**Happy Testing! 🚀**

*Last Updated: January 3, 2026*
