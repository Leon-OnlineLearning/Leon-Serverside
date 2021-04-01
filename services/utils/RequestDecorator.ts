import { Response } from "express"
/**
 * @description
 * A Decorator (Wrapper) arround the final middleware logic to give it a unified 
 * response format
 * 
 * NOTE: notice the **simple** in the function name. This function is only intended
 * for simple final middlewares that deson't contain various reponse codes if this is 
 * not you case please don't use this function to avoid unexpected results. 
 * 
 * @param res the response object of the last request in the middlewares queue
 * @param responseLogic the special logic that will happen inside the 
 * if responseLogic return a value it will return it as it is otherwise it
 * will return {success:true}, in case of exception will return 
 * {success: false, message: error.message}
 */
const simpleFinalMWDecorator = async (res: Response,
    responseLogic: () => Promise<any>,
    successCode: number = 200,
    errorCode: number = 400) => {
    try {
        const res = await responseLogic()
        if (res == null) {
            res.send({ success: true })
        } else res.status(successCode).send(res)
        return
    } catch (e) {
        res.status(errorCode).send({ success: false, message: e.message })
    }
}

export default simpleFinalMWDecorator;