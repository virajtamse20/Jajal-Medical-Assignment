import { User, MedicalCase } from '../src/types/index.ts';

export class CasePolicy {
  public static viewAny(user?: User): boolean {
    return !!user;
  }

  public static view(user?: User, _caseItem?: MedicalCase): boolean {
    return !!user;
  }

  public static create(user?: User): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'engineer';
  }

  public static update(user?: User, _caseItem?: MedicalCase): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'engineer';
  }

  public static changeStatus(user?: User, _caseItem?: MedicalCase): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'engineer';
  }

  public static delete(user?: User, _caseItem?: MedicalCase): boolean {
    if (!user) return false;
    // Strict requirement: Only Admin can delete cases. Hiding the button is not enough:
    // the server must block a Viewer (or Engineer) with 403.
    return user.role === 'admin';
  }
}
