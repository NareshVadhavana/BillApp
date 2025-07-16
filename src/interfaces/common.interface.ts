import { Router } from 'express';

export interface ControllerI {
  path: string;
  router: Router;
}

export interface APIResponseI {
  status: string;
  statusCode: number;
  message: string;
  data?: any;
}
