import { IPrivacyPreference } from '../../models/PrivacyPreference';
import { IPrivacyRequest, PrivacyRequestStatus } from '../../models/PrivacyRequest';

export interface IPrivacyInteractor {
  getPreferences(userId: string): Promise<IPrivacyPreference>;
  updatePreferences(userId: string, data: Partial<IPrivacyPreference>): Promise<IPrivacyPreference>;
  requestDataExport(userId: string): Promise<IPrivacyRequest>;
  getUserRequests(userId: string): Promise<IPrivacyRequest[]>;
  processExportRequest(requestId: string): Promise<void>;
  getExportData(userId: string, requestId: string): Promise<any>;
}
