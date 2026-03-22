# JWMJ Community Management System

A comprehensive digital platform for the Jamnagar Wehvaria Memon Jamat (JWMJ) and Jamnagar Wehvaria Memon Youth Organization (JWMYO) community. Built with Next.js 15, Prisma ORM, MySQL, and modern React components.

## 🌟 Overview

This application serves as a complete digital ecosystem for community management, featuring:

- **Public Website**: Community information, events, and services
- **Member Portal**: Personalized dashboard for registered members
- **Admin Dashboard**: Comprehensive management tools for administrators
- **Event Management**: Full event lifecycle from creation to registration
- **Form Builder**: Dynamic forms for applications and submissions
- **Business Directory**: Community business listings and advertisements
- **Database Sync**: Automated synchronization with legacy SQL Server systems

## 🚀 Features

### Public Website Features

- **Responsive Design**: Mobile-first design optimized for all devices
- **Hero Section**: Dynamic community branding with service highlights
- **Presidency Showcase**: JWMJ and JWMYO leadership team presentations
- **Community Businesses**: Directory of member-owned businesses with discounts
- **Event Listings**: Public event calendar with registration capabilities
- **About Pages**: Detailed information about JWMJ, JWMYO, aims, vision, and history
- **Contact & Support**: Contact forms and community support information

### Member Portal Features

#### Dashboard
- **Personal Profile**: Complete member information display
- **Fee Status**: Annual fee tracking and payment history
- **Family Tree**: Interactive family relationship visualization
- **Quick Actions**: Fast access to common member functions

#### Event Management
- **Event Registration**: Register for community events
- **Registration History**: Track past and upcoming event registrations
- **Family Registration**: Register entire family units for events

#### Applications & Forms
- **Dynamic Forms**: Submit various community applications
- **Application Tracking**: Monitor submission status and approvals
- **Document Upload**: Attach supporting documents to applications

#### Business Directory
- **Browse Businesses**: View community business listings
- **Member Discounts**: Access special pricing for verified members
- **Business Ads**: View promotional advertisements

### Admin Dashboard Features

#### User Management
- **Member Administration**: Manage member accounts and profiles
- **Role Management**: Assign admin, moderator, and member roles
- **Bulk Operations**: Import/export member data

#### Event Management
- **Event Creation**: Create and publish community events
- **Registration Management**: Approve/reject event registrations
- **Event Analytics**: Track registration statistics and attendance

#### Form Builder
- **Dynamic Form Creation**: Build custom forms with drag-and-drop
- **Field Types**: Text, email, phone, file upload, dropdown, radio, checkbox
- **Form Templates**: Save and reuse form configurations
- **PDF Generation**: Automatic PDF form generation

#### Submission Management
- **Review Submissions**: Approve/reject form submissions
- **Document Management**: Handle uploaded files and attachments
- **Audit Trail**: Complete history of all submission changes

#### Business Ads Management
- **Ad Approval**: Review and approve business advertisements
- **Ad Management**: Create, edit, and remove business listings
- **Analytics**: Track ad performance and engagement

#### System Administration
- **Audit Logs**: Comprehensive activity logging
- **Settings Management**: Configure system preferences
- **Email Templates**: Customize notification emails

### Technical Features

#### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Password Reset**: Secure password recovery flow
- **Email Verification**: Account verification system
- **Rate Limiting**: API protection against abuse

#### Database Integration
- **Prisma ORM**: Type-safe database operations
- **MySQL Support**: Primary database with legacy SQL Server sync
- **Data Migration**: Automated data synchronization tools
- **Backup & Recovery**: Database backup and restore capabilities

#### API Architecture
- **RESTful APIs**: Well-structured API endpoints
- **File Upload**: Secure file handling with validation
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error management

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization components

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database toolkit and query builder
- **MySQL**: Primary database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Nodemailer**: Email sending

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Prisma Studio**: Database management GUI
- **tsx**: TypeScript execution

## 📋 Prerequisites

- **Node.js 18+**: JavaScript runtime
- **MySQL 8.0+**: Database server
- **npm or yarn**: Package manager
- **Git**: Version control

### Optional (for full functionality)
- **SQL Server**: For legacy data synchronization
- **Email SMTP**: For sending notifications
- **File Storage**: For document uploads

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd jwmj-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/jwmj_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@jwmj.org"

# File Upload (optional)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Admin Setup
ADMIN_EMAIL="admin@jwmj.org"
ADMIN_PASSWORD="secure-admin-password"
```

### 4. Database Setup

#### Initialize Database
```bash
# Push schema to database
npm run prisma

# Generate Prisma client
npx prisma generate
```

#### Create Admin User
```bash
npm run create-admin
```

#### Optional: Seed Sample Data
```bash
# Add sample events
node scripts/add-sample-events.ts

# Add sample business ads
node scripts/add-sample-business-ads.ts
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 Usage Guide

### For Members

#### Getting Started
1. **Register**: Visit `/member/register` to create an account
2. **Verify Email**: Check your email for verification code
3. **Login**: Access your dashboard at `/member`

#### Using the Member Portal
- **Dashboard**: View your profile, fee status, and quick actions
- **Events**: Browse and register for community events
- **Family Tree**: Explore your family connections
- **Applications**: Submit forms for various community services
- **Business Directory**: Find member businesses and discounts

### For Administrators

#### Admin Login
1. Navigate to `/admin/login`
2. Use admin credentials created during setup

#### Key Admin Tasks

##### Managing Events
1. Go to **Events** section in admin dashboard
2. Click **"Create Event"** to add new events
3. Set event details: title, description, date, venue, category
4. Upload event image and set Facebook link (optional)
5. Review and approve member registrations

##### Form Builder
1. Navigate to **Form Builder** in admin panel
2. Click **"Create New Form"**
3. Add form fields: text, email, select, file upload, etc.
4. Configure validation rules and field requirements
5. Save and publish the form

##### Managing Submissions
1. Go to **Submissions** section
2. Review pending applications
3. Approve or reject submissions
4. Download attached documents
5. Add notes and track changes

##### Business Ads Management
1. Access **Business Ads** section
2. Review pending business listings
3. Approve or reject advertisements
4. Edit business information
5. Monitor ad performance

##### Member Management
1. Visit **Members** section
2. Search and filter member records
3. Update member information
4. Manage member status and roles
5. View member activity history

## 🔄 Data Synchronization

The system includes automated tools to sync with legacy SQL Server databases:

### Setup Database Sync
1. Install Python 3.12+ and required packages:
```bash
pip install -r sync/requirements.txt
```

2. Configure sync settings in `sync/sync_config.json`:
```json
{
  "sql_server": {
    "server": "your-sql-server",
    "database": "legacy_db",
    "username": "sync_user",
    "password": "sync_password"
  },
  "mysql": {
    "host": "localhost",
    "database": "jwmj_db",
    "username": "mysql_user",
    "password": "mysql_password"
  },
  "tables": ["Member_Information", "Events", "Donations"],
  "sync_mode": "mirror"
}
```

3. Run synchronization:
```bash
python sync/mysql_sync.py
```

### Sync Modes
- **Mirror**: Full synchronization (insert, update, delete)
- **Replace**: Truncate and reload all data
- **Insert Only**: Add new records only

## 📊 API Reference

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Member Endpoints
- `GET /api/member/profile` - Get member profile
- `PUT /api/member/profile` - Update member profile
- `GET /api/member/fees` - Get fee information
- `GET /api/member/family` - Get family tree data

### Event Endpoints
- `GET /api/events` - List all events
- `GET /api/events/[id]` - Get specific event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/[id]` - Update event (admin)
- `DELETE /api/events/[id]` - Delete event (admin)

### Form Endpoints
- `GET /api/forms` - List available forms
- `GET /api/forms/[id]` - Get form details
- `POST /api/forms` - Create form (admin)
- `POST /api/submissions` - Submit form data
- `GET /api/submissions` - List submissions (admin)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `SMTP_HOST` | Email SMTP host | No |
| `SMTP_USER` | Email username | No |
| `SMTP_PASS` | Email password | No |
| `UPLOAD_DIR` | File upload directory | No |
| `MAX_FILE_SIZE` | Maximum upload size | No |

### Database Configuration

The system uses Prisma ORM with the following key models:
- `User`: Admin and member accounts
- `Event`: Community events
- `EventRegistration`: Event sign-ups
- `Form`: Dynamic forms
- `FormSubmission`: Form responses
- `Member_Information`: Legacy member data

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Configure production database
- Set up SSL certificates
- Configure reverse proxy (nginx recommended)
- Set up file storage (AWS S3, local filesystem, etc.)

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```
Error: Can't connect to MySQL server
```
**Solution**: Check `DATABASE_URL` in `.env` and ensure MySQL server is running.

#### Prisma Issues
```
Error: P1001: Can't reach database server
```
**Solution**: Run `npx prisma db push` to sync schema.

#### Email Not Sending
```
Error: Invalid login
```
**Solution**: Verify SMTP credentials in `.env` file.

#### File Upload Issues
```
Error: ENOENT: no such file or directory
```
**Solution**: Create upload directory and set proper permissions.

### Logs and Debugging
- Check `sync/sync_log.txt` for sync operation logs
- Use browser dev tools for frontend debugging
- Check server logs in production environment
- Use `npx prisma studio` for database inspection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and create a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Test all features before submitting
- Update documentation for new features

## 📄 License

This project is proprietary software for JWMJ community use.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

## 🔄 Changelog

### Version 0.1.0
- Initial release with core features
- Member portal and admin dashboard
- Event management system
- Dynamic form builder
- Database synchronization tools
- Responsive design implementation

---

**Built with ❤️ for the JWMJ Community**

## Notes

- Keep `public/uploads/pdfs` for static downloads.
- Update `next.config.ts` when adding new resource types.
- Keep `.gitignore` clean for local secrets.

