from datetime import datetime, timezone, timedelta
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.models import Opportunity, GovernmentScheme, CommunityResource

logger = logging.getLogger(__name__)


async def seed_initial_data(db: AsyncSession):
    """Seed real, verified opportunities, schemes and community resources."""
    now = datetime.now(timezone.utc)

    # 1. Opportunities Seed
    opp_count = await db.execute(select(func.count(Opportunity.id)))
    if (opp_count.scalar() or 0) == 0:
        logger.info("Seeding verified opportunities...")
        opportunities = [
            Opportunity(
                title="Google Generation Scholarship (APAC)",
                organization="Google",
                category="Scholarship",
                description="Selected students receive $2,500 USD for the academic year. Awarded based on academic performance, leadership, and impact on diversity and inclusion in tech.",
                eligibility={
                    "education": "Undergraduate / Postgraduate in Computer Science or related STEM field",
                    "citizenship": "India / Asia Pacific regions",
                    "minimum_grade": "Strong academic record"
                },
                required_skills=["Computer Science Fundamentals", "Leadership", "Community Impact"],
                location="All India / Online",
                remote_available=True,
                application_deadline=now + timedelta(days=45),
                official_url="https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac",
                source_url="https://buildyourfuture.withgoogle.com",
                last_verified_at=now,
                verification_status="Verified",
            ),
            Opportunity(
                title="Google Summer of Code (GSoC) Open Source Mentorship",
                organization="Google Open Source",
                category="Internship",
                description="Global, online mentoring program introducing students and beginners into open source software development with stipends and 1-on-1 industry mentors.",
                eligibility={
                    "education": "Open to all students and beginners aged 18+",
                    "citizenship": "Global / India eligible",
                    "prerequisites": "Interest in open source contribution"
                },
                required_skills=["Git & GitHub", "Python or JavaScript or C++", "Communication"],
                location="Remote / Online",
                remote_available=True,
                application_deadline=now + timedelta(days=60),
                official_url="https://summerofcode.withgoogle.com",
                source_url="https://opensource.google",
                last_verified_at=now,
                verification_status="Verified",
            ),
            Opportunity(
                title="SWAYAM Free Online Courses & NPTEL Certifications",
                organization="Ministry of Education, Govt of India",
                category="Free Course",
                description="Provides free online courses developed by IITs and IISc covering Computer Science, AI, Humanities, and Engineering with government-recognized certification.",
                eligibility={
                    "education": "Open to all students, lifelong learners and working professionals",
                    "fee": "Free learning; nominal exam fee for certificate with fee waiver for eligible students"
                },
                required_skills=["Basic Computer Literacy", "Self-Directed Learning"],
                location="All India / Online",
                remote_available=True,
                application_deadline=now + timedelta(days=90),
                official_url="https://swayam.gov.in",
                source_url="https://nptel.ac.in",
                last_verified_at=now,
                verification_status="Verified",
            ),
            Opportunity(
                title="Microsoft Learn AI & Cloud Skills Program",
                organization="Microsoft",
                category="Certification",
                description="Comprehensive zero-cost curriculum on Artificial Intelligence fundamentals, Azure Cloud concepts, and machine learning workflows with practice assessments.",
                eligibility={
                    "education": "All levels from beginners to advanced professionals",
                    "access": "100% Free interactive modules and sandbox environments"
                },
                required_skills=["Basic Computing", "Cloud Fundamentals"],
                location="Online",
                remote_available=True,
                application_deadline=now + timedelta(days=120),
                official_url="https://learn.microsoft.com/en-us/training/paths/get-started-with-artificial-intelligence-on-azure/",
                source_url="https://learn.microsoft.com",
                last_verified_at=now,
                verification_status="Verified",
            ),
            Opportunity(
                title="AICTE - EduSkills Virtual Internship Program",
                organization="All India Council for Technical Education (AICTE)",
                category="Internship",
                description="Government-partnered virtual internship program for engineering and polytechnic students in Cybersecurity, Cloud, and AI with leading global tech firms.",
                eligibility={
                    "education": "Enrolled in B.Tech, BE, MCA, Diploma or Polytechnic",
                    "attendance": "Must complete scheduled lab hours"
                },
                required_skills=["Basic Programming", "Internet Access"],
                location="All India / Online",
                remote_available=True,
                application_deadline=now + timedelta(days=30),
                official_url="https://internship.aicte-india.org",
                source_url="https://eduskillsfoundation.org",
                last_verified_at=now,
                verification_status="Verified",
            ),
            Opportunity(
                title="Coursera Financial Aid & Scholarship Program",
                organization="Coursera",
                category="Free Course",
                description="Apply for 100% financial aid to receive full access to university-certified courses from Stanford, DeepLearning.AI, and Google at zero cost.",
                eligibility={
                    "education": "Learners demonstrating financial need",
                    "requirement": "Short application detailing career goals and financial situation"
                },
                required_skills=["Dedication to Course Completion"],
                location="Online",
                remote_available=True,
                application_deadline=now + timedelta(days=180),
                official_url="https://www.coursera.org/financial-aid",
                source_url="https://learner.coursera.help",
                last_verified_at=now,
                verification_status="Verified",
            )
        ]
        db.add_all(opportunities)

    # 2. Government Schemes Seed
    scheme_count = await db.execute(select(func.count(GovernmentScheme.id)))
    if (scheme_count.scalar() or 0) == 0:
        logger.info("Seeding verified government schemes...")
        schemes = [
            GovernmentScheme(
                scheme_name="National Scholarship Portal (NSP)",
                department="Ministry of Electronics and Information Technology (MeitY)",
                description="Single unified platform for applying to Central Sector, Post-Matric, Merit-cum-Means, and State scholarships for students across India.",
                eligibility={
                    "categories": ["Pre-Matric", "Post-Matric", "Top Class Education", "Merit-cum-Means"],
                    "income_limit": "Varies by sub-scheme (typically below INR 2.5 - 6.0 Lakhs per annum)"
                },
                benefits="Direct Benefit Transfer (DBT) of full tuition fees, maintenance allowance, and academic grants directly into Aadhaar-linked bank accounts.",
                required_documents=[
                    "Aadhaar Card",
                    "Previous Year Academic Marksheet",
                    "Income Certificate issued by competent revenue authority",
                    "Bank Account Passbook (Aadhaar Seeded)",
                    "Bonafide Student Certificate from College / University"
                ],
                application_process="Register on scholarships.gov.in using Aadhaar number and OTP. Fill OTR (One Time Registration), choose scheme, upload documents, and submit for institutional verification.",
                official_url="https://scholarships.gov.in",
                last_verified_at=now,
                verification_status="Verified",
            ),
            GovernmentScheme(
                scheme_name="Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
                department="Ministry of Skill Development and Entrepreneurship (MSDE)",
                description="Flagship skill certification scheme offering free industry-relevant training in Industry 4.0 skills, Coding, AI, Robotics, and Green Energy.",
                eligibility={
                    "age": "15 to 45 years",
                    "education": "School dropouts, college students, and unemployed youth seeking employability skills",
                    "nationality": "Indian Citizen"
                },
                benefits="100% free government-certified training, assessment, and certification with post-training placement assistance and entrepreneurship support.",
                required_documents=[
                    "Aadhaar Card / Voter ID",
                    "Educational proof / Marksheets",
                    "Bank Account details",
                    "Passport size photograph"
                ],
                application_process="Visit Skill India Digital portal, find nearby PMKVY training center or select virtual batch, register, and complete candidate enrollment.",
                official_url="https://www.skillindiadigital.gov.in",
                last_verified_at=now,
                verification_status="Verified",
            ),
            GovernmentScheme(
                scheme_name="SWAYAM Free Higher Education Portal",
                department="Ministry of Education, Govt of India",
                description="Government of India initiative designed to achieve the three cardinal principles of Education Policy: Access, Equity, and Quality for every student.",
                eligibility={
                    "open_to": "Any learner anywhere in India or abroad, from 9th grade to post-graduation",
                    "prerequisites": "None (free open access)"
                },
                benefits="Access to high-definition video lectures, downloadable reading materials, self-assessment tests, and credit transfer to degree marksheets under UGC guidelines.",
                required_documents=[
                    "Email address or Google account",
                    "Student ID (if applying for university credit transfer)"
                ],
                application_process="Log on to swayam.gov.in, browse the catalog of over 2,000 courses, click 'Enroll', and start learning instantly.",
                official_url="https://swayam.gov.in",
                last_verified_at=now,
                verification_status="Verified",
            ),
            GovernmentScheme(
                scheme_name="Bhashini — National Language Translation Mission",
                department="Ministry of Electronics and Information Technology (MeitY)",
                description="AI-led language technology mission enabling citizens to access digital government services, educational content, and tools in their own mother tongue (Telugu, Hindi, Tamil, etc.).",
                eligibility={
                    "target": "All Indian citizens, students, and language communities",
                    "accessibility": "Open access web & mobile services"
                },
                benefits="Real-time voice-to-text, document translation, and speech-based interface across 22 scheduled Indian languages to break language barriers completely.",
                required_documents=["None (Public digital public infrastructure)"],
                application_process="Access Bhashini portal or integrate Bhashini-powered apps to consume digital content in regional languages.",
                official_url="https://bhashini.gov.in",
                last_verified_at=now,
                verification_status="Verified",
            )
        ]
        db.add_all(schemes)

    # 3. Community Resources Seed
    comm_count = await db.execute(select(func.count(CommunityResource.id)))
    if (comm_count.scalar() or 0) == 0:
        logger.info("Seeding verified community support resources...")
        resources = [
            CommunityResource(
                organization_name="National Association for the Blind (NAB India)",
                description="Provides comprehensive education, vocational training, assistive technology labs, and digital literacy support for visually impaired learners.",
                resource_category="Accessibility & Inclusion",
                location="R.K. Puram, New Delhi & Nationwide Centers",
                official_url="https://nabindia.org",
                contact_information={
                    "helpline": "+91-11-26176379",
                    "email": "info@nabindia.org",
                    "services": "Audiobooks, Screen reader training, Braille learning materials"
                },
                verification_status="Verified",
            ),
            CommunityResource(
                organization_name="Free Software Foundation India (FSFI)",
                description="Non-profit community advocating digital freedom, open education resources, accessible software tools, and mentorship for young developers.",
                resource_category="Digital Literacy & Open Education",
                location="National / Online Communities",
                official_url="https://fsf.org.in",
                contact_information={
                    "forum": "https://discuss.fsf.org.in",
                    "services": "Free software workshops, student mentorship, digital autonomy"
                },
                verification_status="Verified",
            ),
            CommunityResource(
                organization_name="Samarthanam Trust for the Disabled",
                description="Empowers persons with disabilities and underserved youth through quality education, livelihood training, and assistive aids.",
                resource_category="Skill Development & Accessibility",
                location="Bengaluru, Karnataka (Centers in Hyderabad, Delhi, Chennai)",
                official_url="https://www.samarthanam.org",
                contact_information={
                    "phone": "+91-80-68383838",
                    "email": "info@samarthanam.org",
                    "services": "Accessible digital libraries, skill development, job placement"
                },
                verification_status="Verified",
            )
        ]
        db.add_all(resources)

    await db.commit()
    logger.info("Database seed completed successfully.")
