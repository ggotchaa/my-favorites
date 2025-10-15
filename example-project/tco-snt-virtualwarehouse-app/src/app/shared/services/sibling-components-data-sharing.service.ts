import { Subject } from "rxjs";

export class SiblingComponentsDataSharing {
    private _isLaoding = new Subject<boolean>();

    setLoaderStatus(isLoading: boolean) {
        this._isLaoding.next(isLoading);
    }

    getLoaderStatus() {
        return this._isLaoding.asObservable();
    }
}