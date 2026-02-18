import { NextFunction } from 'express';
import { Request as Request_2 } from 'express';
import { Response as Response_2 } from 'express';
import { Router } from 'express';

export declare function approveHandler(req: Request_2, res: Response_2): Promise<void>;

export declare function cancelHandler(req: Request_2, res: Response_2): Promise<void>;

export declare function completeHandler(req: Request_2, res: Response_2): Promise<void>;

/**
 * Creates an Express router with all Pi payment endpoints.
 *
 * Routes:
 * - POST /pi_payment/approve
 * - POST /pi_payment/complete
 * - POST /pi_payment/cancel
 * - POST /pi_payment/error
 * - POST /pi_payment/incomplete
 *
 * @param options Configuration options for the router
 * @returns Express Router instance
 */
export declare function createPiPaymentRouter(options?: PiPaymentRouterOptions): Router;

export declare function errorHandler(req: Request_2, res: Response_2): Promise<void>;

export declare function getPiServerConfig(): PiServerConfig;

export declare type IncompleteCallback = (paymentId: string, transactionId: string) => Promise<IncompletePaymentDecision> | IncompletePaymentDecision;

export declare function incompleteHandler(req: Request_2, res: Response_2, incompleteCallback?: IncompleteCallback): Promise<void>;

export declare type IncompletePaymentDecision = 'complete' | 'cancel';

export declare type PiPaymentRouterOptions = {
    /**
     * Custom callback for handling incomplete payments.
     * Return 'complete' to complete the payment, or 'cancel' to cancel it.
     * Default: completes all incomplete payments.
     */
    incompleteCallback?: IncompleteCallback;
    /**
     * Custom middleware to run before all routes (e.g., authentication, logging).
     * Applied to all payment routes.
     */
    middleware?: Array<(req: Request_2, res: Response_2, next: NextFunction) => void>;
};

export declare type PiServerConfig = {
    apiUrlBase: string;
    apiVersion: string;
    apiController: string;
    apiKey: string;
};

export declare function postToPiServer(action: string, paymentId: string, body?: any, opts?: PostToPiServerOpts): Promise<any>;

export declare type PostToPiServerOpts = {
    logOk?: (msg: string, res: unknown) => void;
    logFail?: (msg: string, error: unknown, status?: number) => void;
    header?: Record<string, string>;
};

export { }
