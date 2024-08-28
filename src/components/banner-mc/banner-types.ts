export interface BannerProps {
    ally: ALLIES;
    type: string;
    cta: boolean;
    hasCta: boolean;
    hasRedirect: boolean;
    isCheckout: boolean;
    purchaseProducts: string;
    purchaseReference: string;
    purchaseValue: number;
    agreement: AGREEMENT;
  }
  
  export interface BannerState {
    product: QueryParamsRedirectUrl;
    infoBanner: InfoBanner;
    productName: PRODUCT_BDB;
    showBanner: boolean;
    alliedInfo: AlliedInfo;
    isPdp: boolean;
  }
  