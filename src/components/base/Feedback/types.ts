export enum FeedbackType {

    BUG_REPORT = 'BugReport',
    BUSINESS = 'Business',
}

export const FeedbackTypeOptions = [
    { value: FeedbackType.BUG_REPORT, label: '问题报告' },
    { value: FeedbackType.BUSINESS, label: '商务联系' },
];


export interface FeedbackFormState {
    category: FeedbackType;
    content: string;
    contact: string;
}
