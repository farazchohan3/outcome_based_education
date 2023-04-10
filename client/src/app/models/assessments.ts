export class Assessments {
  _id: string | undefined;
  curriculumId: string | undefined;
  curriculumName: string | undefined;
  termId: string | undefined;
  termName: string | undefined;
  termNo: number | undefined;
  courseTitle: string | undefined;
  courseId: string | undefined;
  courseCode: string | undefined;
  assessmentType: string | undefined;
  assessmentName: string | undefined;
  questions: Questions[] | undefined;
  totalMarks: number | undefined;
  createdAt: Date | undefined;
  updateAt: Date | undefined;
}

export class Questions {
  coCode: string | undefined;
  bloomLevel: string | undefined;
  questionNo: string | undefined;
  questionStatement: string | undefined;
  maximumMarks: number = 0;
  obtainedMarks?: number | string | undefined;
}
