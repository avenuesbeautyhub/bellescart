import { Response, NextFunction, Request } from 'express';
import { IPrivacyRequestRepository } from '../providers/interfaces/IPrivacyRequestRepository';
import { AdminRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';
import { UserRepository } from '../repositories/UserRepository';

const logger = createLogger('AdminPrivacyController');

export class AdminPrivacyController {
  private _privacyRequestRepository: IPrivacyRequestRepository;
  private _userRepository: UserRepository;

  constructor(privacyRequestRepository: IPrivacyRequestRepository) {
    this._privacyRequestRepository = privacyRequestRepository;
    this._userRepository = new UserRepository();
  }

  getAllRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 50, skip = 0, status, type } = req.query;
      
      const filter: any = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      
      const requests = await this._privacyRequestRepository.find(filter, {
        limit: Number(limit),
        skip: Number(skip),
        sort: { createdAt: -1 }
      });

      // Enrich requests with user information
      const enrichedRequests = await Promise.all(
        requests.map(async (request: any) => {
          try {
            const user = await this._userRepository.findById(request.userId.toString());
            return {
              ...request.toObject(),
              userName: user?.name || 'Unknown User',
              userEmail: user?.email || 'Unknown Email'
            };
          } catch (error) {
            logger.error('Error fetching user for privacy request', { 
              requestId: request._id, 
              userId: request.userId,
              error 
            });
            return {
              ...request.toObject(),
              userName: 'Unknown User',
              userEmail: 'Unknown Email'
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        data: enrichedRequests,
        count: enrichedRequests.length
      });
    } catch (error) {
      logger.error('Error getting all privacy requests', { error });
      next(error);
    }
  };

  getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({
          success: false,
          error: 'Request ID is required'
        });
        return;
      }

      const request = await this._privacyRequestRepository.findOne({ _id: requestId });

      if (!request) {
        res.status(404).json({
          success: false,
          error: 'Privacy request not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      logger.error('Error getting privacy request by ID', { error });
      next(error);
    }
  };

  getRequestStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get counts by status using find and length
      const pendingRequests = await this._privacyRequestRepository.find({ status: 'pending' });
      const processingRequests = await this._privacyRequestRepository.find({ status: 'processing' });
      const completedRequests = await this._privacyRequestRepository.find({ status: 'completed' });
      const failedRequests = await this._privacyRequestRepository.find({ status: 'failed' });
      const allRequests = await this._privacyRequestRepository.find({});

      res.status(200).json({
        success: true,
        data: {
          total: allRequests.length,
          pending: pendingRequests.length,
          processing: processingRequests.length,
          completed: completedRequests.length,
          failed: failedRequests.length
        }
      });
    } catch (error) {
      logger.error('Error getting privacy request stats', { error });
      next(error);
    }
  };
}
