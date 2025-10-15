import { RoleType } from "src/app/api/GCPClient";
import { SelectedView } from "../interfaces/ISelectedView";

export const ROLES: SelectedView[] = [
    { value: RoleType.SntReadOnly, viewValue: "Пользователь СНТ"},
    { value: RoleType.SntOperator, viewValue: "СНТ Оператор"},
    { value: RoleType.Admin, viewValue: "Администратор"},
    { value: RoleType.TCOWarehouse, viewValue: "Оператор по складам" },
    { value: RoleType.ApUser, viewValue: "Пользователь AP" },
    { value: RoleType.ApOperator, viewValue: "Бухгалтер AP" },
    { value: RoleType.ArReadOnly, viewValue: "Пользователь AR" },
    { value: RoleType.ArReadWrite, viewValue: "Бухгалтер AR" },
    { value: RoleType.DaoaUsers, viewValue: "Пользователи DAoA" },
    { value: RoleType.DataImport, viewValue: "Импорт данных" }
]
