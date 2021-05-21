const exams = {
    questions: [
        {
            questionText: "question text need to choose many",
            questionType: "MultiChoice",
            choices: [
                "choice one",
                "choice two",
                "choice three",
                "choice four",
            ],
        },
        {
            questionText: "question text needs short answer",
            questionType: "ShortAnswer",
        },
        {
            questionText: "question text needs long answer",
            questionType: "LongAnswer",
        },
        {
            questionText: "question text needs code as answer",
            questionType: "Code",
            code_lang: "javascript",
        },
        {
            questionText: "question text needs single choice ",
            questionType: "SingleChoice",
            choices: [
                "choice one",
                "choice two",
                "choice three",
                "choice four",
            ],
        },
        {
            questionText: "question text needs single choice ",
            questionType: "Image",
        },
    ],
    mark: 5,
    title: "Quiz on software engineering may 2020",
    startDate: "2021-05-03T03:40:19.363Z",
    endDate: "2021-05-03T06:40:48.437Z",
    year: "2013",
};

export default exams;
