import { Observable } from "rxjs";

export interface IActions<CE,D> { 
    onCreate(data: CE): Observable<void>;
    onEdit(data: CE):Observable<void>;
    onDelete(data: D): Observable<void>;
}