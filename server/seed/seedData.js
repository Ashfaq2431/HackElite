const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Discussion = require('../models/Discussion');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Club.deleteMany(),
      Event.deleteMany(),
      Announcement.deleteMany(),
      Discussion.deleteMany(),
      Resource.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('Cleared existing data.');

    // 1. Create Users
    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'Dr. Arthur Vance',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Dean of Student Affairs',
      studentId: 'ADM-001',
      year: 'Administration',
      bio: 'Platform administrator overseeing campus governance, user management, and institutional activities.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      skills: ['Campus Administration', 'Policy Governance', 'Conflict Resolution'],
      interests: ['Higher Education', 'Community Building'],
      socialLinks: { linkedin: 'https://linkedin.com' },
    });

    const hodUser = await User.create({
      name: 'Dr. Raymond Holt',
      email: 'hod.cse@college.edu',
      password: 'Hod@123',
      role: 'hod',
      department: 'Computer Science & Engineering',
      studentId: 'HOD-CSE-01',
      year: 'Department Head',
      bio: 'Head of Department (CSE). Overseeing curriculum, department faculty, undergraduate research, and student progress.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
      skills: ['Department Leadership', 'Curriculum Design', 'Academic Administration', 'Distributed Systems'],
      interests: ['Computer Science Education', 'Industry Partnerships', 'Accreditation'],
      socialLinks: { linkedin: 'https://linkedin.com' },
    });

    const facultyUser = await User.create({
      name: 'Prof. Elena Rostova',
      email: 'faculty@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      studentId: 'FAC-CS-104',
      year: 'Associate Professor',
      bio: 'Associate Professor in CSE and faculty advisor for Google Developer Student Club. Research in AI & Cloud Computing.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      skills: ['Machine Learning', 'Cloud Computing', 'Research Mentorship', 'Curriculum Design'],
      interests: ['AI Ethics', 'Undergraduate Research', 'Hackathons'],
      socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
    });

    const faculty2 = await User.create({
      name: 'Dr. Vikram Sarabhai',
      email: 'fac.ece@college.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Electronics & Communication',
      studentId: 'FAC-EC-202',
      year: 'Professor',
      bio: 'Senior Professor in ECE department researching VLSI and embedded robotics.',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
      skills: ['VLSI', 'Signal Processing', 'Robotics'],
      interests: ['Satellite Tech', 'Microelectronics'],
    });

    const studentUser = await User.create({
      name: 'Aanya Sharma',
      email: 'student@college.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2024-CS042',
      year: '2nd Year',
      bio: 'Curious sophomore pursuing CSE with an interest in UI/UX design, mobile apps, and hackathons.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      skills: ['React', 'JavaScript', 'TailwindCSS', 'Python', 'Problem Solving'],
      interests: ['UI/UX Design', 'Web Dev', 'Badminton', 'Product Management'],
      achievements: [
        { title: 'Best UI Design Award - DesignSprint 2025', date: 'Nov 2025', description: 'Recognized for accessible mobile banking wireframe.' },
      ],
      socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    });

    const student2 = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@college.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2023-CS019',
      year: '3rd Year',
      bio: 'Software engineer and robotics enthusiast. Active member in GDSC and competitive coding.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      skills: ['SolidWorks', 'ROS 2', 'Arduino', 'Python', 'C++'],
      interests: ['Autonomous Vehicles', '3D Printing', 'Basketball'],
    });

    const student3 = await User.create({
      name: 'Priya Iyer',
      email: 'priya@college.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Electronics & Communication',
      studentId: 'STU-2024-EC112',
      year: '2nd Year',
      bio: 'Passionate about embedded systems, IoT sensors, and playing violin for the cultural club.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      skills: ['Verilog', 'Microcontrollers', 'Violin', 'Acoustic Guitar'],
      interests: ['Signal Processing', 'Orchestra', 'Photography'],
    });

    const clubLeadUser = studentUser; // Aanya is lead organizer of GDSC

    // 2. Create Clubs
    console.log('Seeding Clubs...');
    const gdscClub = await Club.create({
      name: 'Google Developer Student Club (GDSC)',
      category: 'Technology',
      description: 'University chapter powered by Google Developers for students interested in software development, machine learning, cloud, and mobile ecosystems.',
      mission: 'To bridge the gap between theory and industry practice through collaborative workshops, hackathons, and real-world project development.',
      logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
      lead: clubLeadUser._id,
      facultyInCharge: facultyUser._id,
      officers: [studentUser._id],
      members: [
        { user: clubLeadUser._id, role: 'lead', joinedAt: new Date('2025-08-01') },
        { user: studentUser._id, role: 'officer', joinedAt: new Date('2025-08-10') },
        { user: student2._id, role: 'member', joinedAt: new Date('2025-09-01') },
      ],
      meetingSchedule: 'Every Friday at 4:30 PM',
      venueOrRoom: 'Turing Hall, Tech Tower 3rd Floor',
      status: 'active',
      socialLinks: {
        github: 'https://github.com/campus-gdsc',
        linkedin: 'https://linkedin.com',
        discord: 'https://discord.gg/campus-gdsc',
      },
    });

    const roboticsClub = await Club.create({
      name: 'Robotics & Automation Society (RAS)',
      category: 'Technology',
      description: 'Hardware, microcontrollers, autonomous drones, and humanoid bots designed and manufactured entirely by campus engineers.',
      mission: 'To engineer intelligent robotic solutions for agriculture, healthcare, and interplanetary rover competitions.',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      lead: student2._id,
      facultyInCharge: faculty2._id,
      officers: [],
      members: [
        { user: student2._id, role: 'lead', joinedAt: new Date('2025-07-20') },
        { user: studentUser._id, role: 'member', joinedAt: new Date('2025-09-15') },
      ],
      meetingSchedule: 'Every Tuesday & Saturday at 5:00 PM',
      venueOrRoom: 'Makerspace Lab 04, Mechanical Wing',
      status: 'active',
      socialLinks: {
        instagram: 'https://instagram.com/campus_robotics',
        youtube: 'https://youtube.com',
      },
    });

    const musicClub = await Club.create({
      name: 'Crescendo Music & Arts Society',
      category: 'Cultural',
      description: 'The heartbeat of campus culture, bringing vocalists, instrumentalists, and composers together for jamming sessions and concerts.',
      mission: 'Uniting our diverse student community through musical harmony, stage performances, and original creative productions.',
      logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      lead: student3._id,
      facultyInCharge: facultyUser._id,
      members: [
        { user: student3._id, role: 'lead', joinedAt: new Date('2025-08-05') },
        { user: studentUser._id, role: 'member', joinedAt: new Date('2025-09-02') },
      ],
      meetingSchedule: 'Mon & Thurs at 6:00 PM',
      venueOrRoom: 'Open Air Amphitheatre & Music Studio',
      status: 'active',
      socialLinks: {
        instagram: 'https://instagram.com/crescendo_campus',
        spotify: 'https://spotify.com',
      },
    });

    const ecellClub = await Club.create({
      name: 'E-Cell (Entrepreneurship Cell)',
      category: 'Entrepreneurship',
      description: 'Incubating startup founders, connecting with venture capitalists, and fostering high-growth venture creation on campus.',
      mission: 'Empowering tomorrow innovators to turn classroom ideas into sustainable, venture-backed companies.',
      logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      lead: clubLeadUser._id,
      members: [
        { user: clubLeadUser._id, role: 'lead', joinedAt: new Date('2025-08-01') },
      ],
      meetingSchedule: 'Every Wednesday at 5:30 PM',
      venueOrRoom: 'Incubation Centre Conference Hall',
      status: 'active',
    });

    // Update users' joinedClubs
    await User.findByIdAndUpdate(clubLeadUser._id, { $set: { joinedClubs: [gdscClub._id, ecellClub._id] } });
    await User.findByIdAndUpdate(studentUser._id, { $set: { joinedClubs: [gdscClub._id, musicClub._id, roboticsClub._id] } });
    await User.findByIdAndUpdate(student2._id, { $set: { joinedClubs: [roboticsClub._id, gdscClub._id] } });
    await User.findByIdAndUpdate(student3._id, { $set: { joinedClubs: [musicClub._id] } });

    // 3. Create Events
    console.log('Seeding Events...');
    const now = new Date();
    const event1Date = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days from now
    const event2Date = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000); // 9 days from now
    const event3Date = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const event4Date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (past)

    const hackathonEvent = await Event.create({
      title: 'CampusHacks 2026: 36-Hour National Hackathon',
      club: gdscClub._id,
      createdBy: clubLeadUser._id,
      category: 'Hackathon & Contest',
      description: 'Our flagship annual hackathon brings together 300+ builders to create game-changing software, AI agents, and IoT prototypes. Tracks include HealthTech, FinTech, Web3, and Open Innovation with $5,000+ in prizes, mentoring from senior FAANG engineers, and food provided around the clock!',
      date: event1Date,
      startTime: '09:00 AM',
      endTime: '09:00 PM (Next Day)',
      venue: 'Main Sports Complex & Central Auditorium',
      isOnline: false,
      capacity: 350,
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      tags: ['Hackathon', 'AI', 'Coding', 'Prizes', 'FAANG'],
      speakers: [
        { name: 'Dr. Arthur Vance', designation: 'Dean of Student Affairs', photo: adminUser.avatar },
        { name: 'Prof. Elena Rostova', designation: 'AI Lab Director', photo: facultyUser.avatar },
      ],
      registeredUsers: [
        { user: studentUser._id, ticketId: 'CC-TKT-HACK01', registeredAt: new Date(), status: 'registered' },
        { user: student2._id, ticketId: 'CC-TKT-HACK02', registeredAt: new Date(), status: 'registered' },
        { user: student3._id, ticketId: 'CC-TKT-HACK03', registeredAt: new Date(), status: 'registered' },
      ],
      status: 'upcoming',
    });

    const aiWorkshopEvent = await Event.create({
      title: 'Masterclass: Building Autonomous Multi-Agent AI Systems',
      club: gdscClub._id,
      createdBy: facultyUser._id,
      category: 'Workshop',
      description: 'Hands-on laboratory session exploring LangChain, LlamaIndex, vector embeddings, and real-time LLM tool calling. Every participant will build and deploy a working multi-agent coding copilot by the end of the workshop.',
      date: event2Date,
      startTime: '02:00 PM',
      endTime: '05:30 PM',
      venue: 'CS Department Advanced Computing Lab 4',
      isOnline: true,
      meetingLink: 'https://meet.google.com/xyz-camp-us',
      capacity: 120,
      bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
      tags: ['AI', 'Python', 'LLM', 'Hands-on', 'Workshop'],
      speakers: [
        { name: 'Prof. Elena Rostova', designation: 'Lead AI Researcher', photo: facultyUser.avatar },
      ],
      registeredUsers: [
        { user: studentUser._id, ticketId: 'CC-TKT-AI001', registeredAt: new Date(), status: 'registered' },
      ],
      status: 'upcoming',
    });

    const concertEvent = await Event.create({
      title: 'Spring Acoustic Gala & Open Jam 2026',
      club: musicClub._id,
      createdBy: student3._id,
      category: 'Cultural & Arts',
      description: 'An evening under the stars featuring original student compositions, indie rock performances, beatbox battles, and open mic segments. Refreshments and festival badges for all attendees!',
      date: event3Date,
      startTime: '06:00 PM',
      endTime: '10:00 PM',
      venue: 'Lakeside Open Air Theatre',
      isOnline: false,
      capacity: 500,
      bannerImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
      tags: ['Live Music', 'Acoustic', 'Cultural', 'Fun'],
      registeredUsers: [
        { user: studentUser._id, ticketId: 'CC-TKT-MUS01', registeredAt: new Date(), status: 'registered' },
        { user: student2._id, ticketId: 'CC-TKT-MUS02', registeredAt: new Date(), status: 'registered' },
      ],
      status: 'upcoming',
    });

    const pastEvent = await Event.create({
      title: 'Cloud Native & Kubernetes Zero-to-Hero',
      club: gdscClub._id,
      createdBy: clubLeadUser._id,
      category: 'Workshop',
      description: 'A deep dive into containerization, microservice architecture, and Kubernetes orchestration with real cluster deployments.',
      date: event4Date,
      startTime: '10:00 AM',
      endTime: '03:00 PM',
      venue: 'Seminar Hall B',
      isOnline: false,
      capacity: 100,
      bannerImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80',
      tags: ['Cloud', 'Docker', 'Kubernetes'],
      registeredUsers: [
        { user: studentUser._id, ticketId: 'CC-TKT-CLD01', registeredAt: new Date(), status: 'attended' },
      ],
      status: 'completed',
    });

    // 4. Create Announcements
    console.log('Seeding Announcements...');
    await Announcement.create({
      title: '⚠️ Mid-Semester Examination Timetable & Seating Matrix Announced',
      content: 'The Office of the Controller of Examinations has released the official schedule for Spring 2026 Midterm Exams commencing next Monday. Please review your respective department room allotments and bring your student ID card without exception. Hall tickets can be downloaded via the student portal.',
      author: adminUser._id,
      category: 'Academic',
      priority: 'Urgent',
      targetAudience: 'All',
      department: 'All Departments',
      isPinned: true,
      attachments: [
        { title: 'Spring2026_Midterm_Schedule.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' },
      ],
      views: 482,
    });

    await Announcement.create({
      title: '💼 Tier-1 Tech Placement Drive: Google, Microsoft & Atlassian Visiting Next Month',
      content: 'Training & Placement Cell is excited to invite eligible 3rd and 4th-year students to register for upcoming on-campus recruitment rounds. Eligible branches: CSE, IT, ECE. Minimum CGPA criterion is 7.5 with no standing backlogs. Resume verification window closes this Friday at 5:00 PM.',
      author: adminUser._id,
      category: 'Placement & Career',
      priority: 'High',
      targetAudience: 'Students',
      department: 'Computer Science & Engineering',
      isPinned: true,
      attachments: [
        { title: 'Placement_Drive_Eligibility_Criteria.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' },
      ],
      views: 715,
    });

    await Announcement.create({
      title: '🚀 Undergraduate Research Grant: Fall Semester Applications Now Open',
      content: 'The AI Research Lab is sponsoring 5 student-led research projects in computer vision, robotics, and edge computing. Selected project teams receive up to $1,500 in cloud credits, compute hardware, and direct faculty co-authorship. Proposals should be under 3 pages.',
      author: facultyUser._id,
      category: 'Academic',
      priority: 'Normal',
      targetAudience: 'Students',
      department: 'Computer Science & Engineering',
      isPinned: false,
      views: 290,
    });

    await Announcement.create({
      title: '🎉 CampusHacks 2026 Registration Portal is Now Live!',
      content: 'Early-bird tickets are now open for CampusHacks 2026! Form your teams of 2 to 4 students across all branches. Hardware kits, free food, mentor office hours, and exclusive swag boxes await.',
      author: clubLeadUser._id,
      club: gdscClub._id,
      category: 'Event',
      priority: 'Normal',
      targetAudience: 'Students',
      department: 'All Departments',
      isPinned: false,
      views: 520,
    });

    // 5. Create Community Discussions
    console.log('Seeding Discussions...');
    const discussion1 = await Discussion.create({
      title: 'How should 2nd & 3rd-year students prepare for Google SDE Summer Internships?',
      content: 'Hi everyone! As summer internship season is approaching, what should our primary focus be? Should we spend more time grinding LeetCode patterns, or building substantial full-stack/system design projects with Docker and microservices? Would love insights from seniors who cracked off-campus/on-campus drives!',
      author: studentUser._id,
      category: 'Placements & Career',
      tags: ['Internships', 'Google', 'LeetCode', 'SystemDesign', 'Career'],
      upvotes: [clubLeadUser._id, student2._id, adminUser._id],
      views: 310,
      isPinned: true,
      replies: [
        {
          author: clubLeadUser._id,
          content: 'Great question Aanya! Here is the blueprint that helped me: 1. Solidify core DSA (Graphs, Trees, DP, Sliding Window). 2. Have 1 standout project on your GitHub with clear README and live demo link. 3. Practice mock interviews with peers. Don\'t sleep on OS and DBMS fundamentals!',
          upvotes: [studentUser._id, student2._id],
          isAcceptedAnswer: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          author: facultyUser._id,
          content: 'In addition to algorithmic preparation, emphasize problem-solving communication. In engineering interviews, thinking out loud and discussing trade-offs is just as critical as the final solution.',
          upvotes: [studentUser._id],
          isAcceptedAnswer: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    await Discussion.create({
      title: 'Looking for 1 Frontend & 1 ML Developer for CampusHacks 2026 Team',
      content: 'Our team currently has 2 backend/cloud developers. We are building an AI-powered voice triage assistant for university wellness clinics. Looking for teammates proficient in React/Next.js and HuggingFace/Whisper models. DM or reply if interested!',
      author: student2._id,
      category: 'Clubs & Events',
      tags: ['Hackathon', 'TeamFormation', 'CampusHacks', 'React', 'ML'],
      upvotes: [studentUser._id, clubLeadUser._id],
      views: 180,
      replies: [
        {
          author: studentUser._id,
          content: 'Hey Marcus! I would love to join your squad for the frontend and UI/UX design. I have hands-on experience in React, Tailwind and Figma. Let\'s connect!',
          upvotes: [student2._id],
          isAcceptedAnswer: false,
          createdAt: new Date(),
        },
      ],
    });

    await Discussion.create({
      title: 'Which elective to choose in 6th Sem: Distributed Systems or Compiler Design?',
      content: 'Both subjects look intriguing. From an industry and job perspective, which one provides more leverage for cloud infrastructure roles?',
      author: student3._id,
      category: 'Academics & Courses',
      tags: ['Curriculum', 'Electives', 'Cloud', 'Compilers'],
      upvotes: [clubLeadUser._id],
      views: 140,
      replies: [
        {
          author: facultyUser._id,
          content: 'If your ambition is cloud engineering, site reliability, or backend architecture, Distributed Systems provides immediate applicability with consensus protocols like Raft/Paxos and CAP theorem.',
          upvotes: [student3._id],
          isAcceptedAnswer: true,
          createdAt: new Date(),
        },
      ],
    });

    // 6. Create Resources
    console.log('Seeding Resources...');
    await Resource.create({
      title: 'Complete Campus Academic Calendar & Holiday Schedule 2026',
      description: 'Official academic calendar outlining semester start, midterm weeks, project submissions, cultural fest dates, and gazetted university holidays.',
      category: 'Forms & Circulars',
      department: 'All Departments',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'Academic_Calendar_2026.pdf',
      fileSize: '1.4 MB',
      fileType: 'pdf',
      uploadedBy: adminUser._id,
      downloads: 320,
    });

    await Resource.create({
      title: 'Data Structures, Algorithms & System Design Interview Bible',
      description: 'Curated 120-page repository of curated coding patterns, time complexity charts, and distributed architecture blueprints prepared by graduating seniors.',
      category: 'Study Materials',
      department: 'Computer Science & Engineering',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'DSA_Interview_Mastery.pdf',
      fileSize: '4.8 MB',
      fileType: 'pdf',
      uploadedBy: clubLeadUser._id,
      downloads: 512,
    });

    await Resource.create({
      title: 'Student Club Governance & Event Organization Handbook',
      description: 'Guidelines on reserving campus facilities, booking auditorium sound systems, budgeting, and official event sanction procedures.',
      category: 'Club Handbooks',
      department: 'All Departments',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'Club_Leadership_Manual.pdf',
      fileSize: '2.1 MB',
      fileType: 'pdf',
      uploadedBy: adminUser._id,
      downloads: 145,
    });

    // 7. Create Notifications
    console.log('Seeding Notifications...');
    await Notification.create({
      recipient: studentUser._id,
      sender: clubLeadUser._id,
      title: 'Event Pass Confirmed 🎟️',
      message: 'Your registration pass for CampusHacks 2026 is confirmed. Ticket ID: CC-TKT-HACK01',
      type: 'event',
      link: `/events/${hackathonEvent._id}`,
    });

    await Notification.create({
      recipient: studentUser._id,
      sender: adminUser._id,
      title: 'Urgent Announcement ⚠️',
      message: 'Mid-Semester Examination Timetable has been released for all branches.',
      type: 'announcement',
      link: '/announcements',
    });

    await Notification.create({
      recipient: studentUser._id,
      sender: clubLeadUser._id,
      title: 'New Reply in Community Discussion',
      message: 'Rohan Deshmukh replied to your question about Google SDE preparation.',
      type: 'discussion',
      link: `/discussions/${discussion1._id}`,
    });

    console.log('Database seeding successfully finished!');
    console.log('----------------------------------------------------');
    console.log('Official Demo Credentials:');
    console.log('1. Student:  student@college.edu  / Student@123 (Role: student)');
    console.log('2. Faculty:  faculty@college.edu  / Faculty@123 (Role: faculty)');
    console.log('3. HOD:      hod.cse@college.edu  / Hod@123     (Role: hod)');
    console.log('4. Admin:    admin@college.edu    / Admin@123   (Role: admin)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
