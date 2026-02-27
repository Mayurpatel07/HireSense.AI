import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import { hashPassword } from '../utils/auth';

dotenv.config();

/**
 * Seed database with sample data
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiresenseai';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await hashPassword('Mayur@123');
    const admin = await User.create({
      name: 'Admin User',
      email: 'mayur@admin.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
    });
    console.log('👨‍💼 Admin created:', admin.email);

    // Create company users
    const companyPassword = await hashPassword('company123');
    const companies = await User.insertMany([
      {
        name: 'Tech Innovations Inc',
        email: 'hr@techinnovations.com',
        password: companyPassword,
        role: 'company',
        avatar: 'https://via.placeholder.com/100?text=TechInnovations',
        bio: 'Leading technology solutions provider',
        isVerified: true,
      },
      {
        name: 'Digital Solutions Ltd',
        email: 'jobs@digitalsolutions.com',
        password: companyPassword,
        role: 'company',
        avatar: 'https://via.placeholder.com/100?text=DigitalSolutions',
        bio: 'Innovating digital transformation',
        isVerified: true,
      },
      {
        name: 'Cloud Ventures',
        email: 'careers@cloudventures.com',
        password: companyPassword,
        role: 'company',
        avatar: 'https://via.placeholder.com/100?text=CloudVentures',
        bio: 'Cloud-first technology company',
        isVerified: true,
      },
    ]);
    console.log('🏢 Created', companies.length, 'companies');

    // Create job seeker users
    const userPassword = await hashPassword('user123');
    const jobSeekers = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        phone: '+1234567890',
        location: 'New York, NY',
        bio: 'Full-stack developer with 5 years experience',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        experience: 5,
        isVerified: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        phone: '+1234567891',
        location: 'San Francisco, CA',
        bio: 'Senior frontend developer',
        skills: ['TypeScript', 'React', 'Next.js', 'TailwindCSS', 'GraphQL'],
        experience: 7,
        isVerified: true,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: userPassword,
        role: 'user',
        phone: '+1234567892',
        location: 'Austin, TX',
        bio: 'DevOps and cloud infrastructure specialist',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        experience: 6,
        isVerified: true,
      },
    ]);
    console.log('👤 Created', jobSeekers.length, 'job seekers');

    // Create job postings
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 30);

    const jobs = await Job.insertMany([
      {
        title: 'Senior Full-Stack Developer',
        description:
          'We are looking for an experienced full-stack developer to join our growing team. You will work on cutting-edge technologies and have the opportunity to lead technical projects.',
        requirements: [
          '5+ years of professional development experience',
          'Proficiency in React and Node.js',
          'Strong understanding of MongoDB',
          'Experience with REST APIs',
          'Excellent problem-solving skills',
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'REST API'],
        salary: { min: 120000, max: 160000, currency: 'INR' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        location: 'New York, NY',
        workplaceType: 'hybrid',
        company: 'Tech Innovations Inc',
        companyId: companies[0]._id,
        applicationDeadline: deadlineDate,
        status: 'published',
        approvedBy: admin._id,
        views: 324,
        featured: true,
      },
      {
        title: 'React Developer',
        description:
          'Join our frontend team to build beautiful and responsive user interfaces. We use modern tech stack and follow best practices in code quality and testing.',
        requirements: [
          '3+ years with React',
          'CSS/Tailwind expertise',
          'Redux or Context API knowledge',
          'Testing experience (Jest/RTL)',
        ],
        skills: ['React', 'JavaScript', 'TailwindCSS', 'TypeScript', 'Testing'],
        salary: { min: 90000, max: 130000, currency: 'INR' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        location: 'San Francisco, CA',
        workplaceType: 'remote',
        company: 'Digital Solutions Ltd',
        companyId: companies[1]._id,
        applicationDeadline: deadlineDate,
        status: 'published',
        approvedBy: admin._id,
        views: 215,
        featured: false,
      },
      {
        title: 'DevOps Engineer',
        description:
          'Help us build and maintain our cloud infrastructure. We use AWS, Docker, and Kubernetes to power our platform. You will have the autonomy to improve our deployment processes.',
        requirements: [
          'AWS or GCP certification preferred',
          'Docker and Kubernetes expertise',
          'CI/CD pipeline experience',
          'Infrastructure as Code knowledge',
          'Linux administration',
        ],
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
        salary: { min: 110000, max: 150000, currency: 'INR' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        location: 'Austin, TX',
        workplaceType: 'remote',
        company: 'Cloud Ventures',
        companyId: companies[2]._id,
        applicationDeadline: deadlineDate,
        status: 'published',
        approvedBy: admin._id,
        views: 189,
        featured: true,
      },
      {
        title: 'Junior Backend Developer',
        description:
          'Start your career with us! We are looking for enthusiastic junior developers to join our backend team. We provide mentorship and opportunities to grow.',
        requirements: [
          'Strong fundamentals in programming',
          'Knowledge of Node.js or Python',
          'Basic understanding of databases',
          'Git version control',
          'Problem-solving mindset',
        ],
        skills: ['Node.js', 'Python', 'JavaScript', 'SQL', 'REST API'],
        salary: { min: 60000, max: 80000, currency: 'INR' },
        jobType: 'full-time',
        experienceLevel: 'entry',
        location: 'Remote',
        workplaceType: 'remote',
        company: 'Tech Innovations Inc',
        companyId: companies[0]._id,
        applicationDeadline: deadlineDate,
        status: 'published',
        approvedBy: admin._id,
        views: 445,
        featured: false,
      },
      {
        title: 'Full-Stack Developer (Contract)',
        description: 'We need a contractor for a 3-month project building a customer portal with React and Node.js.',
        requirements: ['React expertise', 'Node.js experience', 'Fast execution', 'Communication skills'],
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        salary: { min: 80, max: 120, currency: 'INR/hour' },
        jobType: 'contract',
        experienceLevel: 'mid',
        location: 'Remote',
        workplaceType: 'remote',
        company: 'Digital Solutions Ltd',
        companyId: companies[1]._id,
        applicationDeadline: deadlineDate,
        status: 'published',
        approvedBy: admin._id,
        views: 127,
        featured: false,
      },
    ]);
    console.log('💼 Created', jobs.length, 'jobs');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: mayur@admin.com / Mayur@123');
    console.log('Company: hr@techinnovations.com / company123');
    console.log('User: john@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
