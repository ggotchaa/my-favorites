import { RoleType } from 'src/app/api/GCPClient';

export class AccessControlList {
  static readonly snt: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['decline_confirm', [RoleType.SntOperator, RoleType.TCOWarehouse]],
    ['send', [RoleType.SntOperator]],
    ['revoke', [RoleType.SntOperator]],
    ['correction', [RoleType.SntOperator]],
    ['copy', [RoleType.SntOperator]],
    [
      'snt_report',
      [RoleType.SntReadOnly, RoleType.SntOperator, RoleType.TCOWarehouse],
    ],
    ['new', [RoleType.SntReadOnly, RoleType.SntOperator]],
    ['edit', [RoleType.SntOperator, RoleType.SntReadOnly]],
    [
      'show',
      [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse],
    ],
    ['save_draft', [RoleType.SntOperator, RoleType.SntReadOnly]],
    ['import', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.SntReadOnly]]
  ]);

  static readonly form: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    [
      'form_report',
      [RoleType.SntReadOnly, RoleType.SntOperator, RoleType.TCOWarehouse],
    ],
    ['import', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.SntReadOnly]]
  ])

  static readonly formSave: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['MANUFACTURE', [RoleType.SntReadOnly, RoleType.SntOperator]],
    [
      'WRITE_OFF',
      [RoleType.SntReadOnly, RoleType.SntOperator, RoleType.TCOWarehouse],
    ],
    ['MOVEMENT', [RoleType.SntReadOnly, RoleType.SntOperator]],
    ['BALANCE', [RoleType.SntReadOnly, RoleType.SntOperator]],
  ]);
  static readonly formSend: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['MANUFACTURE', [RoleType.SntOperator]],
    ['WRITE_OFF', [RoleType.SntOperator, RoleType.TCOWarehouse]],
    ['MOVEMENT', [RoleType.SntOperator]],
    ['BALANCE', [RoleType.SntOperator]],
  ]);
  static readonly profile: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['all', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers, RoleType.DataImport]],
    ['read_profile', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers]],
    ['save_username', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers]],
    ['save_password', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers]],
    ['upload_auth_ceritificate', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers]],
    ['upload_sign_certificate', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.ApUser, RoleType.ApOperator, RoleType.DaoaUsers]],
    ['manage_certificates', [RoleType.DataImport]]
  ]);

  static readonly balance: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['balance_report', [RoleType.SntReadOnly, RoleType.SntOperator, RoleType.TCOWarehouse]],
    ['import', [RoleType.SntOperator, RoleType.TCOWarehouse, RoleType.SntReadOnly]]
  ]);

  static readonly einvoicing = {
    ar: new Map<string, RoleType[]>([
      ['module_access', [RoleType.ArReadOnly, RoleType.ArReadWrite]],
      ['get_all', [RoleType.ArReadOnly, RoleType.ArReadWrite]],
      ['get_by_id', [RoleType.ArReadOnly, RoleType.ArReadWrite]],
      ['new', [RoleType.ArReadWrite]],
      ['save_draft', [RoleType.ArReadWrite]],
      ['send', [RoleType.ArReadWrite]],
      ['revoke', [RoleType.ArReadWrite]],
      ['get-report', [RoleType.ArReadWrite]]
    ]),

    ap: new Map<string, RoleType[]>([      
      ['module_access', [RoleType.ApUser, RoleType.ApOperator]],
      ['ap_report', [RoleType.ApUser, RoleType.ApOperator]],
      ['ap_recon_comment', [RoleType.ApOperator]]
    ])
  }

  static readonly menu: Map<string, RoleType[]> = new Map<string, RoleType[]>([
    ['auth_ticket_status', [RoleType.SntOperator, RoleType.SntReadOnly, RoleType.TCOWarehouse, RoleType.ArReadWrite, RoleType.DaoaUsers]],
  ]);
}
