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
    year: "2013",
};

export default exams;
