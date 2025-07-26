export interface CompanyProfileI {
  _id: string;
  companyName: string;
  logoImage: string;
  termsAndConditions: string;
}

export interface UpdateCompanyProfile {
  companyName?: string;
  logoImage?: string;
  termsAndConditions?: string;
}
