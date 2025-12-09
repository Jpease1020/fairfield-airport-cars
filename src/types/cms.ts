// CMS Types
export interface BusinessSettings {
  company: {
    name: string;
    email: string;
    phone: string;
    adminPhone?: string;
    address: string;
    hours: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface CMSPageData {
  [key: string]: string | number | boolean | object;
}

export interface CMSData {
  home?: CMSPageData;
  about?: CMSPageData;
  contact?: CMSPageData;
  booking?: CMSPageData;
  profile?: CMSPageData;
  dashboard?: CMSPageData;
  admin?: CMSPageData;
  [key: string]: CMSPageData | undefined;
}
