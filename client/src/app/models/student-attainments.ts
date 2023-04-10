import { Questions } from './assessments';

export class StudentAttainments {
  _id: string | undefined;
  studentName: string | undefined;
  urn: number | undefined;
  crn: number | undefined;
  curriculumId: string | undefined;
  curriculumName: string | undefined;
  termId: string | undefined;
  termName: string | undefined;
  termNo: number | undefined;
  courseTitle: string | undefined;
  courseId: string | undefined;
  courseCode: string | undefined;
  assessmentId: number | undefined;
  assessmentType: string | undefined;
  assessmentName: string | undefined;
  questions: Questions[] = [];
  totalMarks: number | undefined;
  totalObtainedMarks: number | undefined;
  createdAt: Date | undefined;
  updateAt: Date | undefined;
}
