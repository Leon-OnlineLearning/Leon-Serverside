import getBaseURL from "@utils/getBaseURL";
import TextClassificationModel from "../TextClassificationModel";

export default function convertModelPathsToUrls(
    model: TextClassificationModel
) {
    const _model = { ...model };
    _model.dataClassificationModelPath = `${getBaseURL()}${
        _model.dataClassificationModelPath
    }`;
    _model.dataLanguageModelPath = `${getBaseURL()}${
        _model.dataLanguageModelPath
    }`;
    _model.modelFile.file.filePath = `${getBaseURL()}${
        _model.modelFile.file.filePath
    }`;
    _model.stateFilePath = `${getBaseURL()}${_model.stateFilePath}`;
    _model.trainingModelPath = `${getBaseURL}${_model.trainingModelPath}`;
    return _model;
}
