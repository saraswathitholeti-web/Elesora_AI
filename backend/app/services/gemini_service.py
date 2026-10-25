import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Try importing the official google-genai SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai package not installed, running in smart mock/fallback mode")


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client = None
        if GENAI_AVAILABLE and self.api_key and self.api_key.strip() != "" and not self.api_key.startswith("your_"):
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize GenAI client: {e}")

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown fences if model outputs ```json ... ```"""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "English",
        context: Optional[str] = None
    ) -> str:
        """Generate conversational response in target language (English, Telugu, Hindi)."""
        system_instruction = (
            f"You are ELEYSORA AI, an intelligent, empathetic digital inclusion assistant dedicated to Theme 3: "
            f"'Beyond the Screen: Build for a Smarter, More Inclusive Future'. "
            f"Your mission is to empower learners, job seekers, and marginalized communities with accessible guidance. "
            f"Always reply in {language}. Use clear, structured, encouraging language with bullet points and bold highlights."
        )
        if context:
            system_instruction += f"\nContext: {context}"

        if self.client:
            try:
                # Format contents
                prompt_text = f"{system_instruction}\n\nUser Question: {messages[-1]['content']}"
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt_text,
                )
                if response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini API chat error: {e}")

        # Intelligent Fallback response
        last_msg = messages[-1]["content"].lower()
        if "telugu" in language.lower() or any(w in last_msg for w in ["తెలుగు", "telugu"]):
            return (
                f"నమస్కారం! ఎలైసోరా (ELEYSORA AI) కి స్వాగతం. "
                f"మీ లక్ష్యం '{messages[-1]['content']}' ను సాధించడానికి మేము మీకు సహాయం చేస్తాము.\n\n"
                f"1. **నైపుణ్యాల రోడ్‌మ్యాప్**: మీ అభిరుచికి తగిన ఉచిత కోర్సులు & ప్రాజెక్ట్‌లను ప్లాన్ చేయండి.\n"
                f"2. **స్కాలర్‌షిప్‌లు & ఉద్యోగాలు**: అర్హత కలిగిన అవకాశాలను గుర్తించండి.\n"
                f"3. **ప్రభుత్వ పథకాలు**: సులభమైన వివరాలు పొందండి.\n\n"
                f"మీరు ఏ అంశంపై మరింత వివరాలు తెలుసుకోవాలనుకుంటున్నారు?"
            )
        elif "hindi" in language.lower() or any(w in last_msg for w in ["हिंदी", "hindi"]):
            return (
                f"नमस्ते! ELEYSORA AI में आपका स्वागत है। "
                f"आपके लक्ष्य '{messages[-1]['content']}' को प्राप्त करने के लिए हम आपका मार्गदर्शन करेंगे।\n\n"
                f"1. **कैरियर और शिक्षा रोडमैप**: स्टेप-बाय-स्टेप सीखने की योजना बनाएं।\n"
                f"2. **छात्रवृत्ति और इंटर्नशिप**: निःशुल्क अवसरों और कौशल कार्यक्रमों को खोजें।\n"
                f"3. **सरकारी योजनाएं और दस्तावेज़**: जटिल जानकारी को आसानी से समझें।\n\n"
                f"कृपया बताएं कि आप किस क्षेत्र में शुरुआत करना चाहते हैं?"
            )
        else:
            return (
                f"Hello! I am ELEYSORA AI, your inclusion & opportunity companion.\n\n"
                f"Regarding your query **\"{messages[-1]['content']}\"**:\n\n"
                f"- **Step 1: Discover Opportunities** — Check our Discover tab for curated scholarships, free certifications, and entry-level internships matching your background.\n"
                f"- **Step 2: Structured Roadmap** — Use our **LifePath** feature to generate a week-by-week learning timeline with free high-quality resources.\n"
                f"- **Step 3: Actionable Cards** — Break down complex applications into manageable daily tasks.\n\n"
                f"Would you like me to generate a personalized LifePath roadmap or help you analyze a specific barrier you are facing?"
            )

    async def generate_lifepath(
        self,
        career_goal: str,
        education_level: str,
        current_skills: List[str],
        study_hours_per_week: float,
        preferred_language: str = "English",
        budget: str = "Free / Low Cost",
        challenges: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate structured AI career roadmap."""
        prompt = f"""
Return ONLY a valid JSON object matching this structure:
{{
  "career_goal": "{career_goal}",
  "overview": "Clear 2-sentence summary of the pathway",
  "required_core_skills": ["skill1", "skill2", "skill3", "skill4"],
  "learning_stages": ["Stage 1: Fundamentals", "Stage 2: Core Competencies", "Stage 3: Advanced Projects", "Stage 4: Industry Readiness"],
  "estimated_total_months": 6,
  "next_recommended_action": "Begin Stage 1 fundamentals with daily 1-hour practice",
  "milestones": [
    {{
      "title": "Milestone title",
      "description": "Milestone description",
      "sequence_number": 1,
      "estimated_duration_days": 14,
      "status": "pending",
      "skills_covered": ["skill1", "skill2"],
      "recommended_resources": [{{"name": "Resource Name", "type": "Free Course / Docs", "url": "https://example.com"}}],
      "suggested_project": "Hands-on project description"
    }}
  ]
}}
User profile:
- Goal: {career_goal}
- Education: {education_level}
- Current Skills: {', '.join(current_skills) if current_skills else 'Beginner'}
- Study Hours: {study_hours_per_week} hours/week
- Budget: {budget}
- Language: {preferred_language}
- Obstacles/Challenges: {challenges or 'None'}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API lifepath generation error: {e}")

        # High-fidelity domain-aware fallback roadmap
        skills = current_skills if current_skills else ["Computer Basics", "Logical Thinking"]
        return {
            "career_goal": career_goal,
            "overview": f"A comprehensive, barrier-free pathway tailored for {education_level} learners aiming to achieve {career_goal} with {study_hours_per_week} study hours weekly.",
            "required_core_skills": [
                "Core Programming & Scripting",
                "Algorithms & Problem Solving",
                "Applied Domain Tooling",
                "Portfolio Project Development",
                "Technical Interview Readiness"
            ],
            "learning_stages": [
                "Phase 1: Foundations & Core Tooling",
                "Phase 2: Applied Theory & Practice",
                "Phase 3: Real-World Capstone Project",
                "Phase 4: Career & Internship Preparation"
            ],
            "estimated_total_months": 5 if study_hours_per_week >= 10 else 7,
            "next_recommended_action": f"Start Milestone 1: Master foundational concepts for {career_goal} using free open-access curricula.",
            "milestones": [
                {
                    "title": "Stage 1: Core Fundamentals & Environment Setup",
                    "description": f"Establish strong mastery of foundational principles required for {career_goal}, configure your development workspace, and build basic scripts.",
                    "sequence_number": 1,
                    "estimated_duration_days": 14,
                    "status": "in_progress",
                    "skills_covered": ["Basics & Syntax", "Version Control (Git)", "CLI Tooling"],
                    "recommended_resources": [
                        {"name": "Official Open Documentation & Tutorials", "type": "Interactive Guide", "url": "https://developer.mozilla.org"},
                        {"name": "FreeCodeCamp & CS50 Foundations", "type": "Free Video Course", "url": "https://www.freecodecamp.org"}
                    ],
                    "suggested_project": "Build and publish a command-line tool or personal portfolio repository."
                },
                {
                    "title": "Stage 2: Intermediate Data Structures & Applied Algorithms",
                    "description": "Deepen algorithmic thinking, understand data structures, and implement efficient data processing logic.",
                    "sequence_number": 2,
                    "estimated_duration_days": 21,
                    "status": "pending",
                    "skills_covered": ["Data Structures", "Algorithmic Efficiency", "API Integration"],
                    "recommended_resources": [
                        {"name": "NeetCode / LeetCode Beginner Curated Track", "type": "Practice Problems", "url": "https://neetcode.io"}
                    ],
                    "suggested_project": "Develop a data retrieval and analytics script parsing live public JSON APIs."
                },
                {
                    "title": "Stage 3: Advanced Frameworks & Full System Integration",
                    "description": f"Master modern industry frameworks related to {career_goal}. Learn clean architecture, modular design, and asynchronous patterns.",
                    "sequence_number": 3,
                    "estimated_duration_days": 30,
                    "status": "pending",
                    "skills_covered": ["Modern Frameworks", "State Management / Pipelines", "Database Interaction"],
                    "recommended_resources": [
                        {"name": "Full Stack Open / Fast.ai Curated Tracks", "type": "Free Hands-on Course", "url": "https://fullstackopen.com"}
                    ],
                    "suggested_project": "Construct an end-to-end full application or machine learning pipeline."
                },
                {
                    "title": "Stage 4: Capstone Industry Showcase & Internship Readiness",
                    "description": "Synthesize all acquired competencies into a production-grade portfolio piece with documentation, test suites, and CI/CD.",
                    "sequence_number": 4,
                    "estimated_duration_days": 25,
                    "status": "pending",
                    "skills_covered": ["Testing & QA", "Deployment & Cloud", "Resume & Interview Strategy"],
                    "recommended_resources": [
                        {"name": "Open Source Contribution Guide", "type": "Guide", "url": "https://opensource.guide"}
                    ],
                    "suggested_project": "Deploy your capstone project live with public URL and open-source GitHub repository."
                }
            ]
        }

    async def analyze_barrier(
        self,
        user_goal: str,
        reported_barrier: str,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Barrier-to-Bridge intelligence engine."""
        prompt = f"""
Analyze this barrier facing a user and provide an actionable bridge solution.
Return ONLY valid JSON matching:
{{
  "identified_goal": "{user_goal}",
  "reported_barrier": "{reported_barrier}",
  "barrier_category": "Financial / Language / Accessibility / Technical / Time",
  "possible_solutions": ["Solution 1", "Solution 2", "Solution 3"],
  "recommended_resources": [
    {{"title": "Resource Name", "type": "Scholarship/Free Tool/Govt Scheme", "url": "https://example.com"}}
  ],
  "suggested_actions": [
    {{"title": "Action step", "priority": "High", "timeline": "Next 48 Hours"}}
  ],
  "bridge_action_plan": [
    "Step 1: Discover matching free government or community grants",
    "Step 2: Leverage open-access textbooks and community learning centers"
  ],
  "empowerment_message": "Inspiring closing message in {language}"
}}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API barrier analysis error: {e}")

        # Intelligent barrier categorization and solution mapping
        barrier_lower = reported_barrier.lower()
        if any(w in barrier_lower for w in ["afford", "cost", "money", "expensive", "fee", "financial", "budget"]):
            category = "Financial Barrier"
            solutions = [
                "Utilize 100% free audited courses (Coursera Financial Aid, EdX Audit, MIT OpenCourseWare).",
                "Apply for national merit & state fee-reimbursement schemes (NSP, PM-USP).",
                "Leverage local public library digital access and community skill centers (PMKVY).",
                "Participate in open source bounties and paid student internships."
            ]
            resources = [
                {"title": "Coursera Financial Aid Program (100% Fee Waiver)", "type": "Educational Grant", "url": "https://www.coursera.org"},
                {"title": "National Scholarship Portal (Govt of India)", "type": "Official Scholarship", "url": "https://scholarships.gov.in"},
                {"title": "PMKVY Free Skill Development Centers", "type": "Govt Training", "url": "https://www.pmkvyofficial.org"}
            ]
        elif any(w in barrier_lower for w in ["english", "language", "understand", "hindi", "telugu"]):
            category = "Language Barrier"
            solutions = [
                "Use ELEYSORA's localized multilingual lessons available in Telugu and Hindi.",
                "Access Swayam / NPTEL video lectures dubbed in regional Indian languages.",
                "Employ browser text-to-speech and dual-subtitle translation extensions."
            ]
            resources = [
                {"title": "SWAYAM Regional Language Translation Initiative", "type": "MOOC Platform", "url": "https://swayam.gov.in"},
                {"title": "AI4Bharat Bhashini Speech Tools", "type": "Language Tech", "url": "https://bhashini.gov.in"}
            ]
        elif any(w in barrier_lower for w in ["disability", "screen", "blind", "vision", "motor", "deaf"]):
            category = "Accessibility Barrier"
            solutions = [
                "Enable ELEYSORA High-Contrast and Screen-Reader Optimizations.",
                "Use NVDA screen reader with custom tactile keybindings.",
                "Leverage voice dictation and automated audio transcription tools."
            ]
            resources = [
                {"title": "NVDA Free Screen Reader for Windows", "type": "Assistive Software", "url": "https://www.nvaccess.org"},
                {"title": "National Institute for the Visually Handicapped (NIVH)", "type": "Support Org", "url": "http://nivh.gov.in"}
            ]
        else:
            category = "Skill & Opportunity Navigation Barrier"
            solutions = [
                "Follow a structured bite-sized LifePath roadmap to prevent information overload.",
                "Connect with peer study groups and community mentors via Community Connect.",
                "Convert learning targets into daily Smart Action Cards with realistic deadlines."
            ]
            resources = [
                {"title": "FreeCodeCamp Developer Community", "type": "Peer Learning", "url": "https://forum.freecodecamp.org"},
                {"title": "ELEYSORA LifePath Career Tracker", "type": "Platform Feature", "url": "/lifepath"}
            ]

        return {
            "identified_goal": user_goal,
            "reported_barrier": reported_barrier,
            "barrier_category": category,
            "possible_solutions": solutions,
            "recommended_resources": resources,
            "suggested_actions": [
                {"title": "Review verified zero-cost opportunities in ELEYSORA Discover", "priority": "High", "timeline": "Today"},
                {"title": "Submit application or financial aid request with drafted statement", "priority": "High", "timeline": "Next 3 Days"},
                {"title": "Commit to 45 minutes daily following the LifePath roadmap", "priority": "Medium", "timeline": "This Week"}
            ],
            "bridge_action_plan": [
                f"1. Acknowledge and isolate the obstacle: {reported_barrier}",
                "2. Bypass cost/access barriers through verified institutional and open-access channels",
                "3. Track daily incremental progress using Smart Action Cards",
                "4. Leverage community assistance when encountering roadblocks"
            ],
            "empowerment_message": (
                "Every great achievement starts with overcoming an obstacle. Your potential is not defined by barriers, "
                "but by the bridges you build to cross them. ELEYSORA AI is with you at every step!"
            )
        }

    async def simplify_document(
        self,
        document_text: str,
        file_name: str,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Analyze, summarize, and extract actionable information from uploaded documents."""
        prompt = f"""
You are ELEYSORA Document Intelligence. Analyze the following document text and output ONLY a JSON object:
{{
  "summary": "Clear, concise 2-3 sentence executive summary in {language}",
  "simplified_text": "Plain-language explanation breaking down jargon in {language}",
  "extracted_information": {{
    "deadlines": ["Deadline 1", "Deadline 2"],
    "eligibility_requirements": ["Requirement 1", "Requirement 2"],
    "required_documents": ["Doc 1", "Doc 2"],
    "application_instructions": "Step by step application instructions",
    "warnings": ["Crucial warning or penalty if missed"]
  }},
  "action_plan": [
    {{"step": 1, "task": "Initial task", "deadline": "Timeline note"}},
    {{"step": 2, "task": "Follow up task", "deadline": "Timeline note"}}
  ]
}}
Document Filename: {file_name}
Document Content:
{document_text[:6000]}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API document analysis error: {e}")

        # Deterministic extraction fallback using regex & heuristics
        deadlines = re.findall(r'(?:deadline|last date|due date|dated|by)[:\s]+([^\n\.,]+)', document_text, re.IGNORECASE)
        eligibility = re.findall(r'(?:eligib\w+|qualification|criteria)[:\s]+([^\n\.,]+)', document_text, re.IGNORECASE)

        return {
            "summary": f"This document '{file_name}' outlines official requirements, institutional guidelines, and application procedures.",
            "simplified_text": (
                f"We have simplified '{file_name}' for quick understanding. The document specifies essential criteria, "
                f"submission deadlines, and the verification process needed to secure benefits or approval."
            ),
            "extracted_information": {
                "deadlines": deadlines[:3] if deadlines else ["Review official portal for final closing announcement"],
                "eligibility_requirements": eligibility[:4] if eligibility else [
                    "Must be an enrolled student or recent graduate",
                    "Valid government ID proof (Aadhaar / National ID)",
                    "Academic transcripts meeting minimum threshold"
                ],
                "required_documents": [
                    "Recent passport-sized photograph",
                    "Identity & Age verification certificate",
                    "Educational marksheets & degree certificate",
                    "Income or category certificate (if applicable)"
                ],
                "application_instructions": (
                    "Submit scanned copies in PDF format. Verify all entered names match identity documents exactly."
                ),
                "warnings": [
                    "Late submissions or incomplete attestations lead to automatic disqualification."
                ]
            },
            "action_plan": [
                {"step": 1, "task": "Gather and scan all mandatory verification documents into PDF format.", "deadline": "Within 48 hours"},
                {"step": 2, "task": "Cross-check eligibility criteria against current academic scores.", "deadline": "This week"},
                {"step": 3, "task": "Submit application through official portal and save confirmation receipt.", "deadline": "Before deadline"}
            ]
        }

    async def answer_document_question(
        self,
        document_text: str,
        question: str,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Q&A against uploaded document context."""
        prompt = f"""
Answer this question accurately using ONLY the provided document text. If not stated, say so clearly.
Reply in {language}.
Document text:
{document_text[:6000]}

User Question: {question}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                if response.text:
                    return {
                        "answer": response.text.strip(),
                        "cited_page": "Page 1",
                        "language": language
                    }
            except Exception as e:
                logger.error(f"Gemini API document QA error: {e}")

        return {
            "answer": f"Based on the analyzed document text, regarding '{question}': The document requires complying with all mentioned application steps and providing verified documentation.",
            "cited_page": "Section 1",
            "language": language
        }

    async def explain_topic(
        self,
        topic: str,
        level: str = "Beginner",
        language: str = "English"
    ) -> Dict[str, Any]:
        """Smart Learning Hub topic explainer."""
        prompt = f"""
Return ONLY JSON:
{{
  "topic": "{topic}",
  "level": "{level}",
  "simple_analogy": "Memorable real-life analogy explaining {topic}",
  "core_concepts": [
    {{"concept": "Concept 1", "explanation": "Simple explanation"}},
    {{"concept": "Concept 2", "explanation": "Simple explanation"}}
  ],
  "practical_example": "Everyday code or practical scenario",
  "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "quiz_ready_prompt": "Are you ready to test your understanding with a 3-question quick quiz?"
}}
Reply in {language}.
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API explain topic error: {e}")

        return {
            "topic": topic,
            "level": level,
            "simple_analogy": f"Think of {topic} like a library indexing system: instead of searching every shelf randomly, you have an intelligent catalog that guides you directly to the exact knowledge you need.",
            "core_concepts": [
                {"concept": "Foundational Principle", "explanation": f"Understanding the core mechanism behind {topic} allows you to apply it in any programming language or workflow."},
                {"concept": "Practical Application", "explanation": f"How {topic} solves real-world bottlenecks in modern technology and data systems."}
            ],
            "practical_example": f"When building an application, applying {topic} reduces execution time and ensures consistent, reliable results.",
            "key_takeaways": [
                f"Mastering {topic} creates a strong foundation for technical interviews.",
                "Start with the simple principles before optimizing edge cases.",
                "Practice by implementing a mini-project hands-on."
            ],
            "quiz_ready_prompt": f"Ready to check your grasp of {topic}? Try the quick quiz below!"
        }

    async def generate_quiz(
        self,
        topic: str,
        number_of_questions: int = 3,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Smart Learning Hub interactive quiz generator."""
        prompt = f"""
Generate a {number_of_questions}-question multiple-choice quiz on '{topic}'.
Return ONLY JSON:
{{
  "topic": "{topic}",
  "questions": [
    {{
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Why this option is correct"
    }}
  ]
}}
Language: {language}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API quiz generation error: {e}")

        return {
            "topic": topic,
            "questions": [
                {
                    "question": f"What is the primary objective of mastering {topic}?",
                    "options": [
                        "To build scalable, efficient, and maintainable solutions",
                        "To write confusing code that nobody can modify",
                        "To increase network latency unnecessarily",
                        "To bypass all security validations"
                    ],
                    "correct_option_index": 0,
                    "explanation": f"{topic} is essential for creating high-performance, maintainable technology solutions."
                },
                {
                    "question": f"Which of the following represents a best practice when working with {topic}?",
                    "options": [
                        "Ignoring edge cases and error handling",
                        "Structuring code modularly with clear documentation and tests",
                        "Hardcoding credentials in source control",
                        "Never reviewing dependencies"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Modular design and automated testing ensure longevity and reliability."
                },
                {
                    "question": f"How does {topic} contribute to digital inclusion?",
                    "options": [
                        "By restricting information access to experts only",
                        "By empowering learners with structured, reproducible skills",
                        "By requiring paid proprietary hardware",
                        "By eliminating open-source communities"
                    ],
                    "correct_option_index": 1,
                    "explanation": "Knowledge sharing and open skills unlock opportunities for diverse learners."
                }
            ]
        }

    async def get_sustainability_advice(
        self,
        area: str,
        context: Optional[str] = None,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Generate practical environmental advice."""
        prompt = f"""
Provide practical, zero-cost or low-cost daily sustainability advice for '{area}'.
Return ONLY JSON:
{{
  "area": "{area}",
  "practical_tips": [
    {{"title": "Actionable Tip 1", "impact": "Estimated practical conservation benefit"}},
    {{"title": "Actionable Tip 2", "impact": "Estimated practical conservation benefit"}}
  ],
  "immediate_action": "One action you can take right now today",
  "community_impact_note": "How small actions create collective change"
}}
Reply in {language}.
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    cleaned = self._clean_json_response(response.text)
                    return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Gemini API sustainability advice error: {e}")

        tips_map = {
            "electricity": [
                {"title": "Vampire Power Elimination", "impact": "Saves 5-10% of monthly household electricity by unplugging standby chargers and appliances."},
                {"title": "Optimal Air Conditioner Temperature (24°C - 26°C)", "impact": "Every 1°C increase reduces compressor energy consumption by approximately 6%."}
            ],
            "water": [
                {"title": "Aerator Retrofitting on Taps", "impact": "Reduces tap water flow rate by up to 50% without compromising water pressure."},
                {"title": "Greywater Reuse for Household Plants", "impact": "Recycles vegetable washing water to sustain green cover effortlessly."}
            ],
            "waste": [
                {"title": "Two-Bin Waste Segregation (Wet vs Dry)", "impact": "Diverts organic compostable matter from landfills, reducing methane emissions."},
                {"title": "Refusal of Single-Use Plastic Wrappers", "impact": "Prevents microplastic accumulation in local waterways and storm drains."}
            ],
            "transport": [
                {"title": "Trip Chaining and Cycling for <2km Errands", "impact": "Cuts short-distance fuel burns and promotes cardiovascular health."},
                {"title": "Carpooling and Public Transit Utilization", "impact": "Lowers personal carbon footprint by up to 40% on daily commutes."}
            ]
        }
        tips = tips_map.get(area.lower(), tips_map["electricity"])

        return {
            "area": area.capitalize(),
            "practical_tips": tips,
            "immediate_action": "Switch off unused lighting and unplug smartphone chargers when fully charged.",
            "community_impact_note": "When millions of learners adopt micro-habits, collective consumption drops significantly without compromising quality of life."
        }


gemini_service = GeminiService()
