# Premium Personal Finance Tracker - Specification

## Project Overview
- **Project Name**: Premium Personal Finance Tracker
- **Type**: Full-stack MERN Web Application
- **Core Functionality**: A 2-page personal finance tracker with daily transaction CRUD and annual financial summaries
- **Target Users**: Individuals tracking personal income and expenses

## Technical Stack
- **Frontend**: React 18, Tailwind CSS, Axios, Lucide React Icons
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Joi
- **Password Hashing**: Bcryptjs

## UI/UX Specification

### Color Palette
```
Background: Slate-50 (#F8FAFC)
Primary: Indigo-600 (#4F46E5)
Primary Hover: Indigo-700 (#4338CA)
Income: Emerald-500 (#10B981)
Expense: Rose-500 (#F43F5E)
Text Primary: Slate-900 (#0F172A)
Text Secondary: Slate-500 (#64748B)
Card Background: rgba(255, 255, 255, 0.7) - Glassmorphic
Border: rgba(148, 163, 184, 0.2)
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, leading-relaxed

### Layout Structure
- **Max Width**: 1280px centered
- **Padding**: 24px on container
- **Card Border Radius**: 24px (rounded-3xl)
- **Button Border Radius**: 12px (rounded-xl)

### Glassmorphic Style
- Background: rgba(255, 255, 255, 0.7)
- Backdrop Filter: blur(12px)
- Border: 1px solid rgba(148, 163, 184, 0.2)
- Box Shadow: 0 8px 32px rgba(0, 0, 0, 0.08)

## Pages Specification

### Page 0: Login Page
**Route**: `/login`

**Layout**:
- Centered card on Slate-50 background
- Minimalist fintech design
- Logo at top
- Email input field
- Password input field
- Login button (full width, Indigo-600)
- Subtle glassmorphic card

**Validation**:
- Email: required, valid email format
- Password: required, min 6 characters

### Page 1: Daily Transactions
**Route**: `/transactions`

**Components**:

1. **Header Bar**
   - Logo/App name on left
   - Navigation tabs: "Transactions" | "Annual Summary"
   - Logout button on right

2. **Balance Card** (Top)
   - Glassmorphic card
   - Current balance (large, bold)
   - Format: Currency with thousand separators
   - Green if positive, Rose if negative

3. **Add Transaction Form**
   - Date picker (default: today)
   - Description input (text)
   - Amount input (number, positive)
   - Type dropdown (Income/Expense)
   - Category dropdown based on type
   - Submit button (Indigo-600)

4. **Transaction List**
   - Card-based layout
   - Each card shows: Date, Description, Amount, Type badge, Category
   - Action icons: Edit (pencil), Delete (trash)
   - Scrollable if many items

**Categories**:
- Income: Salary, Freelance, Investment, Gift, Other
- Expense: Rent, Food, Transport, Utilities, Entertainment, Shopping, Healthcare, Other

**CRUD Functionality**:
- Create: Add new transaction
- Read: View all transactions
- Update: Edit existing transaction (populate form)
- Delete: Remove transaction (with confirmation)

### Page 2: Annual Summary
**Route**: `/summary`

**Layout**:
- Same header as Page 1

**Table**:
- 12 rows (January to December)
- Columns: Month | Total Income | Total Expenses | Net Savings/Flow
- Color coding: Green for positive, Red for negative
- Bottom row: Grand Total

**Data Source**:
- MongoDB Aggregation Pipeline
- Filter by current year
- Group by month
- Calculate totals

## Backend API Specification

### Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user, return JWT

**Transactions**
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

**Summary**
- `GET /api/summary/:year` - Get annual summary (aggregation)

### Database Schemas

**User Schema**:
```javascript
{
  email: String (unique, required),
  password: String (hashed),
  createdAt: Date
}
```

**Transaction Schema**:
```javascript
{
  user: ObjectId (ref: User),
  date: Date (required),
  description: String (required),
  amount: Number (required, positive),
  type: String (enum: ['Income', 'Expense']),
  category: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Validation Rules (Joi)

**Register**:
- email: required, email
- password: required, min 6

**Login**:
- email: required, email
- password: required

**Transaction**:
- date: required, date
- description: required, min 1
- amount: required, positive number
- type: required, valid enum
- category: required

## Acceptance Criteria

1. User can register and login with JWT
2. Dashboard shows real-time balance
3. User can add, edit, delete transactions
4. Transaction list updates immediately
5. Annual summary shows accurate aggregation
6. Grand total calculates correctly
7. Responsive design works on mobile
8. Glassmorphic styling applied consistently
9. Color coding correct (green/red)
10. Form validation shows errors