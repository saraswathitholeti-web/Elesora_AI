from typing import List, Dict, Any, Tuple
from app.models.models import Opportunity
from app.schemas.schemas import MatchRequest, OpportunityMatchResult, OpportunityOut


class MatcherService:
    @staticmethod
    def calculate_match(
        opportunity: Opportunity,
        criteria: MatchRequest
    ) -> OpportunityMatchResult:
        """
        Deterministic match scoring algorithm combined with contextual explanations.
        Scores:
        - Category alignment: 20 pts
        - Location / Remote match: 20 pts
        - Skill overlap: up to 40 pts
        - Education level alignment: 20 pts
        Total: 0 to 100
        """
        score = 0
        matching_reqs = []
        missing_skills = []

        # 1. Category alignment
        if criteria.category:
            if criteria.category.lower() in opportunity.category.lower():
                score += 20
                matching_reqs.append(f"Direct category match: {opportunity.category}")
            else:
                score += 5
        else:
            score += 15

        # 2. Location & Remote
        if opportunity.remote_available:
            score += 20
            matching_reqs.append("Remote / Online participation available")
        elif criteria.location_preference and (
            criteria.location_preference.lower() in opportunity.location.lower()
            or "all india" in opportunity.location.lower()
        ):
            score += 20
            matching_reqs.append(f"Location aligns: {opportunity.location}")
        else:
            score += 10

        # 3. Skills overlap
        opp_skills = [s.lower() for s in (opportunity.required_skills or [])]
        user_skills = [s.lower() for s in criteria.skills]

        if not opp_skills:
            score += 40
            matching_reqs.append("No specialized prior skills required (Open entry)")
        else:
            matched_count = 0
            for skill in opp_skills:
                if any(us in skill or skill in us for us in user_skills):
                    matched_count += 1
                else:
                    missing_skills.append(skill.title())

            if matched_count > 0:
                skill_ratio = matched_count / len(opp_skills)
                earned = int(skill_ratio * 40)
                score += earned
                matching_reqs.append(f"Matched {matched_count} out of {len(opp_skills)} required skill competencies")
            else:
                score += 5

        # 4. Education level
        eligibility_data = opportunity.eligibility or {}
        opp_edu = str(eligibility_data.get("education", "")).lower()
        if not opp_edu or criteria.education_level is None:
            score += 20
            matching_reqs.append("Standard eligibility baseline met")
        elif criteria.education_level.lower() in opp_edu or "all" in opp_edu or "any" in opp_edu:
            score += 20
            matching_reqs.append(f"Education level aligns: {criteria.education_level}")
        else:
            score += 10
            matching_reqs.append("Check specific academic stream guidelines")

        score = min(max(score, 15), 98)  # keep realistic bounds

        # Contextual explanation
        explanation = (
            f"Based on your profile, you have an estimated {score}% match for {opportunity.title} by {opportunity.organization}. "
            f"Your background satisfies {len(matching_reqs)} primary criteria. "
        )
        if missing_skills:
            explanation += f"Acquiring skills in {', '.join(missing_skills[:3])} will significantly boost your selection probability."
        else:
            explanation += "You fulfill all core skill prerequisites. We recommend submitting your application before the deadline."

        recommended_steps = [
            f"Review official eligibility requirements on {opportunity.organization}'s portal",
            "Prepare your resume and academic certificates",
            "Submit application directly via the official source link"
        ]
        if missing_skills:
            recommended_steps.insert(1, f"Add {missing_skills[0]} to your LifePath roadmap")

        opp_out = OpportunityOut.model_validate(opportunity)

        return OpportunityMatchResult(
            opportunity=opp_out,
            match_score=score,
            matching_requirements=matching_reqs,
            missing_skills=missing_skills,
            ai_explanation=explanation,
            recommended_next_steps=recommended_steps,
        )


matcher_service = MatcherService()
