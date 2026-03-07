# backend/app/serializers.py

def serialize_syllabus(s):
    return {
        "id": s.id,
        "quarter": s.quarter,
        "year": s.year,
        "download_count": s.download_count,
        "favorite_count": s.favorite_count,
        "created_at": s.created_at.isoformat(),
        "course": {
            "id": s.course_id,
            "department": s.course.department,
            "course_number": s.course.course_number,
            "course_title": s.course.course_title,
            "professor_first_name": s.course.professor_first_name,
            "professor_last_name": s.course.professor_last_name,
        },
        "uploader": {
            "id": s.uploader_id,
            "email": s.uploader.email,
        }
    }