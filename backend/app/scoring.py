from collections import defaultdict

SCORING_RULES = {
    "act1_lung_sound": 1,
    "act1_cxr": 1,
    "act1_medication": 2,
    "act1_oxygen": 1,
    "act2_lung_sound": 1,
    "act2_abg": 1,
    "act2_treatment": 4,
}


def calculate_session_score(events) -> dict:
    correct_options = defaultdict(set)
    attempted_questions = set()

    for event in events:
        qid = event.question_id
        if not qid or qid not in SCORING_RULES:
            continue
        attempted_questions.add(qid)
        if event.is_correct is True and event.selected_option:
            correct_options[qid].add(event.selected_option)

    results = {}
    for qid, required_correct_count in SCORING_RULES.items():
        results[qid] = len(correct_options[qid]) >= required_correct_count

    total_questions = len(SCORING_RULES)
    correct_questions = sum(1 for ok in results.values() if ok)
    score = round((correct_questions / total_questions) * 100, 2) if total_questions else 0.0

    return {
        "total_questions": total_questions,
        "correct_questions": correct_questions,
        "score": score,
        "question_results": results,
        "attempted_questions": len(attempted_questions),
    }
