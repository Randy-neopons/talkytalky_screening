export interface TestInfoFormValues {
    therapistUserId: number;
    testDate: string;
    patientName: string;
    patientGender: string;
    patientBirthdate: string;
    brainLesions: string[];
    medicalHistory?: string;
    patientMemo?: string;
}
