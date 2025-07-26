import AuthController from './auth/auth.controller';
import CompanyProfileController from './companyProfile/companyProfile.controller';
import UserController from './users/users.controller';

export = [new CompanyProfileController(), new UserController(), new AuthController()];
