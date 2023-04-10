import { Term } from "./term";

export class Curriculum {
    _id: string | undefined;
    curriculumName: string | undefined;
    curriculumOwner: string | undefined;
    curriculumOwnerId: string | undefined;
    deptName: string | undefined;
    credits: number | undefined;
    state: boolean | undefined;
    minDuration: number | undefined;
    maxDuration: number | undefined;
    totalTerms: number | undefined;
    startYear: number | undefined;
    endYear: number | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    terms: Term[] | undefined;
}
