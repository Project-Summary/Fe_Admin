import { CreateScriptData, UpdateScriptData } from "@/interface/script.interface";
import API from "../api";

export default class ScriptAPI {

    static getAllScript () {
        return API.get('/scripts/all');
    }

    static createScript(data: CreateScriptData) {
        return API.post(`/scripts`, data);
    }

    static getScriptByMovie(movieId: string) {
        return API.get(`/scripts/movie/${movieId}`);
    }

    static getScriptById(id: string) {
        return API.get(`/scripts/${id}`);
    }

    static updateScript(id: string, updateScriptData: UpdateScriptData) {
        return API.patch(`/scripts/${id}`, updateScriptData);
    }

    static deleteScript(ids: string[]) {
        return API.patch("/scripts/delete", {scriptIds: ids});
    }
}