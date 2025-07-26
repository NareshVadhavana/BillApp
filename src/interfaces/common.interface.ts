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

export interface TokenDataI {
  token: string;
  expiresIn: number;
}

export interface DataStoredInTokenI {
  _id: string;
}
